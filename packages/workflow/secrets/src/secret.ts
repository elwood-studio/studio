import {
  WorkflowSecretsKey,
  WorkflowSecretsManager,
  WorkflowsSecretsSecret,
} from './types';
import { unsealSecret } from './unseal';
import { sealSecret } from './seal';
import invariant from 'ts-invariant';

enum Status {
  Sealed,
  Unsealed,
}

export class Secret implements WorkflowsSecretsSecret {
  #name: string | null = null;
  #value: string | null = null;
  #key: WorkflowSecretsKey | null = null;

  #status: Status = Status.Unsealed;

  constructor(private readonly manager: WorkflowSecretsManager) {}

  get name(): string {
    invariant(this.#name, 'Secret name is not set');
    return this.#name;
  }

  get value() {
    invariant(this.#value, 'Secret value is not set');
    return this.#value;
  }

  get key() {
    invariant(this.#key, 'No key');
    return this.#key;
  }

  set name(value: string) {
    this.#name = value;
  }

  set value(value: string) {
    this.#value = value;
  }

  set key(key: WorkflowSecretsKey) {
    this.#key = key;
  }

  async unseal(value: string) {
    const [name, keyId, encryptedSecretValue] = JSON.parse(value) as [
      string,
      string,
      string,
    ];

    invariant(name, 'Secret name is not set');
    invariant(keyId, 'Secret key is not set');
    invariant(encryptedSecretValue, 'Secret value is not set');

    this.#key = this.manager.getKey(keyId);
    this.#name = name;
    this.#value = await unsealSecret(
      Buffer.from(encryptedSecretValue, 'base64'),
      this.#key.publicKey,
      this.#key.secretKey,
    );
    this.#status = Status.Unsealed;
  }

  async seal() {
    return JSON.stringify([
      this.name,
      this.key.id,
      await sealSecret(this.value, this.key.publicKey),
    ]);
  }
}
