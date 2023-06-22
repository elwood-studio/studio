import { WorkflowClient } from '../dist/workflow/client';

class T extends WorkflowClient {
  async getWorkflow(url: string) {
    return await this._getWorkflow(url);
  }
}

test('_getWorkflow', async () => {
  expect.assertions(2);

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const client = new T({
    url: '',
    key: '',
    fetch: globalThis.fetch,
  });

  expect(
    await client.getWorkflow('https://x.elwood.studio/w/echo.yml'),
  ).toEqual(await (await fetch('https://x.elwood.studio/w/echo.yml')).text());

  await expect(
    client.getWorkflow('https://x.elwood.studio/w/not-found.yml'),
  ).rejects.toThrowError();
});

test('fetch', async () => {
  const url = 'https://x.elwood.studio';
  const key = 'abc123';
  const fetch = jest.fn(async (info: RequestInfo | URL, init?: RequestInit) => {
    return new Response(JSON.stringify({ trackingId: 'tracking-id' }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  const client = new WorkflowClient({
    url,
    key,
    fetch,
  });

  const result = await client.run('echo', { foo: 'bar' }, 'tracking-id');

  expect(fetch).toHaveBeenCalled();
  expect(result).toEqual({ trackingId: 'tracking-id' });
  expect(fetch.mock.calls[0]).toEqual([
    `${url}/workflow/v1/job`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: 'echo',
        input: {
          foo: 'bar',
        },
        tracking_id: 'tracking-id',
      }),
    },
  ]);
});
