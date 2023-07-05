import { extname, join } from 'node:path';
import { invariant } from 'ts-invariant';
import fs from 'fs-jetpack';

import type { JsonObject } from '@elwood/types';
import type { Workflow } from '@elwood/workflow-types';
import { resolveWorkflow } from '@elwood/workflow-config';

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
