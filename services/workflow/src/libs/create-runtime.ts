import {
  SecretsManager,
  createUnlockKey,
} from '@elwood-studio/workflow-secrets';
import {
  WorkflowRunnerRuntime,
  createRuntime,
} from '@elwood-studio/workflow-runner';
import { mkdir } from 'fs/promises';
import path from 'path';

export type CreateWorkflowRuntimeOptions = {
  workingDir: string;
  actionsDir: string;
  dataDir: string;
};

export async function createWorkflowRuntime(
  options: CreateWorkflowRuntimeOptions,
): Promise<[WorkflowRunnerRuntime, SecretsManager]> {
  const { workingDir, actionsDir, dataDir } = options;
  const wd = path.join(workingDir, 'working-dir');

  await mkdir(wd, { recursive: true });

  const keychainUnlockKey = (await createUnlockKey()).toString('base64');
  const runtime = await createRuntime({
    commandServerPort: 4001,
    workingDir: wd,
    keychainUnlockKey,
    commandContext: 'local',
    context: 'local',
    staticFiles: {
      data: dataDir,
      actions: actionsDir,
    },
    plugins: [],
  });
  const secretsManager = new SecretsManager(
    Buffer.from(keychainUnlockKey, 'base64'),
  );

  return [runtime, secretsManager];
}
