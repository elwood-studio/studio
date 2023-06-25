import type {
  ExecuteStepCommandInput,
  ExecuteStepCommandOutput,
} from '../../types';

import debug from '../../libs/debug';
import { nativeCommands, executeNativeCommand } from '../native';
import { commandExecuteLocal } from './local';
import invariant from 'ts-invariant';

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

  invariant(
    runtime.config.commandContext === 'local',
    'only local is supported',
  );

  return await commandExecuteLocal({
    runtime,
    step,
    name,
    args,
  });
}
