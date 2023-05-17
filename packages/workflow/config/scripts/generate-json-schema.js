const { writeFileSync } = require('fs');
const convert = require('joi-to-json');
const { join } = require('path/posix');

const { schema } = require('../lib/index.js');

writeFileSync(
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
