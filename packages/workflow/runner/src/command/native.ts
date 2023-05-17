import type {
  ExecuteStepCommandOutput,
  WorkflowRunnerRuntimeRunStep,
} from '../types';

export const nativeCommands = [
  'set-output',
  'setoutput',
  'add-to-stage',
  'addtostage',
  'add-from-stage',
  'addfromstage',
  'syncstage',
];

export async function executeNativeCommand(
  step: WorkflowRunnerRuntimeRunStep,
  name: string,
  args: string[],
): Promise<ExecuteStepCommandOutput> {
  switch (name.toLowerCase()) {
    case 'set-output':
    case 'setoutput': {
      step.setOutput(args[0], args[1]);
      break;
    }
    case 'add-to-stage':
    case 'addtostage': {
      console.log('asd');

      step.addFileToStage(...args);
      break;
    }

    case 'add-from-stage':
    case 'addfromstage': {
      for (const src of args) {
        await step.job.stageDir.copyAsync(step.job.run.stageDir.path(src), src);
      }
    }
  }

  return {
    code: 0,
    stderr: '',
    stdout: '',
  };
}
