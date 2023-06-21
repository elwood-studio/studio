import type { WorkflowWhenRunObject } from '@elwood-studio/workflow-types';

import { normalizeWhen, normalizeWhenToExpression } from '../normalize';

describe('normalize', () => {
  /**
   * When
   */
  describe('when', () => {
    describe('normalizeWhenToExpression()', () => {
      test('bool', () => {
        expect(normalizeWhenToExpression(true)).toEqual({
          run: 'expression',
          input: {
            expression: '{%= true %}',
          },
        });

        expect(normalizeWhenToExpression(false)).toEqual({
          run: 'expression',
          input: {
            expression: '{%= false %}',
          },
        });
      });

      test('string', () => {
        expect(normalizeWhenToExpression('foo')).toEqual({
          run: 'expression',
          input: {
            expression: 'foo',
          },
        });
      });

      test('obj', () => {
        const o = { run: 'test', input: { hello: 'world' } };
        expect(normalizeWhenToExpression(o)).toEqual(o);
        expect(normalizeWhenToExpression({ run: o.run })).toEqual({
          run: o.run,
          input: {},
        });
      });

      test('obj throw when no run', () => {
        const o = { run: false, input: { hello: 'world' } };
        expect(() =>
          normalizeWhenToExpression(o as unknown as WorkflowWhenRunObject),
        ).toThrow();
      });

      test('obj throw when not obj', () => {
        expect(() =>
          normalizeWhenToExpression(1 as unknown as WorkflowWhenRunObject),
        ).toThrow();
      });
    });
    describe('normalizeWhen()', () => {
      test('null or undefined', () => {
        expect(normalizeWhen(null)).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression(true)],
        });
        expect(normalizeWhen(undefined)).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression(true)],
        });
      });
      test('boolean', () => {
        expect(normalizeWhen(true)).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression(true)],
        });
        expect(normalizeWhen(false)).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression(false)],
        });
      });
      test('string', () => {
        expect(normalizeWhen('*')).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression(true)],
        });
        expect(normalizeWhen('hello')).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression('hello')],
        });
      });
      test('array', () => {
        expect(normalizeWhen(['a', 'b'])).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression('a'), normalizeWhenToExpression('b')],
        });
      });

      test('object no event', () => {
        expect(normalizeWhen({ all: ['a'] })).toEqual({
          operator: 'and',
          any: [],
          all: [normalizeWhenToExpression('a')],
        });
        expect(normalizeWhen({ any: ['a'] })).toEqual({
          operator: 'and',
          any: [normalizeWhenToExpression('a')],
          all: [],
        });
        expect(normalizeWhen({ all: ['b'], any: ['a'] })).toEqual({
          operator: 'and',
          any: [normalizeWhenToExpression('a')],
          all: [normalizeWhenToExpression('b')],
        });
      });

      test('object with event', () => {
        expect(normalizeWhen({ event: 'b', all: ['a'] })).toEqual({
          operator: 'and',
          any: [],
          all: [
            normalizeWhenToExpression('a'),
            normalizeWhenToExpression('{%= event === "b" %}'),
          ],
        });
        expect(normalizeWhen({ event: ['b', 'c'], all: ['a'] })).toEqual({
          operator: 'and',
          any: [],
          all: [
            normalizeWhenToExpression('a'),
            normalizeWhenToExpression('{%= event === "b" %}'),
            normalizeWhenToExpression('{%= event === "c" %}'),
          ],
        });
      });
    });
  });
});
