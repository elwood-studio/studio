import { expandMatrixValues } from '../matrix';

describe('library/matrix', () => {
  test('expandMatrixValues()', () => {
    const matrix1 = {
      a: [1, 2],
      b: [4, 5],
    };

    const matrix2 = {
      a: [1],
      b: [2, 3, 4],
      c: [5],
    };

    expect(expandMatrixValues(matrix1)).toEqual([
      {
        b: 4,
        a: 1,
      },
      {
        b: 5,
        a: 1,
      },
      {
        b: 4,
        a: 2,
      },
      {
        b: 5,
        a: 2,
      },
    ]);

    expect(expandMatrixValues(matrix2)).toEqual([
      {
        a: 1,
        b: 2,
        c: 5,
      },
      {
        a: 1,
        b: 3,
        c: 5,
      },
      {
        a: 1,
        b: 4,
        c: 5,
      },
    ]);
  });
});
