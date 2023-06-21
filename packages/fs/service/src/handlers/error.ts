import { FastifyError, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

type Options = FastifyPluginOptions;

// adapted from https://github.com/jeromemacias/fastify-boom/blob/master/index.js
export default fp<Options>(
  async (fastify, _options) => {
    fastify.setErrorHandler(function errorHandler(err, _request, reply) {
      const error = err as
        | (FastifyError & {
            isBoom?: false;
          })
        | (FastifyError & {
            isBoom: true;
            output: {
              statusCode: number;
              headers: Record<string, string>;
              payload: Record<string, unknown>;
            };
          });

      if (error && error.isBoom) {
        reply
          .code(error.output.statusCode)
          .type('application/json')
          .headers(error.output.headers)
          .send(error.output.payload);

        return;
      }

      reply.send(error || new Error(`Got non-error: ${error}`));
    });
  },
  {
    fastify: '>=0.43',
    name: 'fastify-boom',
  },
);
