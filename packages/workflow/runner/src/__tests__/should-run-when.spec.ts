import {
  shouldRunWhen,
  type ShouldRunWhenGetExpressionValue,
} from '../libs/should-run-when';

const _getExpressionValue: ShouldRunWhenGetExpressionValue = async function (
  expr,
) {
  return expr.input.expression;
};

describe('libs/should-run-when', () => {
  test('all with true', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          any: [],
          all: [
            { run: 'expression', input: { expression: true } },
            { run: 'expression', input: { expression: true } },
          ],
        },
        _getExpressionValue,
      ),
    ).toBe(true);
  });
  test('all with false', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          any: [],
          all: [
            { run: 'expression', input: { expression: true } },
            { run: 'expression', input: { expression: false } },
          ],
        },
        _getExpressionValue,
      ),
    ).toBe(false);
  });
  test('any with false', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          all: [],
          any: [{ run: 'expression', input: { expression: false } }],
        },
        _getExpressionValue,
      ),
    ).toBe(false);
  });
  test('any with true', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          all: [],
          any: [
            { run: 'expression', input: { expression: false } },
            { run: 'expression', input: { expression: true } },
          ],
        },
        _getExpressionValue,
      ),
    ).toBe(true);
  });
  test('all true any false', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          all: [{ run: 'expression', input: { expression: true } }],
          any: [{ run: 'expression', input: { expression: false } }],
        },
        _getExpressionValue,
      ),
    ).toBe(false);
  });
  test('all true any true', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          all: [{ run: 'expression', input: { expression: true } }],
          any: [{ run: 'expression', input: { expression: true } }],
        },
        _getExpressionValue,
      ),
    ).toBe(true);
  });
  test('all false any true', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          all: [{ run: 'expression', input: { expression: false } }],
          any: [{ run: 'expression', input: { expression: true } }],
        },
        _getExpressionValue,
      ),
    ).toBe(false);
  });
  test('all false any false', async () => {
    expect.assertions(1);

    expect(
      await shouldRunWhen(
        {
          operator: 'and',
          all: [{ run: 'expression', input: { expression: false } }],
          any: [{ run: 'expression', input: { expression: false } }],
        },
        _getExpressionValue,
      ),
    ).toBe(false);
  });
});
