import {
  SecretsManager,
  createUnlockKey,
} from '@elwood-studio/workflow-secrets';
import {
  WorkflowRunnerRuntime,
  createRuntime,
} from '@elwood-studio/workflow-runner';

export type CreateWorkflowRuntimeOptions = {
  workingDir: string;
  dataDir: string;
};

export async function createWorkflowRuntime(
  options: CreateWorkflowRuntimeOptions,
): Promise<[WorkflowRunnerRuntime, SecretsManager]> {
  const { workingDir, dataDir } = options;

  const keychainUnlockKey = (await createUnlockKey()).toString('base64');
  const runtime = await createRuntime({
    commandServerPort: 4001,
    workingDir,
    keychainUnlockKey,
    commandContext: 'local',
    context: 'local',
    staticFiles: {
      data: dataDir,
    },
    plugins: [],
  });
  const secretsManager = new SecretsManager(
    Buffer.from(keychainUnlockKey, 'base64'),
  );

  return [runtime, secretsManager];
}
