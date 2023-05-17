import type {
  WorkflowRunnerInstructions,
  WorkflowRunnerInput,
} from '@elwood-studio/workflow-types';
import { WorkflowSecretsManager } from '@elwood-studio/workflow-secrets';

import type { WorkflowRunnerRuntime, WorkflowRunnerRuntimeRun } from '../types';

import debug from './debug';
import { RunnerStatus } from '../constants';
import { CommandProvider } from '../command/provider';
import { getExpressionValue } from './expression';
import { expandJobMatrixAndAddToRun } from './matrix';
import { runJob } from './run-job';

const log = debug('run:workflow');

export type RunWorkflowOptions = {
  runtime: WorkflowRunnerRuntime;
  instructions: WorkflowRunnerInstructions;
  input: WorkflowRunnerInput;
  secretsManager?: WorkflowSecretsManager;
  trackingId?: string | null;
};

export async function runWorkflow(
  opts: RunWorkflowOptions,
): Promise<WorkflowRunnerRuntimeRun> {
  const {
    runtime,
    instructions,
    input,
    secretsManager,
    trackingId = null,
  } = opts;
  const run = runtime.addRun(instructions, secretsManager);

  log(`Running workflow with id ${input.eventId}`);
  log(` rootDir: ${run.rootDir.path()}`);
  log(` stageDir: ${run.stageDir.path()}`);
  log(` input: %o`, input);

  try {
    log(' running setup');

    await run.setup(input, trackingId);

    log(' done setup');

    // first add all of the command providers they requested
    if (instructions.commands) {
      log(' setting up commands');

      for (const cmd of instructions.commands) {
        log('  command: %s', cmd.name);

        const values: string[] = [];

        for (const key of Object.keys(cmd.env)) {
          const value = await getExpressionValue(
            runtime,
            cmd.env[key],
            run.contextValue(),
            {
              secrets: run.secretsManager,
            },
          );
          values.push(`${key.toUpperCase()}=${value}`);
        }

        await run.addCommandProvider(new CommandProvider(cmd, values));
      }
    }

    run.status = RunnerStatus.Running;

    // first thing, figure out if we want to run the job
    // if not, we can stop here
    const shouldStop = (
      await Promise.all(
        instructions.when.map(async (when) => {
          return (
            (await getExpressionValue(runtime, when, run.contextValue())) ??
            false
          );
        }),
      )
    ).find((value) => value === false);

    if (shouldStop !== undefined) {
      log(' runner should not run');
      await run.teardown();
      return run;
    }

    await run.start();

    log(' ready to add jobs');

    for (const def of instructions.jobs) {
      // if there is no matrix, we can just continue
      // on with the job as normal
      if (Object.keys(def.matrix).length === 0) {
        log(' add job %s', def.name);
        run.addJob(def);
        continue;
      }

      log(' expanding matrix for %s', def.name);

      // expand out each matrix job and add it to
      // the run
      await expandJobMatrixAndAddToRun(runtime, run, def);
    }

    await startRunWorkflow(run);
    await run.complete();
  } catch (err) {
    log(' err(%o)', err);
    await run.complete(RunnerStatus.Error, (err as Error).message);
  }

  await run.teardown();

  return run;
}

export async function startRunWorkflow(
  run: WorkflowRunnerRuntimeRun,
  waitingStepId: string | undefined = undefined,
): Promise<void> {
  log(' starting workflow run');

  try {
    // now run each job. the jobs will come back in the
    // correct order, so just run them this way
    for (const job of run.jobs.values()) {
      if (job.status === RunnerStatus.Pending) {
        await runJob(job, waitingStepId);
      }

      if (job.status === RunnerStatus.Waiting) {
        run.status = RunnerStatus.Waiting;
        return;
      }
    }

    run.status = RunnerStatus.Complete;
  } catch (err) {
    log(' err(%o)', err);

    run.status = RunnerStatus.Error;
    run.statusText = (err as Error).message;
  }
}
