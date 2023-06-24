import { isAbsolute, join } from 'path';

import { invariant } from 'ts-invariant';
import type { JsonObject } from '@elwood/types';
import type { WorkflowRunnerPermission } from '@elwood/workflow-types';

import type {
  WorkflowRunnerRuntimeRunStep,
  WorkflowRunnerRuntime,
} from '../types';
import { RunnerStatus } from '../constants';
import debug from '../libs/debug';
import { shouldRunWhen } from '../libs/should-run-when';
import { spawnRunDeno, runDenoInlineScript } from '../libs/spawn-deno';

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

    const envObj = env.reduce((acc, value) => {
      const [key, ...val] = value.split('=');
      return {
        ...acc,
        [key]: val.join('='),
      };
    }, {});

    const cmd: string[] = ['deno', 'run', '-q', scriptUrl, ...action.args];

    log(' cmd=%o', cmd);

    let exitCode = 1;

    if (actionName === '__run_script__') {
      exitCode = await runStepLocally(
        step,
        step.def.input.script,
        action.args,
        envObj,
        permission,
        true,
      );
    } else if (runtime.config.context === 'local') {
      exitCode = await runStepLocally(
        step,
        scriptUrl,
        action.args,
        envObj,
        permission,
      );
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
  script: string,
  args: string[],
  env: JsonObject,
  permissions: WorkflowRunnerPermission,
  inline = false,
): Promise<number> {
  log(' env=%o', env);

  if (inline) {
    const [_, code] = await runDenoInlineScript({
      cwd: step.job.stageDir.path(),
      script: `
        import * as core from 'https://x.elwood.studio/a/core/mod.ts';
        ${script}
      `,
      permissions,
      args,
      env,
      onStderr(chunk) {
        step.stderr.write(chunk);
      },
      onStdout(chunk) {
        step.stdout.write(chunk);
      },
    });

    return code;
  }

  const proc = await spawnRunDeno({
    cwd: step.job.stageDir.path(),
    script,
    args,
    env,
    permissions,
  });

  return await new Promise((resolve) => {
    proc.stdout?.on('data', (chunk) => {
      step.stdout.write(chunk);
    });

    proc.stderr?.on('data', (chunk) => {
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
