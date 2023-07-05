import type { Json } from '@elwood/types';

export function invariant(
  condition: unknown,
  message: string,
  ErrorType: new (...args: Json[]) => Error = Error,
): asserts condition {
  if (!condition) {
    throw new ErrorType(message);
  }
}
