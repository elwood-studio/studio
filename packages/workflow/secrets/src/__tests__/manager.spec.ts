import sodium from 'libsodium-wrappers';
import { Manager } from '../manager';

describe('manager', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  test('create()', async () => {
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);

    const manager = new Manager(Buffer.from(key));

    expect(manager.unlockKey).toEqual(Buffer.from(key));
  });

  test('e2e', async () => {
    const unlock = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    const manager = new Manager(Buffer.from(unlock));
    const key = await manager.createKeyPair('root');

    expect.assertions(1);

    manager.addKey(key);
    manager.addSecret(manager.createSecret(key, 'text', 'poop'));

    expect(manager.getSecret('text').value).toEqual('poop');
  });
});
