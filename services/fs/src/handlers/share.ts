import fp from 'fastify-plugin';
import { Client } from 'pg';

export type ShareOptions = {
  db: Client;
};

export default fp<ShareOptions>(async (app, opts) => {
  app.get('/share/:id', async (req, reply) => {
    reply.send('Hello World');
  });
});
