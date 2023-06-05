import fp from 'fastify-plugin';

import { normalizeWorkflowToInstructions } from '@elwood-studio/workflow-config';

import { ServerContext } from '../types';
import { findWorkflow } from '../libs/find-workflow';
import invariant from 'ts-invariant';

export type ConfigHandlerOptions = {
  context: ServerContext;
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
