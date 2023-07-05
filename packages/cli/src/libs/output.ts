import Table from 'cli-table';
import * as yaml from 'yaml';
import chalk from 'chalk';

import type { JsonObject, FileSystem } from '@elwood/types';

import { OutputReporter } from '../constants.ts';

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

export function outputTree(
  output: OutputReporter,
  result: FileSystem.TreeResult,
): void {
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
      const tbl = new Table({
        chars: {
          top: ' ',
          'top-mid': '',
          'top-left': '',
          'top-right': '',
          bottom: ' ',
          'bottom-mid': '',
          'bottom-left': '',
          'bottom-right': '',
          left: '├─',
          'left-mid': '',
          mid: '',
          'mid-mid': '',
          right: '',
          'right-mid': '',
          middle: ' ',
        },
        style: {
          'padding-left': 1,
        },
      });

      for (const node of result.children) {
        tbl.push([
          node.type === 'TREE' ? `${chalk.bold(node.name)}/` : node.name,
          node.type === 'BLOB' ? String(node.size) : '',
          node.type === 'BLOB' ? node.mime_type : '',
        ]);
      }

      console.log(tbl.toString());
    }
  }
}
