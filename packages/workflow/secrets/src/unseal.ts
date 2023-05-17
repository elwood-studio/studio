import sodium from 'libsodium-wrappers';
import invariant from 'ts-invariant';

export async function unsealSecret(
  value: Buffer,
  publicKey: Buffer,
  secretKey: Buffer,
): Promise<string> {
  invariant(value, 'No value provided to unsealSecret()');
  invariant(publicKey, `No Public Key provided to unsealSecret()`);
  invariant(secretKey, `No Secret Key provided to unsealSecret()`);
  await sodium.ready;
  const m = sodium.crypto_box_seal_open(value, publicKey, secretKey);
  return Buffer.from(m).toString();
}

export async function unsealKey(
  key: string,
  unlockKey: Buffer,
): Promise<Buffer> {
  if (!key.includes(':')) {
    return Buffer.from(key);
  }

  await sodium.ready;

  invariant(unlockKey, `No unlockKey provided"`);

  const [message, nonce] = key.split(':');
  const m = Buffer.from(message, 'base64');
  const n = Buffer.from(nonce, 'base64');
  const k = Buffer.from(unlockKey);
  const v = sodium.crypto_secretbox_open_easy(m, n, k);
  return Buffer.from(v);
}
