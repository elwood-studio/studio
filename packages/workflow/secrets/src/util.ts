import sodium from 'libsodium-wrappers';

export async function createUnlockKey(): Promise<Buffer> {
  await sodium.ready;
  return Buffer.from(sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES));
}

export async function createKeyPair(): Promise<[Buffer, Buffer]> {
  await sodium.ready;
  const pk = sodium.crypto_box_keypair();
  return [Buffer.from(pk.publicKey), Buffer.from(pk.privateKey)];
}
