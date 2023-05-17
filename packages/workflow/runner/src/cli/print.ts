import { EOL } from 'os';
import { inspect } from 'util';

import type {
  WorkflowRunnerRuntimeRun,
  WorkflowRunnerCliArguments,
} from '../types';

export function printResult(
  run: WorkflowRunnerRuntimeRun,
  argv: WorkflowRunnerCliArguments,
) {
  if (argv.report) {
    process.stdout.write(inspect(run.report, true, 10, true));
    process.stdout.write(EOL);
    return;
  }

  if (argv.reportJson) {
    process.stdout.write(JSON.stringify(run.report));
    return;
  }

  run.report.jobs.forEach((job) => {
    job.steps.forEach((step) => {
      if (step.stdout.length === 0) {
        process.stdout.write(`[${job.name}.${step.name}.stdout]: (no output)`);
      }

      step.stdout.forEach((line) => {
        process.stdout.write(`[${job.name}.${step.name}.stdout]: ${line}`);
        process.stdout.write(EOL);
      });

      step.stderr.forEach((line) => {
        process.stdout.write(`[${job.name}.${step.name}.stderr]: ${line}`);
        process.stdout.write(EOL);
      });
    });
  });
}
