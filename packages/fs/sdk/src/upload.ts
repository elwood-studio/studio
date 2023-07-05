import type { Json } from '@elwood/types';

import Emittery from 'emittery';
import * as tus from 'tus-js-client';
import {
  type Upload as TusUpload,
  type UploadOptions as TusUploadOptions,
} from 'tus-js-client';
import crypto from 'crypto-js';

import type { Fetch } from './types.ts';
import { invariant } from './libs/invariant.ts';

export type UploadFile =
  | Blob
  | File
  | Pick<ReadableStreamDefaultReader<Json>, 'read'>;

export type UploadOptions = {
  url: string;
  key: string;
  getAuthenticationToken(): Promise<string | undefined>;
  fetch: Fetch;
};

export type UploadFileOptions = Omit<TusUploadOptions, 'endpoint'>;

type State = {
  upload: TusUpload;
  id: string;
  state: 'pending' | 'uploading' | 'success' | 'error';
  error?: Error;
  bytesSent?: number;
  bytesTotal?: number;
};

type Events = {
  success: {
    id: string;
    upload: TusUpload;
  };
  error: {
    id: string;
    upload: TusUpload;
    error: Error;
    message: string;
  };
  progress: {
    id: string;
    upload: TusUpload;
    bytesSent: number;
    bytesTotal: number;
  };
  added: {
    id: string;
    upload: TusUpload;
  };
  started: undefined;
  finished: undefined;
};

export class Upload extends Emittery<Events> {
  #uploads = new Map<string, State>();

  constructor(private readonly options: UploadOptions) {
    super();
  }

  getUploadState(id: string): State {
    const cur = this.#uploads.get(id);
    invariant(cur, 'upload not found');
    return cur;
  }

  #onSuccess = (id: string) => {
    const cur = this.getUploadState(id);
    this.#uploads.set(id, { id, upload: cur.upload, state: 'success' });
    this.emit('success', {
      id,
      upload: cur.upload,
    });
    this.#processNext();
  };

  #onError = (id: string, err: Error) => {
    const cur = this.getUploadState(id);
    const e = err as Error & {
      originalResponse: {
        getHeader(name: string): string | null;
      };
    };

    this.#uploads.set(id, {
      id,
      upload: cur.upload,
      state: 'error',
      error: err,
    });
    this.emit('error', {
      id,
      upload: cur.upload,
      error: err,
      message: e.originalResponse.getHeader('upload-error') ?? e.message,
    });
    this.#processNext();
  };

  #onProgress = (id: string, bytesSent: number, bytesTotal: number) => {
    const cur = this.getUploadState(id);
    this.#uploads.set(id, {
      id,
      upload: cur.upload,
      state: cur.state,
      bytesSent,
      bytesTotal,
    });
    this.emit('progress', {
      id,
      upload: cur.upload,
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
    file: UploadFile,
    options: UploadFileOptions = {},
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
