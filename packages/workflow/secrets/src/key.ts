import invariant from 'ts-invariant';
import type { WorkflowSecretsManager, WorkflowSecretsKey } from './types';
import { unsealKey } from './unseal';
import { sealKey } from './seal';

export class Key implements WorkflowSecretsKey {
  #id: string | null = null;
  #publicKey: Buffer | null = null;
  #secretKey: Buffer | null = null;
  #locked = false;

  constructor(private readonly manager: WorkflowSecretsManager) {}

  async unseal(value: string) {
    const [id, pk, sk] = JSON.parse(value) as [string, string, string];
    this.#id = id;
    this.#publicKey = await unsealKey(pk, this.manager.unlockKey);
    this.#secretKey = await unsealKey(sk, this.manager.unlockKey);
    this.#locked = true;
  }

  async seal() {
    return JSON.stringify([
      this.id,
      await sealKey(this.publicKey, this.manager.unlockKey),
      await sealKey(this.secretKey, this.manager.unlockKey),
    ]);
  }

  get id() {
    invariant(this.#id, 'No key id');
    return this.#id;
  }

  get publicKey() {
    invariant(this.#publicKey, 'No public key');
    return this.#publicKey;
  }

  get secretKey() {
    invariant(this.#secretKey, 'No secret key');
    return this.#secretKey;
  }

  set id(id: string) {
    invariant(this.#locked === false, 'Cannot set id after sealing');
    this.#id = id;
  }

  set publicKey(publicKey: Buffer) {
    invariant(this.#locked === false, 'Cannot set public key after sealing');
    this.#publicKey = publicKey;
  }

  set secretKey(secretKey: Buffer) {
    invariant(this.#locked === false, 'Cannot set secret key after sealing');
    this.#secretKey = secretKey;
  }
}
