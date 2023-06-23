import type { Fetch } from './types.ts';
export type RemoteOptions = {
  fetch: Fetch;
};

export class Remote {
  constructor(
    private readonly name: string,
    private readonly options: RemoteOptions,
  ) {}
}
