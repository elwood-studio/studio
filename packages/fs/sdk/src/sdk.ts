import type { FileSystem } from '@elwood/types';
import { http } from '@elwood/common';

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
    });
  }

  async ls(path: string): Promise<FileSystem.TreeResult> {
    return await http.get<FileSystem.TreeResult>(this._fetch, `tree/${path}`);
  }

  async stat(path: string): Promise<FileSystem.BlobResult> {
    return await http.get<FileSystem.BlobResult>(this._fetch, `blob/${path}`);
  }

  async copy(path: string) {
    return await this._fetch(`raw/${path}`);
  }

  async mkdir(path: string): Promise<FileSystem.TreeResult> {
    return await http.post<FileSystem.TreeResult>(
      this._fetch,
      `tree/${path}`,
      {},
    );
  }

  async share(path: string) {
    return await this._fetch(`share/${path}`, {
      method: 'POST',
    });
  }

  remote(name: string, options: Omit<RemoteOptions, 'fetch'>): Remote {
    return new Remote(name, {
      ...options,
      fetch: this._fetch,
    });
  }
}
