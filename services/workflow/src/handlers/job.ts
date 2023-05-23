import { randomUUID } from 'node:crypto';
import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood-studio/types';
import {
  createWorkflowInput,
  resolveWorkflow,
} from '@elwood-studio/workflow-config';

import { ServerContext } from '../types';

export type JobHandlerOptions = {
  context: ServerContext;
};

export default fp<JobHandlerOptions>(async (app, opts) => {
  const { boss, db } = opts.context;

  app.post('/job', async (req, res) => {
    const { workflow, input, tracking_id } = req.body as {
      workflow: string;
      input: JsonObject;
      tracking_id?: string;
    };

    const trackingId = tracking_id ?? input.tracking_id ?? randomUUID();

    await boss.send(
      'workflow',
      {
        input: createWorkflowInput(input, { trackingId }),
        workflow: await resolveWorkflow(workflow),
      },
      { singletonKey: trackingId },
    );

    res.send({
      ok: true,
      tracking_id: trackingId,
    });
  });

  app.get('/job/:id', async (req, res) => {
    const { id } = req.params as { id: string };

    const result = await db.executeSql(
      `SELECT output FROM pgboss.job WHERE singletonKey = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      res.status(404);
      res.send({
        ok: false,
        error: `Unable to find job with tracking id: ${id}`,
      });
      return;
    }

    res.send(result.rows[0].output);
  });
});
