import { invariant } from 'ts-invariant';

import type {
  WorkflowServerReportInput,
  WorkflowHandlerResponse,
  WorkflowHandlerRequest,
} from '../types';
import { findRunByIdOrTrackingId } from '../libs/find-run';

export default async function handler(
  req: WorkflowHandlerRequest,
): Promise<WorkflowHandlerResponse> {
  const input = req.params as WorkflowServerReportInput;
  const runtime = req.context.runtime;
  console.log('request.report(%o)', input);

  const { id } = input;
  const run = findRunByIdOrTrackingId(runtime, id);

  try {
    invariant(run, `run not found: ${id}`);

    return {
      status: 200,
      body: run.report,
    };
  } catch (err) {
    console.log(' > error: %o', err);

    return {
      status: 400,
      body: { error: true },
    };
  }
}
