export enum EnvName {
  WorkingDir = 'WORKING_DIR',
  DockerSocketPath = 'DOCKER_SOCKET_PATH',
  StdLibHeadBaseUrl = 'STD_LIB_HEAD_BASE_URL',
  StdLibBaseUrl = 'STD_LIB_BASE_URL',
  KeychainDecryptKey = 'KEYCHAIN_DECRYPT_KEY',
}

export type CommandName =
  | 'addFile'
  | 'removeFile'
  | 'setOutput'
  | 'unsetOutput';

export enum Command {
  AddFile = 'addFile',
  RemoveFile = 'removeFile',
  SetOutput = 'setOutput',
  UnsetOutput = 'unsetOutput',
}

export enum ExpressionDataName {
  Secrets = '__secrets',
  Keychain = '__keychain',
  SecretsPublicKey = '__secrets_public_key',
  SecretsSecretKey = '__secrets_secret_key',
}

export enum RunInputVariableName {
  TrackingId = '@id',
  Secrets = '@secrets',
  Keychain = '@keychain',
}

export const RunStepInputPrefix = 'INPUT_';

export enum RunnerStatus {
  Waiting = 'WAITING',
  Pending = 'PENDING',
  Error = 'ERROR',
  Running = 'RUNNING',
  Complete = 'COMPLETE',
  Skipped = 'SKIPPED',
}
