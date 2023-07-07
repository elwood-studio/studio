import { writeFile } from 'node:fs/promises';
import { invariant } from '@elwood/common';

import type { ObjectHandlerOptions } from '@/types.ts';
import { createObject } from '@/libs/create-object.ts';
import { authExecuteSql } from '@/libs/auth-execute-sql.ts';

export async function blob(options: ObjectHandlerOptions) {
  switch (options.req.method) {
    case 'POST': {
      return await create(options);
    }
    default: {
      options.res.status(405).send();
    }
  }
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
  } = options.req.body as {
    display_name?: string;
    source?: string;
    content?: string;
    mime_type?: string;
    parents?: boolean;
  };

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

  console.log(obj);

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
