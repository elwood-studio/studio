import type { ObjectHandlerOptions } from '@/types.ts';

export default async function blob(options: ObjectHandlerOptions) {
  options.res.send('Hello World');
}
