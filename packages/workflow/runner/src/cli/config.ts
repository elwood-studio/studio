import { join } from 'path';

import { exists, tmpDir } from 'fs-jetpack';

import { createUnlockKey } from '@elwood-studio/workflow-secrets';

import type {
  WorkflowRunnerCliArguments,
  WorkflowRunnerConfiguration,
} from '../types';

export type ResolveConfigOptions = {
  unlockKey?: string;
  homeDir: string;
};

export async function resolveConfig(
  argv: WorkflowRunnerCliArguments,
  opts: ResolveConfigOptions,
): Promise<WorkflowRunnerConfiguration> {
  const { homeDir, unlockKey } = opts;

  if (argv.config) {
    return require(argv.config) as WorkflowRunnerConfiguration;
  }

  if (process.env.WORKFLOW_RUNNER_CONFIG) {
    return require(process.env
      .WORKFLOW_RUNNER_CONFIG) as WorkflowRunnerConfiguration;
  }

  if (exists(join(homeDir, 'workflow-runner/config.js'))) {
    return require(join(
      homeDir,
      'workflow-runner/config.js',
    )) as WorkflowRunnerConfiguration;
  }

  const staticFiles: WorkflowRunnerConfiguration['staticFiles'] = {};

  // map on static files
  if (argv.staticFiles) {
    const _staticFiles = Array.isArray(argv.staticFiles)
      ? argv.staticFiles
      : [argv.staticFiles];

    for (const file of _staticFiles) {
      if (file.includes(':')) {
        const [path, fileLocation] = file.split(':');
        staticFiles[path] = fileLocation;
      }
    }
  }

  return {
    dockerSocketPath: argv.dockerSocket,
    commandServerPort: argv.commandPort ?? 4001,
    workingDir: argv.workingDir ?? tmpDir().path(),
    keychainUnlockKey:
      unlockKey ??
      argv.keychainUnlockKey ??
      (await createUnlockKey()).toString('base64'),
    stdLibBaseUrl: argv.stdLibUrl,
    stdLibHeadUrl: argv.stdLibUrl,
    registryUrl: argv.registryUrl,
    commandContext: argv.commandContext,
    context: argv.context,
    staticFiles,
  };
}
