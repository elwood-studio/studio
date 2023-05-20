import { Client } from '../src/client';

import { config } from 'dotenv';

config({
  path: `${__dirname}/../../../.env`,
});

const url = 'http://localhost:8000';

test('basic', async () => {
  expect.assertions(5);

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const client = new Client(url, process.env.SERVICE_ROLE_KEY!);
  const response = {
    list: [
      {
        Path: 'web',
        Name: 'web',
        Size: -1,
        MimeType: 'inode/directory',
        ModTime: '2023-04-08T19:26:16.360976875Z',
        IsDir: true,
      },
    ],
  };

  expect(
    await client.fileSystem.list({
      path: '',
      remote: 'root',
    }),
  ).toEqual(response);

  expect(await client.fileSystem.remote('root').list('')).toEqual(response);

  expect(await client.fs('root').list('')).toEqual(response);

  expect(await client.fs('root').stat('web')).toEqual({
    item: response.list[0],
  });

  const root = client.fs('root');

  expect(await root.stat('web')).toEqual({
    item: response.list[0],
  });
});
