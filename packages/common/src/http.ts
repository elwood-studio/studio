import type { Json, JsonObject } from '@elwood/types';
import type { Fetch } from './types.ts';
import { invariant } from './invariant.ts';

export async function get<T extends Json = Json>(
  fetch: Fetch,
  info: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(info, { ...init, method: 'GET' });
  invariant(
    response.ok,
    'get(): response is not ok',
    await wrapHttpError(response),
  );
  return (await response.json()) as T;
}

export async function post<T extends Json = Json>(
  fetch: Fetch,
  info: RequestInfo | URL,
  body: JsonObject = {},
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(info, {
    ...init,
    body: JSON.stringify(body ?? {}),
    method: 'POST',
  });
  invariant(
    response.ok,
    'get(): response is not ok',
    await wrapHttpError(response),
  );
  return (await response.json()) as T;
}

export function provider(fetch: Fetch) {
  return {
    async get(info: RequestInfo | URL, init: RequestInit = {}) {
      return get(fetch, info, init);
    },
    async post(
      info: RequestInfo | URL,
      body: JsonObject,
      init: RequestInit = {},
    ) {
      return post(fetch, info, body, init);
    },
  };
}

export async function wrapHttpError(response: Response) {
  if (response.ok) {
    return Error;
  }

  const _body = await response.json();

  return class HttpError extends Error {
    response: Response;
    status = 0;
    body: JsonObject = {};

    constructor(public readonly message: string) {
      const _message =
        _body?.message ??
        message ??
        `HttpError: ${response.status} ${response.statusText}`;

      super(_message);
      this.message = _message;
      this.response = response;
      this.status = _body?.statusCode ?? response.status;
      this.body = _body;
    }
  };
}
