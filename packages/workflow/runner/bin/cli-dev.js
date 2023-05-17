#!/usr/bin/env node

const { statSync } = require('fs');
const { join } = require('path');

if (!statSync(join(__dirname, '../node_modules'))) {
  console.log(
    'Unable to find "node_modules" directory. Please run "npm install" first.',
  );
  process.exit(1);
}

require('ts-node').register();
require('../src/cli/cli').cli(process);
