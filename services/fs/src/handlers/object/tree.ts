import type {
  FileSystemTreeNode,
  FileSystemTreeResult,
} from '@elwood-studio/types';

import { authExecuteSql } from '../../libs/auth-execute-sql';
import type { ObjectHandlerOptions } from '../../types';

export default async function tree(options: ObjectHandlerOptions) {
  const { db, req, res } = options;
  const { type } = options.params;
  const nodes: FileSystemTreeNode[] = [];

  if (type === 'remote') {
    //
  } else {
    const { rows } = await authExecuteSql({
      client: db,
      req,
      params: [],
      sql: ``,
    });

    nodes.push(
      ...rows.map((item) => {
        return {
          id: item.id,
          name: item.name,
          display_name: item.display_name,
          type: item.type,
          size: item.size,
          mime_type: item.mime_type,
          is_remote: false,
          metadata: item.metadata,
        };
      }),
    );
  }

  const result: FileSystemTreeResult = {
    nodes,
    breadcrumbs: [],
  };

  res.send(result);
}
