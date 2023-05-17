import invariant from 'ts-invariant';
import { v4 as uuid } from 'uuid';

import type { JsonObject } from '@elwood-studio/types';
import { runWorkflow } from '@elwood-studio/workflow-runner';
import { SecretsManager } from '@elwood-studio/workflow-secrets';
import {
  resolveWorkflow,
  normalizeWorkflowToInstructions,
  validateWorkflowInput,
  type ResolveWorkflowOptions,
} from '@elwood-studio/workflow-config';
import type { WorkflowRunnerInstructions } from '@elwood-studio/workflow-types';

import type {
  WorkflowServerRunInput,
  WorkflowHandlerResponse,
  WorkflowHandlerRequest,
} from '../types';
import { findRunByTrackingId } from '../libs/find-run';

export default async function handler(
  req: WorkflowHandlerRequest,
): Promise<WorkflowHandlerResponse> {
  const { id } = req.params as { id?: string };
  const body = req.body as WorkflowServerRunInput;
  const runtime = req.context.runtime;
  console.log('request.run(%o)', body);

  invariant(
    body.instructions || body.workflow,
    'Workflow or instructions must be provided',
  );
  invariant(
    !(body.instructions && body.workflow),
    'Must provider Workflow or instructions, not both',
  );
  invariant(runtime.config.keychainUnlockKey, 'Missing unlock key');

  async function getInstructions(): Promise<
    [WorkflowRunnerInstructions, JsonObject]
  > {
    if (body.instructions) {
      return [body.instructions, body.input ?? {}];
    }

    const workflow = await resolveWorkflow(body.workflow, {
      parseAs: body.parse_workflow_as as ResolveWorkflowOptions['parseAs'],
    });

    const { valid, value, errors } = await validateWorkflowInput(
      body.input,
      workflow,
    );

    invariant(
      valid,
      `Invalid workflow input: ${errors?.map((l) => l.message).join(', ')}`,
    );

    return [await normalizeWorkflowToInstructions(workflow), value];
  }

  const [instructions, input] = await getInstructions();

  // if they PUT, we need to check to see if this workflow already exists
  if (req.method === 'PUT') {
    invariant(id, 'PUT requires an id');

    const currentWorkflow = findRunByTrackingId(runtime, id);

    if (currentWorkflow) {
      return {
        status: 200,
        body: {
          tracking_id: id,
          status: currentWorkflow.status,
          status_reason: currentWorkflow.statusText,
          report: currentWorkflow.report,
        },
      };
    }
  }

  // if they have set the number of max concurrent runs,
  // we need to check to see if we are at that limit
  // if we are, tell the db to leave it as pending
  if (
    req.context.options.maxConcurrentRuns &&
    runtime.runs.size >= req.context.options.maxConcurrentRuns
  ) {
    return {
      status: 200,
      body: {
        status: 'QUEUED',
      },
    };
  }

  id &&
    input.__tracking_id &&
    invariant(id === input.__tracking_id, 'Tracking id mismatch');

  // tracking id is either the one provided, or a new one
  // we also need to make sure if both were provided, they match
  const tracking_id = id ?? input.__tracking_id ?? uuid();

  // don't run until the next tick so
  // that the request doesn't wait for completion
  process.nextTick(async () => {
    const secretsManager = new SecretsManager(
      Buffer.from(runtime.config.keychainUnlockKey, 'base64'),
    );

    try {
      const result = await runWorkflow({
        runtime: runtime,
        input: {
          __tracking_id: tracking_id,
          ...input,
        },
        instructions,
        secretsManager,
      });

      console.log(
        ' > number of runs: %o',
        Array.from(runtime.runs.values()).length,
      );
      console.log(' > result: %s', result.id);
    } catch (err) {
      console.log(' > error: %o', err);
    }
  });

  return {
    status: 200,
    body: {
      tracking_id,
      status: 'QUEUED',
    },
  };
}
