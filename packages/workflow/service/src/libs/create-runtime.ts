import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { SecretsManager } from '@elwood/workflow-secrets';
import { WorkflowRunnerRuntime, createRuntime } from '@elwood/workflow-runner';

import { invariant } from './invariant.ts';

export type CreateWorkflowRuntimeOptions = {
  workingDir: string;
  actionsDir: string;
  dataDir: string;
  unlockKey: string;
};

export async function createWorkflowRuntime(
  options: CreateWorkflowRuntimeOptions,
): Promise<[WorkflowRunnerRuntime, SecretsManager]> {
  const { workingDir, actionsDir, dataDir, unlockKey } = options;
  const wd = path.join(workingDir, 'working-dir');

  invariant(unlockKey, 'unlockKey is required');

  await mkdir(wd, { recursive: true });

  const runtime = await createRuntime({
    commandServerPort: 4001,
    workingDir: wd,
    keychainUnlockKey: unlockKey,
    commandContext: 'local',
    context: 'local',
    staticFiles: {
      data: dataDir,
      actions: actionsDir,
    },
    plugins: [],
  });
  const secretsManager = new SecretsManager(Buffer.from(unlockKey, 'base64'));

  return [runtime, secretsManager];
}
