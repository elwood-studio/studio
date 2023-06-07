import fp from 'fastify-plugin';

type Options = unknown;

// adapted from https://github.com/jeromemacias/fastify-boom/blob/master/index.js
export default fp<Options>(
  (fastify, _options, next) => {
    fastify.setErrorHandler(function errorHandler(error, _request, reply) {
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

    next();
  },
  {
    fastify: '>=0.43',
    name: 'fastify-boom',
  },
);
