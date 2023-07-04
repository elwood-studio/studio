import { invariant } from 'ts-invariant';

import type { Arguments, Context, WorkflowReportOptions } from '../../types.ts';
import { outputReport } from '../../libs/output.ts';

export async function report(args: Arguments<WorkflowReportOptions>) {
  invariant(args.trackingId, 'Tracking ID is required');
  const context = args.context as Required<Context>;
  const result = await context.client.workflow.report(args.trackingId);

  invariant(result, 'Unable to find workflow report');

  outputReport(args.output, result);
}
