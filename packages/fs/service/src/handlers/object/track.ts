import type { ObjectHandlerOptions } from '@/types.ts';

export default async function track(options: ObjectHandlerOptions) {
  options.res.send('Hello World');
}
