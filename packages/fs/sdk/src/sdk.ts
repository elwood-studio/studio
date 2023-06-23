import type { Fetch } from './types.ts';
import { Upload } from './upload.ts';
import { Remote, RemoteOptions } from './remote.ts';

export type ElwoodFileSystemSdkOptions = {
  url: string;
  key: string;
  getAuthenticationToken(): Promise<string | undefined>;
  fetch: Fetch;
};

export class ElwoodFileSystemSdk {
  private readonly _upload: Upload;

  constructor(private readonly options: ElwoodFileSystemSdkOptions) {
    this._upload = new Upload(options);
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
  private async _fetch(
    url: RequestInfo | URL,
    init: RequestInit = {},
  ): Promise<Response> {
    return await this.options.fetch(`${this.options.url}/fs/v1/${url}`, {
      method: init?.method ?? 'get',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
  }

  async ls(path: string) {
    return await this._fetch(`tree/${path}`);
  }

  async stat(path: string) {
    return await this._fetch(`blob/${path}`);
  }

  async raw(path: string) {
    return await this._fetch(`raw/${path}`);
  }

  async mkdir(path: string) {
    return await this._fetch(`tree/${path}`, {
      method: 'POST',
    });
  }

  async share(path: string) {
    return await this._fetch(`share/${path}`, {
      method: 'POST',
    });
  }

  async remote(name: string, options: Omit<RemoteOptions, 'fetch'>) {
    return new Remote(name, {
      ...options,
      fetch: this._fetch,
    });
  }
}
