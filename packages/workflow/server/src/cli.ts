import { homedir } from 'os';
import { join } from 'path';
import { mkdir } from 'fs/promises';

import fastify from 'fastify';
import yargs from 'yargs-parser';
import { config as dotenv } from 'dotenv';

import invariant from 'ts-invariant';
import { createUnlockKey } from '@elwood-studio/workflow-secrets';

import type {
  WorkflowServerCliState,
  WorkflowServerCliArguments,
} from './types';
import { println } from './libs/cli-helpers';
import { default as plugin } from './provider/fastify';

export async function cli(proc: NodeJS.Process): Promise<void> {
  const args = proc.argv.slice(2);

  dotenv({
    path: join(process.cwd(), '.env'),
  });

  const argv = yargs(args) as yargs.Arguments & {
    runtimeConfig?: string;
    name?: string;
    port?: number;
    env?: string;
    workingDir?: string;
    unlockKey?: string;
    commandPort?: number;
    dockerPath?: string;
    data?: string;
    watch?: boolean;
  };

  if (argv.env) {
    dotenv({
      path: argv.env,
    });
  }

  const cmd = argv._[0] ?? null;
  const name = argv.name || process.env.NAME || 'main';
  const homeDir = join(homedir(), '.elwood-studio/workflow-server');
  const pidFile = join(homeDir, `${name}.pid`);
  const configFile = join(homeDir, `${name}.json`);
  const logFile = join(homeDir, `${name}.log`);
  const port = argv.port ?? 3000;

  const state: WorkflowServerCliState = {
    port,
    args,
    name,
    homeDir,
    pidFile,
    configFile,
    logFile,
  };

  await mkdir(homeDir, { recursive: true });

  await start(state, argv);
}

export async function start(
  state: WorkflowServerCliState,
  argv: WorkflowServerCliArguments,
) {
  const workingDir =
    argv.workingDir ??
    process.env['WORKING_DIR'] ??
    join(state.homeDir, 'working-dir');
  const dockerSocketPath = argv.dockerPath ?? process.env['DOCKER_SOCKET_PATH'];
  const keychainUnlockKey =
    argv.unlockKey ??
    process.env['UNLOCK_KEY'] ??
    (await createUnlockKey()).toString('base64');
  const commandServerPort = argv.commandPort ?? 4000;

  invariant(
    workingDir !== process.cwd(),
    'workingDir must not be current directory',
  );

  try {
    const app = fastify();

    app.register(plugin, {
      plugins: [],
      runtime: {
        dockerSocketPath,
        workingDir,
        keychainUnlockKey,
        commandServerPort,
        commandContext: 'local',
        context: 'local',
      },
    });

    await app.listen({
      port: argv.port ?? 3000,
      host: argv.host ?? '0.0.0.0',
    });
  } catch (err) {
    println(`Unable to start server`, `${(err as Error).message}`);
    process.exit(1);
  }
}
