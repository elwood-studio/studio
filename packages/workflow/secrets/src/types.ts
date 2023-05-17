export interface WorkflowSecretsManager {
  unlockKey: Buffer;
  getKey(id: string): WorkflowSecretsKey;
  getSecret(name: string): WorkflowsSecretsSecret;
  addKey(value: string | WorkflowSecretsKey): Promise<void>;
  addSecret(
    value: string | WorkflowsSecretsSecret,
    sealed?: boolean,
  ): Promise<void>;

  createSecret(
    key: WorkflowSecretsKey,
    name: string,
    value: string,
  ): WorkflowsSecretsSecret;

  createKey(
    id: string,
    publicKey: string | Buffer,
    secretKey: string | Buffer,
  ): WorkflowSecretsKey;
  createKeyPair(id: string): Promise<WorkflowSecretsKey>;
  sealAllSecrets(): Promise<string[]>;
  sealAllKeys(): Promise<string[]>;
}

export interface WorkflowsSecretsSecret {
  name: string;
  value: string;
  unseal(value: string): Promise<void>;
  seal(): Promise<string>;
}

export interface WorkflowSecretsKey {
  readonly id: string;
  publicKey: Buffer;
  secretKey: Buffer;
  unseal(value: string): Promise<void>;
  seal(): Promise<string>;
}
