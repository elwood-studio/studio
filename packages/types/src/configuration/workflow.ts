import { type ConfigurationPlugin } from './plugin';

export type WorkflowServerConfiguration = Partial<{
  port: number;
  host: string;
  env: string;
  workingDir: string;
  unlockKey: string;
  commandPort: number;
  dockerPath: string;
  detach: boolean;
  data: string;
  watch: boolean;
}>;

export type WorkflowRunnerConfiguration = Partial<{
  dockerSocketPath: string;
  commandServerPort: number;
  workingDir: string;
  keychainUnlockKey: string;
  stdLibBaseUrl: string;
  stdLibHeadUrl: string;
  registryUrl: string;
  commandContext: 'local' | 'container';
  context: 'local' | 'container';
  plugins: ConfigurationPlugin[];
  staticFiles: Record<string, string>;
}>;
