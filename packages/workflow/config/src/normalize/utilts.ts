import { randomBytes } from 'crypto';
import { v4 as randomUUID } from 'uuid';

export function uid(prefix: string): string {
  return [
    prefix,
    '0',
    randomUUID().replace(/-/g, ''),
    randomBytes(10).toString('hex').substring(0, 2),
  ]
    .join('')
    .toUpperCase();
}
