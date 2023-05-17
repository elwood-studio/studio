import { randomBytes } from 'crypto';
import { v4 as randomUUID } from 'uuid';

import {
  Workflow,
  WorkflowRunnerInstructions,
  WorkflowRunnerJobStep,
  WorkflowRunnerJob,
  WorkflowJob,
  WorkflowJobStep,
  WorkflowRunnerInstance,
  WorkflowRunner,
  WorkflowJobStepAction,
  WorkflowAction,
  WorkflowRunnerAction,
  WorkflowRunnerJobMatrix,
  WorkflowMatrix,
  WorkflowRunnerExpression,
  WorkflowRunnerEnv,
  WorkflowRunnerCommand,
  WorkflowCommands,
  WorkflowTimeout,
  WorkflowEnv,
  WorkflowRunnerAccess,
  WorkflowAccess,
  WorkflowJobStepRun,
  WorkflowWhen,
} from '@elwood-studio/workflow-types';

export function uid(prefix: string): string {
  return [
    prefix,
    '0',
    randomUUID().replace(/-/g, ''),
    randomBytes(10).toString('hex').substring(0, 2),
  ]
    .join('')
    .toUpperCase();
}

export function normalizeJobStepAction(
  action: WorkflowAction,
): WorkflowRunnerAction {
  function getVersion(str: string): [string, string[], string | undefined] {
    const [name, version] = str.split('@');
    const [actionName, ...args] = name.split(':');
    return [actionName, args, version];
  }

  if (typeof action === 'string') {
    const [a, args, version] = getVersion(action);
    return {
      action: a,
      version,
      args,
      command: [],
    };
  }

  const [a, args, version] = getVersion(action.action);

  return {
    action: a,
    args: [...args, ...(action.args ?? [])],
    command: action.command ?? [],
    version: version,
  };
}

export function normalizeEnv(env: WorkflowEnv | undefined): WorkflowRunnerEnv {
  return env ?? {};
}

export function normalizeAccessStage(
  stage: WorkflowAccess['stage'],
): WorkflowRunnerAccess['stage'] {
  if (stage === false) {
    return [];
  }
  if (!stage || stage === true || stage === '*') {
    return ['**/*'];
  }
  if (typeof stage === 'string') {
    return [stage];
  }
  return stage;
}

export function normalizeAccessEnvOrSecrets(
  env: WorkflowAccess['env'] | WorkflowAccess['secrets'],
): WorkflowRunnerAccess['env'] | WorkflowRunnerAccess['secrets'] {
  if (env === false) {
    return {};
  }
  if (!env || env === true || env === '*') {
    return {
      '*': true,
    };
  }
  if (typeof env === 'object') {
    return env;
  }

  return {};
}

export function normalizeAccess(
  access: WorkflowAccess | undefined,
): WorkflowRunnerAccess {
  return {
    stage: normalizeAccessStage(access?.stage),
    env: normalizeAccessEnvOrSecrets(access?.env),
    secrets: normalizeAccessEnvOrSecrets(access?.secrets),
  };
}

export function normalizeJobStep(step: WorkflowJobStep): WorkflowRunnerJobStep {
  const id = uid('s');
  const shared = {
    id,
    name: step.name ?? id,
    input: step.input ?? {},
    output: step.output ?? {},
    env: normalizeEnv(step.env),
    timeoutMinutes: normalizeTimeout(step.timeout),
    access: normalizeAccess(step.access),
    when: normalizeWhen(step.when ?? []),
    matrix: normalizeMatrix(step.matrix),
  };

  if ((step as WorkflowJobStepRun).run) {
    return {
      ...shared,
      action: normalizeJobStepAction('run/script'),
      input: {
        ...shared.input,
        script: (step as WorkflowJobStepRun).run,
      },
    };
  }

  return {
    ...shared,
    action: normalizeJobStepAction((step as WorkflowJobStepAction).action),
  };
}

export function normalizeMatrix(
  matrix: WorkflowMatrix | undefined = undefined,
): WorkflowRunnerJobMatrix {
  if (!matrix) {
    return [];
  }

  if (typeof matrix === 'string') {
    return {
      run: 'expression',
      input: {
        expression: matrix,
      },
    };
  }

  if (Array.isArray(matrix)) {
    return matrix.map((expression) => ({
      run: 'expression',
      input: {
        expression,
      },
    }));
  }

  return [];
}

export function normalizeJob(
  job: WorkflowJob & { name: string },
): WorkflowRunnerJob {
  const id = uid('j');

  return {
    id,
    name: job.name ?? id,
    steps: job.steps.map(normalizeJobStep),
    matrix: normalizeMatrix(job.matrix),
    env: normalizeEnv(job.env),
    access: normalizeAccess(job.access),
    timeoutMinutes: normalizeTimeout(job.timeout),
    when: normalizeWhen(job.when ?? []),
  };
}

export function normalizeWhen(when: WorkflowWhen): WorkflowRunnerExpression[] {
  if (when === null || when === undefined) {
    return [];
  }

  if (when === true || when === false) {
    return [
      {
        run: 'expression',
        input: {
          expression: when as boolean,
        },
      },
    ];
  }

  if (typeof when === 'string') {
    if (when === '*') {
      return [
        {
          run: 'expression',
          input: {
            expression: true,
          },
        },
      ];
    }

    return [
      {
        run: 'expression',
        input: {
          expression: when,
        },
      },
    ];
  }

  if (Array.isArray(when)) {
    return when.map((item) => {
      if (typeof item === 'string') {
        return {
          run: 'expression',
          input: {
            expression: item,
          },
        };
      }

      return {
        run: item.run ?? 'unknown',
        input: item.input ?? {},
      };
    });
  }

  if (typeof when === 'object') {
    return [
      {
        run: when.run ?? 'unknown',
        input: when.input ?? {},
      },
    ];
  }

  throw new Error(`Invalid when: ${when}`);
}

export function normalizeRunner(
  instance: WorkflowRunner = {},
): WorkflowRunnerInstance {
  return {
    size: instance.size ?? null,
    region: instance.region ?? null,
  };
}

export function normalizeCommands(
  commands: WorkflowCommands | undefined = {},
): WorkflowRunnerCommand[] {
  return Object.keys(commands ?? {}).map((name) => {
    const command = commands[name];
    return {
      name,
      container: {
        image: command.container.image,
        cmd: command.container.cmd ?? null,
        args: command.container.args ?? null,
        entrypoint: command.container.entrypoint ?? null,
      },
      access: normalizeAccess(command.access),
      env: command.env ?? {},
    };
  });
}

export function normalizeTimeout(
  timeout: WorkflowTimeout | undefined,
): number | null {
  return timeout?.minutes ?? null;
}

export async function normalizeWorkflowToInstructions(
  workflow: Workflow,
): Promise<WorkflowRunnerInstructions> {
  const id = uid('w');
  return {
    meta: workflow.meta ?? undefined,
    id,
    jobs: Object.keys(workflow.jobs).map((name) => {
      return normalizeJob({ ...workflow.jobs[name], name });
    }),
    when: normalizeWhen(workflow.when),
    instance: normalizeRunner(workflow.runner),
    timeoutMinutes: normalizeTimeout(workflow.timeout),
    commands: normalizeCommands(workflow.commands),
    env: normalizeEnv(workflow.env),
  };
}
