import sodium from 'libsodium-wrappers';

import { SecretsManager, createUnlockKey } from '@elwood/workflow-secrets';

import {
  getNativeExpressionValue,
  replaceExpressionTokens,
  isExpressionValueFalseLike,
  runExpressionValue,
} from '../libs/expression';

describe('library/expression', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  test('getNativeExpressionValue() missing context', async () => {
    // expect.assertions(4);
    expect(await getNativeExpressionValue('{%= foo %}', {}, {})).toEqual('');

    expect(
      isExpressionValueFalseLike(
        await getNativeExpressionValue('{%= foo %}', {}, {}),
      ),
    ).toBe(true);

    expect(
      isExpressionValueFalseLike(
        await getNativeExpressionValue('{% foo === "test" %}', {}, {}),
      ),
    ).toEqual(true);

    expect(
      isExpressionValueFalseLike(
        await getNativeExpressionValue('{%= foo === "test" %}', {}, {}),
      ),
    ).toEqual(true);
  });

  test('getNativeExpressionValue() array', async () => {
    expect.assertions(1);
    expect(
      await getNativeExpressionValue('${ foo }', { foo: ['bar'] }, {}),
    ).toEqual(['bar']);
  });

  test('runExpressionValue', async () => {
    expect.assertions(1);

    const result = await runExpressionValue(
      {
        run: 'console.log("poop")',
        input: {},
      },
      {},
      {},
    );

    expect(result).toEqual('poop');
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
