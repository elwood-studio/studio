import { isAbsolute, join } from 'path';
import { spawn } from 'child_process';

import { invariant } from 'ts-invariant';
import which from 'which';

import type { JsonObject } from '@elwood-studio/types';
import type { WorkflowRunnerPermission } from '@elwood-studio/workflow-types';

import type {
  WorkflowRunnerRuntimeRunStep,
  WorkflowRunnerRuntime,
} from '../types';
import { RunnerStatus } from '../constants';
import debug from './debug';
import { shouldRunWhen } from './should-run-when';

const log = debug('run:step');
const localStageDir = '/var/stage';

export async function runStep(
  step: WorkflowRunnerRuntimeRunStep,
): Promise<void> {
  try {
    const { action, permission } = step.def;
    const runtime = step.job.run.runtime;

    const shouldRun = await shouldRunWhen(step.def.when, async (exp) =>
      step.getExpressionValue(exp),
    );

    // is if this step should run
    if (shouldRun === false) {
      step.status = RunnerStatus.Skipped;
      return;
    }

    await step.start();

    invariant(action, 'action must be defined');
    invariant(action.action, 'action.action must be defined');

    step.status = RunnerStatus.Running;

    const additionalEnv: JsonObject = {
      NO_COLOR: '',
      STAGE_DIR: localStageDir,
    };

    const [actionName, ...actionPath] = action.action.split('/');
    const actionVersion = action.version ?? undefined;
    const registry = { actions: [] } as { actions: Array<{ name: string }> }; // await runtime.getStdLibRegistry(actionVersion);
    // const actionInRegistry = registry.actions.find(
    //   (item) => item.name === actionName,
    // );

    log('actionName=%o', action.action);
    log('actionVersion=%o', actionVersion);
    log('registry(%o)', registry);

    let stdLibUrl = action.action;

    // if (actionInRegistry) {
    //   const { protocol, hostname, pathname } = new URL(actionInRegistry.uri);
    //   const entry =
    //     actionPath.length > 0
    //       ? actionPath.join('/')
    //       : actionInRegistry.default_entry ?? 'index.js';
    //   stdLibUrl = `run/${protocol.replace(':', '')}`;
    //   additionalEnv.INPUT_REPO = `${[hostname, pathname].join('')}`;
    //   additionalEnv.INPUT_ENTRY = `${entry}`;
    //   additionalEnv.INPUT_ENGINE = actionInRegistry.engine ?? 'deno';
    // }

    if (actionName.startsWith('!')) {
      stdLibUrl = 'run/command';
      additionalEnv.INPUT_COMMAND = `${actionName.substring(1)}`;
    }

    const staticServerBaseUrl = [
      'http://localhost',
      runtime.config.commandServerPort,
    ].join(':');

    const _getScriptUrl = getScriptUrlProvider(
      runtime,
      actionName,
      actionPath,
      actionVersion ?? '',
      stdLibUrl,
      staticServerBaseUrl,
    );

    const scriptUrl = _getScriptUrl();

    const env = await step.getContainerEnvironment(
      {},
      additionalEnv,
      'localhost',
    );

    const envObj = env.reduce(
      (acc, value) => {
        const [key, ...val] = value.split('=');
        return {
          ...acc,
          [key]: val.join('='),
        };
      },
      {
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        PATH: String(process.env.PATH),
      },
    );

    const cmd: string[] = [
      'deno',
      'run',
      '-q',
      ...getActionPermissions(permission, Object.keys(envObj)),
      scriptUrl,
      ...action.args,
    ];

    log(' cmd=%o', cmd);

    let exitCode = 1;

    if (runtime.config.context === 'local') {
      exitCode = await runStepLocally(step, cmd, envObj);
    } else {
      exitCode = await runStepInContainer(step, cmd, envObj);
    }

    step.exitCode = exitCode;
    invariant(exitCode === 0, 'step has failed');
  } catch (err) {
    step.status = RunnerStatus.Error;
    step.error = err as Error;
    log(' err(%o)', err);
  }

  await step.complete();
}

export function getActionPermissions(
  permissions: WorkflowRunnerPermission,
  additionalEnv: string[] = [],
): string[] {
  const args: Array<string | boolean> = [];

  for (const [key, value] of Object.entries(permissions)) {
    switch (key) {
      case 'unstable': {
        args.push(value && '--unstable');
        break;
      }
      case 'env': {
        // if env is true, allow all env vars
        if (value === true) {
          args.push('--allow-env');
          break;
        }

        // if env is not true, allow only the env
        // vars that we're passing in
        const _values = additionalEnv;

        if (Array.isArray(value)) {
          _values.push(...value);
        }

        args.push(`--allow-env=${_values.join(',')}`);

        break;
      }
      default: {
        if (Array.isArray(value)) {
          args.push(`--allow-${key}=${value.join(',')}`);
        } else {
          args.push(value && `--allow-${key}`);
        }
      }
    }
  }

  return args.filter(Boolean) as string[];
}

export function getScriptUrlProvider(
  runtime: WorkflowRunnerRuntime,
  actionName: string,
  actionPath: string[],
  actionVersion: string,
  stdLibUrl: string,
  staticServerBaseUrl: string,
) {
  return function _getScriptUrl() {
    switch (actionName) {
      case '$static':
        return `${staticServerBaseUrl}/${actionPath.join('/')}`;

      default:
        return runtime.getStdLibUrl(stdLibUrl, actionVersion);
    }
  };
}

export function resolveLocalFile(
  step: WorkflowRunnerRuntimeRunStep,
  filePath: string,
) {
  const cleanFilePath = filePath.replace('file:', '');

  if (isAbsolute(cleanFilePath)) {
    return cleanFilePath;
  }

  const rootDir =
    step.job.run.def.meta?.cwd ?? step.job.run.runtime.workingDir.path();
  return join(rootDir, cleanFilePath);
}

export async function runStepInContainer(
  step: WorkflowRunnerRuntimeRunStep,
  cmd: string[],
  env: JsonObject,
): Promise<number> {
  log('   cmd(%o', cmd);
  log('   env(%o', env);

  // this is the execution context we want to run in
  // for any default actions
  const command = await step.job.executionContainer.exec({
    Cmd: cmd,
    Env: await step.getContainerEnvironment({}, env),
    AttachStderr: true,
    AttachStdout: true,
    Tty: false,
  });

  // once we have the container, we can give it a start
  const exec = await command.start({});

  // attach our step loggers to the execution
  // to puck up stdout and stderr. so we can pick them up after
  step.attach(exec);

  await new Promise((resolve, reject) => {
    exec.on('error', (err) => {
      reject(err);
    });

    exec.on('end', () => {
      resolve(null);
    });
  });

  const { ExitCode } = await command.inspect();

  return ExitCode ?? 1;
}

export async function runStepLocally(
  step: WorkflowRunnerRuntimeRunStep,
  cmd: string[],
  env: JsonObject,
): Promise<number> {
  log(' env=%o', env);

  const [_, ...args] = cmd;
  const denoBin = await which('deno');

  invariant(denoBin, 'deno is not installed');

  return await new Promise((resolve) => {
    const proc = spawn(denoBin, args, {
      cwd: step.job.stageDir.path(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });

    proc.stdout.on('data', (chunk) => {
      step.stdout.write(chunk);
    });

    proc.stderr.on('data', (chunk) => {
      step.stderr.write(chunk);
    });

    proc.on('error', (err) => {
      step.stderr.write(err.message);
      resolve(1);
    });

    proc.on('close', (code) => {
      resolve(code ?? 1);
    });
  });
}
