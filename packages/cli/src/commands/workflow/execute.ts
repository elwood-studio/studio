import ora from 'ora';
import { invariant } from '@elwood/common';

import { normalizeWorkflowToInstructions } from '@elwood/workflow-config';

import { SecretsManager } from '@elwood/workflow-secrets';
import { createRuntime, runWorkflow } from '@elwood/workflow-runner';

import type {
  Arguments,
  Context,
  WorkflowExecuteOptions,
} from '../../types.ts';
import { getInput, getWorkflow } from '../../libs/workflow.ts';
import { outputReport } from '../../libs/output.ts';

export async function execute(
  args: Arguments<WorkflowExecuteOptions>,
): Promise<void> {
  const context = args.context as Required<Context>;
  const spin = ora('Executing workflow...').start();

  invariant(args.workflow, 'Unlock key is required');

  const unlockKey = context.localEnv.UNLOCK_KEY;
  const input = getInput(args.input ?? []);

  const workflow = await getWorkflow(
    args.workflow,
    context.workingDir.join(''),
  );

  invariant(workflow, `Unable to resolve workflow provider: ${args.workflow}`);

  if (args.force !== false) {
    workflow.when = '*';
  }

  const runtime = await createRuntime({
    commandServerPort: 4001,
    workingDir: context.workingDir.join('runs'),
    keychainUnlockKey: unlockKey,
    commandContext: 'local',
    context: 'local',
    staticFiles: {
      data: context.workingDir.join('data'),
      actions: context.workingDir.join('actions'),
    },
    plugins: [],
  });
  const secretsManager = new SecretsManager(Buffer.from(unlockKey, 'base64'));
  const instructions = await normalizeWorkflowToInstructions(workflow);

  spin.text = 'Starting...';

  runtime.on('runStarted', (o) => {
    spin.text = `Step: ${o.def.id}`;
  });

  const run = await runWorkflow({
    runtime,
    secretsManager,
    instructions,
    input,
    context: {
      event: args.event ?? undefined,
    },
  });

  spin.succeed(`Execution complete!`);
  spin.clear();

  outputReport(args.output ?? 'table', run.report);

  await run.teardown();
  await runtime.teardown();
}
