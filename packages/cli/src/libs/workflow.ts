import { extname, join } from 'node:path';
import { invariant } from 'ts-invariant';
import fs from 'fs-jetpack';
import Table from 'cli-table';
import * as yaml from 'yaml';
import chalk from 'chalk';

import type { JsonObject } from '@elwood/types';
import type { Workflow } from '@elwood/workflow-types';
import { resolveWorkflow } from '@elwood/workflow-config';

import { OutputReporter } from '../constants.ts';

export async function getWorkflow(
  value: string,
  workingDir: string,
): Promise<Workflow> {
  if (await fs.existsAsync(value)) {
    return resolveWorkflow(await fs.readAsync(value), {
      parseAs: extname(value) as '.yml' | '.yaml' | '.json',
    });
  }

  const possibleFileLocations = [
    join(process.cwd(), value),
    join(workingDir, 'workflows', value),
    join(workingDir, value),
  ];

  for (const file of possibleFileLocations) {
    if (await fs.existsAsync(file)) {
      return await getWorkflow(file, workingDir);
    }
  }

  invariant(
    !['.yml', '.yaml', '.json'].includes(extname(value.toLocaleLowerCase())),
    'Workflow looks like a file path, but does not exist',
  );

  // assume it's a yaml blob
  return resolveWorkflow(value);
}

export function getInput(raw: JsonObject = {}): JsonObject {
  invariant(typeof raw === 'object', 'Input must be an object');
  return raw as JsonObject;
}

export function outputReport(output: OutputReporter, result: JsonObject): void {
  switch (output) {
    case 'json-pretty': {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      break;
    }
    case 'json': {
      process.stdout.write(JSON.stringify(result));
      break;
    }
    case 'yaml': {
      process.stdout.write(yaml.stringify(result));
      break;
    }
    default: {
      process.stdout.write(
        `---------------------------\nRun Result: ${result.status.value} ${result.status.reason}\n---------------------------\n`,
      );

      for (const job of result.jobs) {
        process.stdout.write(`Job: ${chalk.bold(job.name)}\n`);
        process.stdout.write(
          `Result: ${job.status.value} ${job.status.reason}\n`,
        );

        const tbl = new Table({
          head: ['Step', 'Status', 'Output'],
        });

        for (const step of job.steps) {
          tbl.push([
            step.name,
            step.status,
            JSON.stringify(
              {
                output: step.output,
                stdout: step.stdout,
                stderr: step.stderr,
              },
              null,
              2,
            ) ?? '',
          ]);
        }

        console.log(tbl.toString());
      }
    }
  }
}
