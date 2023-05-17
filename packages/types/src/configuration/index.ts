import type {
  WorkflowRunnerConfiguration,
  WorkflowServerConfiguration,
} from './workflow';

import type { ConfigurationDatabase } from './database';
import type { ConfigurationPlugin } from './plugin';

type WithEnabled<T> = (T & { enabled: true }) | { enabled: false };

export type Configuration = {
  database?: ConfigurationDatabase;
  plugins?: ConfigurationPlugin[];
  workflow?: {
    runner?: WorkflowRunnerConfiguration;
    server?: WorkflowServerConfiguration;
  };
};
export type ConfigurationFull = Required<Configuration> & {
  __configFilePath: string;
  __currentWorkingDirector: string;
  database: WithEnabled<ConfigurationDatabase>;
  workflow: {
    runner: WithEnabled<WorkflowRunnerConfiguration>;
    server: WithEnabled<WorkflowServerConfiguration>;
  };
};
