import type { JsonObject } from '@elwood-studio/types';

import { invariant } from '../libs/invariant.ts';
import type { Fetch } from '../types.ts';

export type WorkflowClientOptions = {
  url: string;
  key: string;
  fetch: Fetch;
};

export class WorkflowClient {
  constructor(private readonly options: WorkflowClientOptions) {}

  /**
   * fetch a response from the file system
   * using the parent fetch method passed in options
   * @param operation
   * @param body
   * @returns
   * @link https://rclone.org/rc/#operations-list
   */
  private async _fetch<Response extends JsonObject = JsonObject>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: Record<string, unknown>,
  ): Promise<Response> {
    const response = await this.options.fetch(
      `${this.options.url}/workflow/v1/${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    );

    return (await response.json()) as Response;
  }

  async run(
    workflow: string | JsonObject,
    input: JsonObject = {},
    trackingId?: string,
  ): Promise<{ tracking_id: string }> {
    invariant(workflow, 'workflow.submit(): workflow is required');

    return await this._fetch<{ tracking_id: string }>(`job`, 'POST', {
      workflow,
      input,
      tracking_id: trackingId,
    });
  }

  async report(trackingId: string): Promise<JsonObject> {
    return await this._fetch<JsonObject>(`job/${trackingId}`, 'GET');
  }
}
