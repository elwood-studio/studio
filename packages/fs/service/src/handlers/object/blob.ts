import type { ObjectHandlerOptions } from '@/types.ts';

export async function blob(options: ObjectHandlerOptions) {
  switch (options.req.method) {
    case 'POST': {
      return await create(options);
    }
    default: {
      options.res.status(405).send();
    }
  }
}

export async function create(_options: ObjectHandlerOptions): Promise<void> {
  return;
}
