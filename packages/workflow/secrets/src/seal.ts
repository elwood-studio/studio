import sodium from 'libsodium-wrappers';
import invariant from 'ts-invariant';

export async function sealKey(
  value: Buffer,
  unlockKey: Buffer,
): Promise<string> {
  invariant(value, 'No value provided to sealKey()');
  invariant(unlockKey, `No unlockKey provided to sealKey()`);

  await sodium.ready;

  const k = unlockKey;
  const m = value;
  const n = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = Buffer.from(sodium.crypto_secretbox_easy(m, n, k));

  return [
    ciphertext.toString('base64'),
    Buffer.from(n).toString('base64'),
  ].join(':');
}

export async function sealSecret(value: string, pk: Buffer): Promise<string> {
  invariant(value, 'No value provided to sealKey()');
  invariant(pk, `No Public Key provided to sealKey()`);

  const v = sodium.crypto_box_seal(Buffer.from(value), pk);
  return Buffer.from(v).toString('base64');
}
