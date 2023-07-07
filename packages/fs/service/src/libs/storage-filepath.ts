import { randomBytes } from 'node:crypto';
import { extname, join } from 'node:path';

export function createStorageFilepath(name: string): string {
  const d = new Date();

  return join(
    d.getFullYear().toString(),
    (d.getMonth() + 1).toString().padStart(2, '0'),
    d.getDate().toString().padStart(2, '0'),
    `${randomBytes(16).toString('hex')}${extname(name)}`,
  );
}
