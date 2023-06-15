import type { ObjectHandlerOptions } from '../../types';

export default async function blob(options: ObjectHandlerOptions) {
  options.res.send('Hello World');
}
