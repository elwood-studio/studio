import type { Json, JsonObject } from '@elwood/types';
import type { Fetch } from '../types.ts';
import { invariant } from './invariant.ts';

export async function get<T extends Json = Json>(
  fetch: Fetch,
  info: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(info, { ...init, method: 'GET' });
  invariant(response.ok, 'get(): response is not ok');
  return (await response.json()) as T;
}

export async function post<T extends Json = Json>(
  fetch: Fetch,
  info: RequestInfo | URL,
  body: JsonObject,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(info, {
    ...init,
    body: JSON.stringify(body),
    method: 'POST',
  });
  invariant(response.ok, 'get(): response is not ok');
  return (await response.json()) as T;
}
