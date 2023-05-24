import type { Fetch } from '../types.ts';
import { FileSystemUploadClient } from './upload.ts';

export type FileSystemClientOptions = {
  url: string;
  key: string;
  getAuthenticationToken(): Promise<string | undefined>;
  fetch: Fetch;
};

export class FileSystemClient {
  private readonly _upload;

  protected authToken: string | undefined;

  constructor(private readonly options: FileSystemClientOptions) {
    this._upload = new FileSystemUploadClient(options);
  }

  get upload() {
    return this._upload;
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
