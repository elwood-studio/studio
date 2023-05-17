import type { WorkflowHandlerResponse, WorkflowHandlerRequest } from '../types';

export default async function handler(
  req: WorkflowHandlerRequest,
): Promise<WorkflowHandlerResponse> {
  console.log('request.list(%o)', req.params);

  const { runtime } = req.context;
  try {
    return {
      status: 200,
      body: Array.from(runtime.runs.values()).map((item) => {
        return {
          id: item.id,
          tracking_id: item.context.get('trackingId'),
        };
      }),
    };
  } catch (err) {
    return {
      status: 400,
      body: {
        error: true,
      },
    };
  }
}
