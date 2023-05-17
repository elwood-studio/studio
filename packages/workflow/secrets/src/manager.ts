import invariant from 'ts-invariant';
import sodium from 'libsodium-wrappers';

import type {
  WorkflowSecretsManager,
  WorkflowsSecretsSecret,
  WorkflowSecretsKey,
} from './types';

import { Secret } from './secret';
import { Key } from './key';

export class Manager implements WorkflowSecretsManager {
  readonly #secrets: Map<string, WorkflowsSecretsSecret> = new Map();
  readonly #keys: Map<string, WorkflowSecretsKey> = new Map();

  constructor(readonly unlockKey: Buffer) {
    invariant(
      unlockKey.byteLength >= sodium.crypto_secretbox_NONCEBYTES,
      `The unlockKey is too short. It must be at least ${sodium.crypto_secretbox_NONCEBYTES} bytes long.`,
    );
  }

  createSecret(
    key: WorkflowSecretsKey,
    name: string,
    value: string,
  ): WorkflowsSecretsSecret {
    const secret = new Secret(this);
    secret.key = key;
    secret.name = name;
    secret.value = value;
    return secret;
  }
  createKey(
    id: string,
    publicKey: string | Buffer,
    secretKey: string | Buffer,
  ): WorkflowSecretsKey {
    const key = new Key(this);
    key.id = id;
    key.publicKey =
      typeof publicKey === 'string'
        ? Buffer.from(publicKey, 'base64')
        : publicKey;
    key.secretKey =
      typeof secretKey === 'string'
        ? Buffer.from(secretKey, 'base64')
        : secretKey;

    return key;
  }

  async createKeyPair(id: string): Promise<WorkflowSecretsKey> {
    await sodium.ready;
    const pk = sodium.crypto_box_keypair();

    return this.createKey(
      id,
      Buffer.from(pk.publicKey).toString('base64'),
      Buffer.from(pk.privateKey).toString('base64'),
    );
  }

  async addKey(value: string | WorkflowSecretsKey): Promise<void> {
    if (typeof value === 'string') {
      const key = new Key(this);
      await key.unseal(value);
      return this.addKey(key);
    }
    this.#keys.set(value.id, value);
  }

  async addSecret(
    value: string | WorkflowsSecretsSecret,
    _sealed: boolean = false,
  ): Promise<void> {
    if (typeof value === 'string') {
      const secret = new Secret(this);
      await secret.unseal(value);
      return await this.addSecret(secret);
    }
    this.#secrets.set(value.name, value);
  }

  getKey(id: string) {
    invariant(this.#keys.has(id), 'No key with id');
    return this.#keys.get(id) as WorkflowSecretsKey;
  }

  getSecret(name: string) {
    invariant(this.#secrets.has(name), `No secret with ${name}`);
    return this.#secrets.get(name) as WorkflowsSecretsSecret;
  }

  async sealAllSecrets(): Promise<string[]> {
    return await Promise.all(
      Array.from(this.#secrets.values()).map(async (item) => {
        return await item.seal();
      }),
    );
  }

  async sealAllKeys(): Promise<string[]> {
    return await Promise.all(
      Array.from(this.#keys.values()).map(async (item) => {
        return await item.seal();
      }),
    );
  }
}
