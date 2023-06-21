import type { ObjectHandlerOptions } from '@/types.ts';

export default async function share(options: ObjectHandlerOptions) {
  options.res.send('Hello World');
}
