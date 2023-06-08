import { __dirname } from './utils.ts';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from '../../package.json' assert { type: 'json' };

export async function getVersion(): Promise<string> {
  return pkg.version ?? '0';
}
