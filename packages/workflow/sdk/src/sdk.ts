import type { JsonObject } from '@elwood/types';
import { invariant, http, type Fetch } from '@elwood/common';

export type ElwoodWorkflowSdkOptions = {
  url: string;
  key: string;
  fetch: Fetch;
};

export class ElwoodWorkflowSdk {
  constructor(private readonly options: ElwoodWorkflowSdkOptions) {}

  /**
   * fetch a response from the file system
   * using the parent fetch method passed in options
   * @param operation
   * @param body
   * @returns
   * @link https://rclone.org/rc/#operations-list
   */
  private async _fetch(
    info: RequestInfo | URL,
    init: RequestInit = {},
  ): Promise<Response> {
    const response = await this.options.fetch(
      `${this.options.url}/workflow/v1/${info}`,
      {
        method: init?.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
      },
    );

    invariant(response.ok, 'workflow.submit(): response is not ok');

    const result = await response.json();

    return result as Response;
  }

  async run(
    workflow: string | JsonObject,
    input: JsonObject = {},
    trackingId?: string,
  ): Promise<{ tracking_id: string }> {
    invariant(workflow, 'workflow.submit(): workflow is required');

    return await http.post<{ tracking_id: string }>(this._fetch, `run`, {
      body: {
        workflow,
        input,
        tracking_id: trackingId,
      },
    });
  }

  async event(type: string, payload: JsonObject = {}) {
    return await http.post<{ event_id: string }>(
      this._fetch,
      `event/${type}`,
      payload,
    );
  }

  async report(trackingId: string): Promise<JsonObject> {
    return await http.get<JsonObject>(this._fetch, `run/${trackingId}`);
  }
}
