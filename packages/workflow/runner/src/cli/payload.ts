import { dirname, extname, isAbsolute, join } from 'path';
import { existsSync } from 'fs';

import { resolveWorkflowNameOrFileToWorkflow } from '@elwood/workflow-config';

import type { WorkflowCliPayload } from '../types';
import * as helloWorld from './hello-world';
import debug from '../libs/debug';

type ModOption = WorkflowCliPayload | (() => Promise<WorkflowCliPayload>);
type ModWithDefault = { default: ModOption };
type Mod = ModOption | ModWithDefault;

const log = debug('cli:payload');

export async function resolveWorkflowPayload(
  possibleFile: string,
): Promise<WorkflowCliPayload> {
  const { stdin, cwd } = process;
  const workingDir = process.env.INIT_CWD ?? cwd();

  log(`resolveWorkflowPayload("${possibleFile}")`);
  log(` workingDir=${workingDir}`);

  if (possibleFile === 'hello-world') {
    return helloWorld;
  }

  if (!stdin.isTTY) {
    log(' reading from stdin');

    const result = [];
    let length = 0;

    for await (const chunk of stdin) {
      result.push(chunk);
      length += chunk.length;
    }

    return JSON.parse(Buffer.concat(result, length).toString());
  }

  if (isAbsolute(possibleFile)) {
    log(' is absolute path');

    function addMetaToWorkflow(
      payload: WorkflowCliPayload,
    ): WorkflowCliPayload {
      return {
        ...payload,
        workflow: {
          ...payload.workflow,
          meta: {
            cwd: dirname(possibleFile),
            filePath: possibleFile,
          },
        },
      };
    }

    switch (extname(possibleFile)) {
      case '.ts':
        require('ts-node').register();
        return addMetaToWorkflow(await resolveModule(require(possibleFile)));

      case '.js':
        return addMetaToWorkflow(await resolveModule(require(possibleFile)));

      default:
        return {
          workflow: await resolveWorkflowNameOrFileToWorkflow(
            possibleFile,
            workingDir,
          ),
        };
    }
  }

  if (existsSync(join(workingDir, possibleFile))) {
    log(' is relative path');
    return await resolveWorkflowPayload(join(workingDir, possibleFile));
  }

  log(' nothing found');

  throw new Error('No workflow found');
}

export async function resolveModule(mod: Mod): Promise<WorkflowCliPayload> {
  if (typeof (mod as ModWithDefault).default !== 'undefined') {
    return resolveModule((mod as ModWithDefault).default);
  }

  if (typeof mod === 'function') {
    return await mod();
  }

  return mod as WorkflowCliPayload;
}
