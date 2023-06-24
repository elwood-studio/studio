import type { WorkflowRunnerRuntimeRunJob } from '../types';
import { RunnerStatus } from '../constants';
import { createDockerRuntimeContainer } from '../libs/docker';
import debug from '../libs/debug';
import { getExpressionValue } from '../libs/expression';
import { shouldRunWhen } from '../libs/should-run-when';

const log = debug('run:job');

import { runStep } from './step';

export async function runJob(
  job: WorkflowRunnerRuntimeRunJob,
  waitingStepId: string | undefined = undefined,
): Promise<void> {
  const runtime = job.run.runtime;
  const run = job.run;

  const shouldRun = await shouldRunWhen(job.def.when, async (exp) =>
    getExpressionValue(exp, job.contextValue(), {
      secrets: run.secretsManager,
    }),
  );

  // is if this step should run
  if (shouldRun == false) {
    job.status = RunnerStatus.Skipped;
    return;
  }

  await job.start();

  try {
    // const stageFiles = await run.stageDir.findAsync({
    //   matching: '**/*',
    //   directories: false,
    // });

    // // move everything from the run stage to the
    // // job stage
    // for (const file of stageFiles) {
    //   await run.stageDir.moveAsync(file, job.stageDir.path(file));
    // }

    if (runtime.config.context === 'container') {
      await job.setup(
        await createDockerRuntimeContainer({
          docker: runtime.docker,
          id: run.id,
          image: 'denoland/deno:alpine',
          stageDir: job.stageDir.path(),
          logsDir: job.logsDir.path(),
        }),
      );
    }

    if (runtime.config.context === 'local') {
      await job.setup(null);
    }

    job.status = RunnerStatus.Running;

    // process each step sequentially. if any step fails,
    // we stop processing and return the error immediately
    for (const step of job.steps.values()) {
      log('  step %s started', step.id);

      try {
        if (
          step.status === RunnerStatus.Pending ||
          (step.status === RunnerStatus.Waiting && waitingStepId === step.id)
        ) {
          await runStep(step);
        }

        log('  step %s done %s', step.id, step.status);

        // check to see if the step is waiting
        // for a callback. if it is, we need to set
        // the job as waiting and return back
        if (step.status === RunnerStatus.Waiting) {
          job.status = RunnerStatus.Waiting;
          return;
        }

        // if a step failed, we should stop running this job
        if (step.status === RunnerStatus.Error) {
          job.status = RunnerStatus.Error;
          job.statusText = `Step ${step.name} failed`;
          return;
        }

        step.status = RunnerStatus.Complete;
      } catch (err) {
        log('   err(%o)', err);
      }
    }

    // loop through each step and figure
    // out which files need to be moved from
    // the job stage to the run stage
    // for (const step of job.steps.values()) {
    //   for (const src of step.stageFiles) {
    //     const file = src.startsWith('/') ? `.${src}` : src;
    //     if (job.stageDir.exists(file)) {
    //       await job.run.stageDir.moveAsync(job.stageDir.path(file), file);
    //     }
    //   }
    // }

    // const jobStageFiles = await job.stageDir.findAsync({
    //   matching: '**/*',
    //   directories: false,
    // });

    // for (const file of jobStageFiles) {
    //   await job.stageDir.dirAsync(dirname(file));
    //   await job.stageDir.moveAsync(file, run.stageDir.path(file));
    // }

    job.status = RunnerStatus.Complete;
  } catch (err) {
    job.status = RunnerStatus.Error;
    job.statusText = (err as Error).message;
  }

  try {
    await job.complete();
    await job.teardown();
  } catch (_) {
    return;
  }
}
