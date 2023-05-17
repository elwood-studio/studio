import type {
  ExecuteStepCommandInput,
  ExecuteStepCommandOutput,
} from '../../types';

import debug from '../../libs/debug';
import { nativeCommands, executeNativeCommand } from '../native';
import { commandExecuteInContainer } from './container';
import { commandExecuteLocal } from './local';

const log = debug('command:execute');

export async function executeCommand(
  input: ExecuteStepCommandInput,
): Promise<ExecuteStepCommandOutput> {
  const { runtime, step, args, name } = input;

  log('executeStepCommand(%o)', {
    stepId: step.id,
    args,
    name,
  });

  if (nativeCommands.includes(name.toLowerCase())) {
    return await executeNativeCommand(step, name, args);
  }

  if (runtime.config.commandContext === 'local') {
    return await commandExecuteLocal({
      runtime,
      step,
      name,
      args,
    });
  }

  const commandProvider = step.job.run.commandProviders.find(
    (item) => item.name === name,
  );

  if (!commandProvider) {
    log('commandProvider not found', name);

    return {
      code: 1,
      stderr: '',
      stdout: '',
    };
  }

  return await commandExecuteInContainer({
    provider: commandProvider,
    runtime,
    step,
    args,
  });
}
