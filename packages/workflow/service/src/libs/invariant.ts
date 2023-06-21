import type { Json } from '@elwood-studio/types';

const genericMessage = 'Invariant Violation';
const {
  setPrototypeOf = function (obj: Json, proto: Json) {
    obj.__proto__ = proto;
    return obj;
  },
} = Object as Json;

export class InvariantError extends Error {
  framesToPop = 1;
  name = genericMessage;
  constructor(message: string | number = genericMessage) {
    super(
      typeof message === 'number'
        ? `${genericMessage}: ${message} (see https://github.com/apollographql/invariant-packages)`
        : message,
    );
    setPrototypeOf(this, InvariantError.prototype);
  }
}

export function invariant(
  condition: Json,
  message?: string | number,
): asserts condition {
  if (!condition) {
    throw new InvariantError(message);
  }
}
