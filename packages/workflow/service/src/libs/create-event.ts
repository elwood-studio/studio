import type { JsonObject } from '@elwood-studio/types';
import type { AppContext } from '../types.ts';

export type CreateEventOptions = {
  type: string;
  payload: JsonObject;
  trigger?: string;
  user_id?: string;
};

export async function createEvent(
  context: AppContext,
  opts: CreateEventOptions,
): Promise<string> {
  const result = await context.db.executeSql(
    `INSERT INTO elwood.event 
        ("trigger", "trigger_by_user_id", "type", "payload") 
      VALUES 
        ($1, $2, $3, $4)
      RETURNING id`,
    [opts.trigger ?? 'API', opts.user_id, opts.type.split(':'), opts.payload],
  );

  return result.rows[0].id;
}
