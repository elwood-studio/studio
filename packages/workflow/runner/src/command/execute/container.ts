import type {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimeRunStep,
  RunnerCommandProvider,
  ExecuteStepCommandOutput,
} from '../../types';

import {
  runDockerImage,
  createContainerCreateOptions,
} from '../../libs/docker';
import { Logger } from '../../libs/logger';
import debug from '../../libs/debug';

export type CommandExecuteInContainerOptions = {
  provider: RunnerCommandProvider;
  args: string[];
  runtime: WorkflowRunnerRuntime;
  step: WorkflowRunnerRuntimeRunStep;
};

const log = debug('command:execute:container');

export async function commandExecuteInContainer(
  options: CommandExecuteInContainerOptions,
): Promise<ExecuteStepCommandOutput> {
  const { provider, args, runtime, step } = options;

  switch (provider.type) {
    case 'service': {
      const cmd = await provider.container.exec({
        Cmd: args,
      });

      const exec = await cmd.start({});

      await new Promise((resolve, reject) => {
        exec.on('error', (err) => {
          reject(err);
        });

        exec.on('end', () => {
          resolve(null);
        });
      });

      const { ExitCode } = await cmd.inspect();

      return {
        code: ExitCode ?? 1,
        stderr: '',
        stdout: '',
      };
    }
    case 'exec': {
      const stageDir = step.job.stageDir.path();
      const logDir = step.job.logsDir.path();
      const stdout = new Logger(null);
      const stderr = new Logger(null);
      const output = [stdout, stderr];

      const localStageDir = '/var/stage';
      const localLogsDir = '/var/logs';

      const options = createContainerCreateOptions({
        Env: [...(await step.getContainerEnvironment()), ...provider.env],
        Cmd: provider.cmd.container.cmd ?? undefined,
        Entrypoint: provider.cmd.container.entrypoint ?? undefined,
        Volumes: {
          [localStageDir]: {},
          [localLogsDir]: {},
        },
        HostConfig: {
          ExtraHosts: [`runner:host-gateway`],
          Binds: [
            [logDir, localLogsDir],
            [stageDir, localStageDir],
          ].map((item) => item.join(':')),
        },
        WorkingDir: localStageDir,
      });

      const [result, container] = await runDockerImage({
        docker: runtime.docker,
        args,
        output,
        image: provider.cmd.container.image,
        options,
      });

      await container.remove();

      log(' > result: %o', result);

      return {
        code: result.StatusCode ?? 1,
        stdout: stdout.getStack().join('\n'),
        stderr: stderr.getStack().join('\n'),
      };

      break;
    }
    default: {
      return {
        code: 1,
        stdout: '',
        stderr: '',
      };
    }
  }
}
