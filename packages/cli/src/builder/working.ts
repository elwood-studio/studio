import boxen from 'boxen';

import type { Context } from '../types.ts';
import { FilePaths } from '../constants.ts';

import { buildLocalEnv } from './local-env.ts';
import { buildLocalConfig } from './local-config.ts';

export type BuildWorkingDirOptions = {
  context: Context;
};

export async function buildWorkingDir(options: BuildWorkingDirOptions) {
  const { context } = options;
  const wd = context.workingDir;

  await wd.ensure('local');
  await wd.ensure('workflows');
  await wd.ensure('actions');
  await wd.ensure('data');

  await wd.write('.gitignore', ['.env*', FilePaths.LocalBuildDir]);

  await wd.write(`${FilePaths.ActionsDir}/demo.ts`, [
    'import {getInput} from "https://x.elwood.studio/a/core/mod.ts";',
    '',
    'async function main() {',
    ' const file = getInput("filePath");',
    ' Deno.writeTextFileSync(file, "Hello World!", { append:true });',
    '}',
    'if (import.meta.main) {',
    ' main(); ',
    '}',
  ]);

  await wd.writeYaml(`${FilePaths.WorkflowsDir}/demo.yml`, {
    name: 'demo',
    when: '{%= event === "demo" %}',
    jobs: {
      default: {
        steps: [
          {
            action: 'run/echo',
            input: {
              message: '${ input.message }',
            },
          },
          {
            action: '$static/actions/demo.ts',
          },
        ],
      },
    },
  });

  const ascii = boxen(
    [
      `███████ ██      ██     ██  ██████   ██████  ██████`,
      `██      ██      ██     ██ ██    ██ ██    ██ ██   ██`,
      `█████   ██      ██  █  ██ ██    ██ ██    ██ ██   ██`,
      `██      ██      ██ ███ ██ ██    ██ ██    ██ ██   ██`,
      `███████ ███████  ███ ███   ██████   ██████  ██████`,
    ].join('\n'),
    { padding: 1 },
  );

  await wd.write('workflows/readme.txt', [
    ascii,
    '',
    'This directory is for your workflows.',
    'For more information about workflows, visit',
    'https://elwood.studio/docs/workflows',
    '',
    'You can also check out our repository of workflows at',
    'https://github.com/elwood-studio/workflows',
    '',
    'Need Help?',
    'Email Us: hello@elwood.studio',
    'Join our Discord: https://elwood.studio/discord',
  ]);

  await wd.write('actions/readme.txt', [
    ascii,
    '',
    'This directory is for your workflow actions.',
    'For more information about actions, visit',
    'https://elwood.studio/docs/actions',
    '',
    'You can also check out our repository of actions at',
    'https://github.com/elwood-studio/actions',
    '',
    'Need Help?',
    'Email Us: hello@elwood.studio',
    'Join our Discord: https://elwood.studio/discord',
  ]);

  await wd.writeToml(FilePaths.Settings, {
    version: 0.1,
  });

  await wd.writeEnv(FilePaths.LocalDotEnv, await buildLocalEnv());
  await wd.writeToml(FilePaths.LocalConfig, await buildLocalConfig());
}
