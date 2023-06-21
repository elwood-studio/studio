import type {
  WorkflowRunnerInstructions,
  WorkflowRunnerInput,
} from '@elwood-studio/workflow-types';
import type { JsonObject } from '@elwood-studio/types';
import { WorkflowSecretsManager } from '@elwood-studio/workflow-secrets';

import type { WorkflowRunnerRuntime, WorkflowRunnerRuntimeRun } from '../types';
import debug from './debug';
import { RunnerStatus } from '../constants';
import { getExpressionValue } from './expression';
import { expandJobMatrixAndAddToRun } from './matrix';
import { runJob } from './run-job';
import { shouldRunWhen } from './should-run-when';

const log = debug('run:workflow');

export type RunWorkflowOptions = {
  runtime: WorkflowRunnerRuntime;
  instructions: WorkflowRunnerInstructions;
  input: WorkflowRunnerInput;
  context?: JsonObject;
  secretsManager?: WorkflowSecretsManager;
  trackingId?: string | null;
};

export async function runWorkflow(
  opts: RunWorkflowOptions,
): Promise<WorkflowRunnerRuntimeRun> {
  const { runtime, instructions, input, secretsManager, context = {} } = opts;
  const run = runtime.addRun(instructions, secretsManager);

  log(`Running workflow with id ${input.eventId}`);
  log(` rootDir: ${run.rootDir.path()}`);
  log(` stageDir: ${run.stageDir.path()}`);
  log(` input: %o`, input);

  try {
    log(' running setup');

    // setup with context
    await run.setup(input, context);

    log(' done setup');

    run.status = RunnerStatus.Running;

    const shouldRun = await shouldRunWhen(instructions.when, (expression) =>
      getExpressionValue(runtime, expression, run.contextValue()),
    );

    // first thing, figure out if we want to run the job
    // if not, we can stop here
    if (shouldRun === false) {
      log(' runner should not run');

      run.status = RunnerStatus.Skipped;

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
