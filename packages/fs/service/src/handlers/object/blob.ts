import { writeFile } from 'node:fs/promises';
import { invariant } from '@elwood/common';
import type { ObjectModel, FileSystem } from '@elwood/types';

import type { ObjectHandlerOptions, FromSchema } from '@/types.ts';
import { createObject } from '@/libs/create-object.ts';
import { authExecuteSql } from '@/libs/auth-execute-sql.ts';

import { getObject, mapObjectModelToNode } from '@/libs/get-object.ts';
import * as schemas from '@/schemas/index.ts';

export async function blob(options: ObjectHandlerOptions) {
  switch (options.req.method) {
    case 'GET': {
      return await read(options);
    }
    case 'POST': {
      return await create(options);
    }
    default: {
      options.res.status(405).send();
    }
  }
}

export async function read(options: ObjectHandlerOptions) {
  const { type, id, path } = options.params;
  let obj: ObjectModel | null = null;

  switch (type) {
    case 'name': {
      invariant(path, 'Path is required');

      obj = await getObject({
        path,
        authSqlOptions: {
          client: options.db,
          token: options.authToken,
        },
      });
      break;
    }

    case 'oid': {
      invariant(id, 'Id is required');
      obj = await getObject({
        id,
        authSqlOptions: {
          client: options.db,
          token: options.authToken,
        },
      });
      break;
    }
    default: {
      invariant(true, 'Either id or path must be provided');
    }
  }

  invariant(obj, 'Object was not found');

  const result: FileSystem.BlobResult = {
    node: mapObjectModelToNode(obj),
    sidecarNodes: [],
    breadcrumbs: [],
  };

  options.res.send(result);
}

export async function create(options: ObjectHandlerOptions): Promise<void> {
  const { db, boss, req } = options;
  const { path } = options.params;
  const {
    display_name,
    source,
    content,
    mime_type,
    parents = true,
  } = options.req.body as FromSchema<typeof schemas.blob.postBody>;

  invariant(source || content, 'source or content is required');
  invariant(
    !(source && content),
    'source and content can not be provided together',
  );

  const authSqlOptions = {
    client: db,
    req,
  };

  const obj = await createObject({
    authSqlOptions,
    parents,
    object: {
      path,
      display_name,
      mime_type,
    },
  });

  invariant(obj, 'Object was not created');

  let jobId: string | null = null;

  if (source) {
    jobId = await boss.send('fs:copy', {
      object_id: obj.id,
      source,
    });
  }

  if (content) {
    await writeFile(`/tmp/${obj.id}`, content, 'utf8');

    jobId = await boss.send('fs:upload', {
      object_id: obj.id,
      source: `/tmp/${obj.id}`,
    });
  }

  await authExecuteSql({
    ...authSqlOptions,
    sql: `UPDATE elwood.object SET "data" = jsonb_set("data", '{job_id}', '"${jobId}"') WHERE "id" = $1`,
    params: [obj.id],
  });

  options.res.send({
    id: obj.id,
  });
}
