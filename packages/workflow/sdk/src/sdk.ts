import type { JsonObject } from '@elwood/types';
import { invariant, http, type Fetch } from '@elwood/common';

export type ElwoodWorkflowSdkOptions = {
  url: string;
  key: string;
  fetch: Fetch;
};

export class ElwoodWorkflowSdk {
  constructor(private readonly options: ElwoodWorkflowSdkOptions) {}

  private _fetch = async (
    info: RequestInfo | URL,
    init: RequestInit = {},
  ): Promise<Response> => {
    return await this.options.fetch(`${this.options.url}/workflow/v1/${info}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  };

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

  async config(id: string | undefined): Promise<JsonObject> {
    if (id) {
      return await http.get<JsonObject>(this._fetch, `config/${id}`);
    }

    return await http.get<JsonObject>(this._fetch, `config`);
  }
}
