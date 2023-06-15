import type { ObjectHandlerOptions } from '../../types';

export default async function share(options: ObjectHandlerOptions) {
  options.res.send('Hello World');
}
