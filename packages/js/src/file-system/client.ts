import Uppy from '@uppy/core';
import Tus from '@uppy/tus';

import type { Fetch } from '../types.ts';

export type FileSystemClientOptions = {
  url: string;
  key: string;
  getAuthenticationToken(): Promise<string | undefined>;
  fetch: Fetch;
};

export class FileSystemClient {
  protected readonly _uppy = new Uppy();

  protected authToken: string | undefined;

  constructor(private readonly options: FileSystemClientOptions) {
    this._uppy.use(Tus, {
      endpoint: `${this.options.url}/fs/v1/tus`,
      onBeforeRequest: async (req) => {
        const token = await this.options.getAuthenticationToken();

        if (token) {
          req.setHeader('Authorization', `Bearer ${token}`);
        }
      },
      headers: {
        apikey: this.options.key,
      },
    });
  }

  get upload() {
    return this._uppy;
  }

  /**
   * fetch a response from the file system
   * using the parent fetch method passed in options
   * @param operation
   * @param body
   * @returns
   * @link https://rclone.org/rc/#operations-list
   */
  // private async _fetch<Response extends any = any>(
  //   operation: FileSystemOperation,
  //   body?: Record<string, unknown>,
  // ): Promise<Response> {
  //   const response = await this.options.fetch(
  //     `${this.options.url}/fs/v1/${operation}`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Prefer: 'keys=camelcase',
  //       },
  //       body: JSON.stringify(body),
  //     },
  //   );

  //   return (await response.json()) as Response;
  // }
}
