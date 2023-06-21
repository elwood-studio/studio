import Emittery from 'emittery';
import * as tus from 'tus-js-client';
import { type Upload, type UploadOptions } from 'tus-js-client';
import crypto from 'crypto-js';

import type { Fetch } from '../types.ts';

export type FileSystemUploadClientFile =
  | Blob
  | File
  | Pick<ReadableStreamDefaultReader<any>, 'read'>;

export type FileSystemUploadClientOptions = {
  url: string;
  key: string;
  getAuthenticationToken(): Promise<string | undefined>;
  fetch: Fetch;
};

export type FileSystemUploadClientAddFileOptions = Omit<
  UploadOptions,
  'endpoint'
>;

type State = {
  upload: Upload;
  id: string;
  state: 'pending' | 'uploading' | 'success' | 'error';
  error?: Error;
  bytesSent?: number;
  bytesTotal?: number;
};

type Events = {
  success: {
    id: string;
    upload: Upload;
  };
  error: {
    id: string;
    upload: Upload;
    error: Error;
  };
  progress: {
    id: string;
    upload: Upload;
    bytesSent: number;
    bytesTotal: number;
  };
  added: {
    id: string;
    upload: Upload;
  };
  started: undefined;
  finished: undefined;
};

export class FileSystemUploadClient extends Emittery<Events> {
  #uploads = new Map<string, State>();

  constructor(private readonly options: FileSystemUploadClientOptions) {
    super();
  }

  #onSuccess = (id: string) => {
    const cur = this.#uploads.get(id);
    this.#uploads.set(id, { id, upload: cur!.upload, state: 'success' });
    this.emit('success', {
      id,
      upload: cur!.upload,
    });
    this.#processNext();
  };

  #onError = (id: string, err: Error) => {
    const cur = this.#uploads.get(id);
    this.#uploads.set(id, {
      id,
      upload: cur!.upload,
      state: 'error',
      error: err,
    });
    this.emit('error', {
      id,
      upload: cur!.upload,
      error: err,
    });
    this.#processNext();
  };

  #onProgress = (id: string, bytesSent: number, bytesTotal: number) => {
    const cur = this.#uploads.get(id);
    this.#uploads.set(id, {
      id,
      upload: cur!.upload,
      state: cur!.state,
      bytesSent,
      bytesTotal,
    });
    this.emit('progress', {
      id,
      upload: cur!.upload,
      bytesSent,
      bytesTotal,
    });
  };

  #processNext() {
    for (const [_, item] of this.#uploads) {
      if (item.state !== 'pending') {
        continue;
      }
      item.upload.start();
      return;
    }

    this.emit('finished');
  }

  async add(
    file: FileSystemUploadClientFile,
    options: FileSystemUploadClientAddFileOptions = {},
  ): Promise<string> {
    const headers: Record<string, string> = { apikey: this.options.key };
    const token =
      (await this.options.getAuthenticationToken()) ?? this.options.key;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const id = crypto
      .MD5(`${Math.random()}-${options.metadata?.name}`)
      .toString();
    const upload = new tus.Upload(file, {
      ...options,
      async fingerprint() {
        return id;
      },
      endpoint: `${this.options.url}/fs/v1/tus`,
      headers,
      onError: (error) => {
        this.#onError(id, error);
      },
      onProgress: (bytesSent, bytesTotal) => {
        this.#onProgress(id, bytesSent, bytesTotal);
      },
      onSuccess: () => {
        this.#onSuccess(id);
      },
    });

    this.#uploads.set(id, {
      id,
      upload,
      state: 'pending',
    });

    this.emit('added', {
      id,
      upload,
    });

    return id;
  }

  async start(): Promise<void> {
    this.emit('started');
    this.#processNext();
  }
}
