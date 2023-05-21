import type { JsonObject } from '@elwood-studio/types';

import { invariant } from '../libs/invariant';
import type { Fetch } from '../types';

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
  private async _fetch<Response extends any = any>(
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

  async submit(workflow: string, input: JsonObject = {}) {
    invariant(workflow, 'workflow.submit(): workflow is required');

    return await this._fetch<JsonObject>(``, 'POST', input);
  }
}
