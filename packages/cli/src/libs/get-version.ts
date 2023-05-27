import { __dirname } from './utils.ts';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { version } from '../../package.json';

export async function getVersion(): Promise<string> {
  return version ?? '0';
}
