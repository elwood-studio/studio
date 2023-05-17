import sodium from 'libsodium-wrappers';

import {
  SecretsManager,
  createUnlockKey,
} from '@elwood-studio/workflow-secrets';

import {
  getNativeExpressionValue,
  replaceExpressionTokens,
} from '../expression';

describe('library/expression', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  test('getNativeExpressionValue() array', async () => {
    expect.assertions(1);
    expect(
      await getNativeExpressionValue('${ foo }', { foo: ['bar'] }, {}),
    ).toEqual(['bar']);
  });

  test('replaceExpressionTokens()', async () => {
    const j = {
      bar: {
        foo: true,
      },
    };

    expect.assertions(2);
    expect(
      await replaceExpressionTokens('{%= foo %}', { foo: 'bar' }, {}),
    ).toEqual('bar');

    expect(await replaceExpressionTokens('{%= toJson(bar) %}', j, {})).toEqual(
      JSON.stringify(j.bar),
    );
  });

  test('replaceExpressionTokens() with secrets', async () => {
    const text = 'this is secret';

    const secrets = new SecretsManager(await createUnlockKey());
    const kp = await secrets.createKeyPair('test');
    const key = secrets.createKey('test', kp.publicKey, kp.secretKey);

    secrets.addSecret(secrets.createSecret(key, 'bar', text));

    expect.assertions(1);
    expect(
      await replaceExpressionTokens('{%= secret("bar") %}', {}, { secrets }),
    ).toEqual(text);
  });
});
