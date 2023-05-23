import * as url from 'url';

export function __filename(meta: any): string {
  return url.fileURLToPath(meta.url);
}

export function __dirname(meta: any): string {
  return url.fileURLToPath(new URL('.', meta.url));
}
