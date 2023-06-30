export enum FilePaths {
  LocalBuildDir = './local/.build',
  LocalBuildDockerCompose = './local/.build/docker-compose-local.yml',
  LocalBuildDotEnv = './local/.build/.env',
  LocalBuildLogs = './local/.build',
  LocalDotEnv = './local/.env.local',
  LocalConfig = './local/config.toml',
  Settings = 'settings.toml',
  WorkflowsDir = 'workflows',
  ActionsDir = 'actions',
}

export type OutputReporter = 'table' | 'json' | 'json-pretty' | 'yaml';
