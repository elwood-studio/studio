import fp from 'fastify-plugin';
import { normalizeWorkflowToInstructions } from '@elwood-studio/workflow-config';

import type { AppContext } from '../types/index.ts';
import { invariant } from '../libs/invariant.ts';
import { findWorkflow } from '../libs/find-workflow.ts';

export type ConfigHandlerOptions = {
  context: AppContext;
};

export default fp<ConfigHandlerOptions>(async (app): Promise<void> => {
  app.get('/config', async (_req, res) => {
    const workflows = await findWorkflow();
    res.send(workflows ?? []);
  });

  app.get('/config/:name', async (req, res) => {
    const { name } = req.params as { name: string };
    const workflows = await findWorkflow();
    res.send(workflows.find((w) => w.name === name) ?? null);
  });

  app.get('/config/:name/resolve', async (req, res) => {
    const { name } = req.params as { name: string };
    const workflows = await findWorkflow();
    const workflow = workflows.find((w) => w.name === name);
    invariant(workflow, `Workflow ${name} not found`);
    res.send(await normalizeWorkflowToInstructions(workflow));
  });
});
