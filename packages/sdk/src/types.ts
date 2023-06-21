export * from '@elwood-studio/types';

export type Fetch = typeof fetch;
export type FileSystemFetch = <R = unknown>(
  operation: string,
  body: Record<string, unknown>,
) => Promise<R>;
