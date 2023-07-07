import type { PgBoss, Client } from '../types.ts';

export default async function register(
  boss: PgBoss,
  _db: Client,
): Promise<void> {
  await boss.work('fs:upload', async (job) => {
    console.log('fs:upload', job.data);

    return {};
  });
}
