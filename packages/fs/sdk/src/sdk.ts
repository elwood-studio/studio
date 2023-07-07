import type { FileSystem } from '@elwood/types';
import { http } from '@elwood/common';

import type { Fetch, MkdirOptions } from './types.ts';
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

  private _fetch = async (url: RequestInfo | URL, init: RequestInit = {}) => {
    return await this.options.fetch(`${this.options.url}/fs/v1/${url}`, {
      ...init,
      method: init?.method ?? 'get',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  };

  async ls(path: string): Promise<FileSystem.TreeResult> {
    const _path = path === '/' ? '' : path;
    return await http.get<FileSystem.TreeResult>(this._fetch, `tree/${_path}`);
  }

  async stat(path: string): Promise<FileSystem.BlobResult> {
    return await http.get<FileSystem.BlobResult>(this._fetch, `blob/${path}`);
  }

  async copy(src: string, dest: string) {
    return await http.post(this._fetch, `blob/${dest}`, {
      src,
    });
  }

  async mkdir(
    path: string,
    opts: MkdirOptions = {},
  ): Promise<FileSystem.TreeResult> {
    return await http.post<FileSystem.TreeResult>(
      this._fetch,
      `tree/${path}`,
      opts,
    );
  }

  async share(
    path: string,
    input: FileSystem.ShareInput = {},
  ): Promise<FileSystem.ShareResult> {
    return await http.post<FileSystem.ShareResult>(
      this._fetch,
      `share/${path}`,
      input,
    );
  }

  remote(name: string, options: Omit<RemoteOptions, 'fetch'>): Remote {
    return new Remote(name, {
      ...options,
      fetch: this._fetch,
    });
  }
}
