import sodium from 'libsodium-wrappers';
import { unsealKey, unsealSecret } from '../unseal';

describe('unseal', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  test('unsealKey()', async () => {
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    const message = 'pooper';

    const n = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const k = Buffer.from(key);
    const m = Buffer.from(message);

    const v = [
      Buffer.from(sodium.crypto_secretbox_easy(m, n, k)).toString('base64'),
      Buffer.from(n).toString('base64'),
    ].join(':');

    expect.assertions(1);

    expect((await unsealKey(v, Buffer.from(key))).toString()).toEqual(
      Buffer.from(message).toString(),
    );
  });

  test('unsealSecret()', async () => {
    const value = 'poop';
    const pk = sodium.crypto_box_keypair();
    const v = sodium.crypto_box_seal(Buffer.from(value), pk.publicKey);

    expect.assertions(1);

    expect(
      await unsealSecret(
        Buffer.from(v),
        Buffer.from(pk.publicKey),
        Buffer.from(pk.privateKey),
      ),
    ).toEqual(value);
  });
});
