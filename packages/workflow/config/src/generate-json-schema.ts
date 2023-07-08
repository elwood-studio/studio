import { writeFile } from 'node:fs/promises';
import convert from 'joi-to-json';
import { join } from 'node:path';
import { schema } from './schema';

async function main() {
  await writeFile(
    join(__dirname, '../schema.json'),
    JSON.stringify(
      {
        $id: 'https://x.elwood.studio/schema/workflow.json',
        $schema: 'http://json-schema.org/draft-07/schema',
        title: 'Workflow',
        ...convert(schema.workflow),
      },
      null,
      2,
    ),
  );
}

main();
