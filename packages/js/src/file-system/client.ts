import Uppy from '@uppy/core';
import Tus from '@uppy/tus';

import { invariant } from '../libs/invariant';
import type {
  FileSystemListInput,
  FileSystemListOutput,
  FileSystemStatInput,
  FileSystemStatOutput,
  Fetch,
} from '../types';
import { FileSystemOperation } from '../constants';

export type FileSystemClientOptions = {
  url: string;
  key: string;
  fetch: Fetch;
};

export class FileSystemClient {
  protected readonly _uppy = new Uppy();

  constructor(private readonly options: FileSystemClientOptions) {
    this._uppy.use(Tus, {
      endpoint: `${this.options.url}/fs/v1/tus`,
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
  private async _fetch<Response extends any = any>(
    operation: FileSystemOperation,
    body?: Record<string, unknown>,
  ): Promise<Response> {
    const response = await this.options.fetch(
      `${this.options.url}/fs/v1/${operation}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'keys=camelcase',
        },
        body: JSON.stringify(body),
      },
    );

    return (await response.json()) as Response;
  }

  /**
   * List files for a remote & path
   * @param input
   * @returns
   */
  async list(input: FileSystemListInput): Promise<FileSystemListOutput> {
    invariant(input.remote, 'fileSystem.list(): remote is required');
    invariant(input.path !== undefined, 'fileSystem.list(): path is required');

    const result = await this._fetch<FileSystemListOutput>(
      FileSystemOperation.List,
      {
        fs: input.remote,
        remote: input.path,
        options: input.options ?? {},
      },
    );

    return {
      ...result,
      remote: input.remote,
    };
  }

  async mkdir() {}

  async delete() {}

  /**
   *
   * @param input
   * @returns
   * @link https://rclone.org/rc/#operations-stat
   */
  async stat(input: FileSystemStatInput): Promise<FileSystemStatOutput> {
    invariant(input.remote, 'fileSystem.stat(): remote is required');
    invariant(input.path !== undefined, 'fileSystem.stat(): path is required');

    return await this._fetch<FileSystemStatOutput>(FileSystemOperation.Stat, {
      fs: input.remote,
      remote: input.path,
      options: input.options ?? {},
    });
  }
}
