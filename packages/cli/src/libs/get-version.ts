import { readPackageUp } from 'read-pkg-up';

import { __dirname } from './utils.ts';

export async function getVersion(): Promise<string> {
  const pkg = await readPackageUp({ cwd: __dirname(import.meta) });
  return pkg?.packageJson.version ?? '0';
}
