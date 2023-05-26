import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { globSync } from 'glob';

import type {
  Workflow,
  WorkflowRunnerInstructions,
} from '@elwood-studio/workflow-types';
import type { JsonObject } from '@elwood-studio/types';
import { resolveWorkflow } from '@elwood-studio/workflow-config';

import { getConfig } from './get-config';

const { dataDir, workflowsDir } = getConfig();

export async function findWorkflow(): Promise<Array<Workflow>> {
  const workflows = [];

  const possibleFolders = [
    '/var/system-workflows',
    join(dataDir, 'workflows'),
    join(dataDir, '.elwood', 'workflows'),
    join(workflowsDir!),
  ];

  const workflowFiles = possibleFolders.reduce((acc, folder) => {
    return acc.concat(
      ...globSync(join(folder, '**', '*.json')),
      ...globSync(join(folder, '**', '*.yaml')),
      ...globSync(join(folder, '**', '*.yml')),
    );
  }, [] as string[]);

  for (const file of workflowFiles) {
    try {
      workflows.push(await resolveWorkflow(await readFile(file, 'utf-8')));
    } catch (_err) {
      // don't do anything if the file doesn't resolve
      // to a workflow.
      // TODO: should probably log an error somewhere
    }
  }

  return workflows;
}
