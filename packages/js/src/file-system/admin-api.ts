import { invariant } from '../libs/invariant';
import { FileSystemOperation } from '../constants';
import type { FileSystemFetch } from '../types';

export type FileSystemAdminApiOptions = {
  fetch: FileSystemFetch;
};

export class FileSystemAdminApi {
  constructor(private readonly options: FileSystemAdminApiOptions) {}

  /**
   *
   * @param input FileSystemAdminCreateConfigInput
   * @returns FileSystemAdminCreateConfigOutput
   * @link https://rclone.org/rc/#config-create
   */
  async createConfig(
    input: FileSystemAdminCreateConfigInput,
  ): Promise<FileSystemAdminCreateConfigOutput> {
    invariant(input.name, 'fileSystem.admin.createConfig(): name is required');
    invariant(
      input.parameters,
      'fileSystem.admin.createConfig(): parameters is required',
    );
    invariant(input.type, 'fileSystem.admin.createConfig(): type is required');

    return await this.options.fetch<FileSystemAdminCreateConfigOutput>(
      FileSystemOperation.CreateConfig,
      {
        name: input.name,
        parameters: input.parameters,
        type: input.type,
        opt: input.options ?? {},
      },
    );
  }
}

export type FileSystemAdminCreateConfigInput = {
  name: string;
  parameters: Record<string, unknown>;
  type: string;
  options?: {
    obscure?: boolean; // - declare passwords are plain and need obscuring
    noObscure?: boolean; // - declare passwords are already obscured and don't need obscuring
    continue?: string; // - continue the config process with an answer
    all?: string; // - ask all the config questions not just the post config ones
    state?: string; // - state to restart with - used with continue
    result?: string; // - result to restart with - used with continue
  };
};

export type FileSystemAdminCreateConfigOutput = Record<string, unknown>;
