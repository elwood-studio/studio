import { basename, dirname, extname, join } from 'path';

import { existsAsync, readAsync, tmpDirAsync } from 'fs-jetpack';
import { parse as parseYaml } from 'yaml';
import fetch from 'isomorphic-fetch';

import type { Workflow } from '@elwood-studio/workflow-types';

export const supportedFileExtensions = ['.yml', '.yaml', '.json', '.js'];

export type ResolveWorkflowInput = string | undefined | Workflow;

export type ResolveWorkflowOptions = {
  parseAs?: 'yaml' | 'yml' | 'json' | 'js' | 'ts' | 'deno-ts';
};

export async function resolveWorkflow(
  value: ResolveWorkflowInput,
  options: ResolveWorkflowOptions = {},
): Promise<Workflow> {
  // if it isn't a string, lets assume it's already a workflow
  if (typeof value !== 'string') {
    return value as Workflow;
  }

  // if this is a remote workflow
  // we feed to fetch it
  if (value.startsWith('http')) {
    return {
      ...(await resolveWorkflow(await (await fetch(value)).text())),
      meta: {
        url: value,
      },
    };
  }

  // did they tell us what to parse this
  // workflow as, if not we assume YAML
  switch (options.parseAs) {
    case 'json':
      return {
        meta: {
          src: 'string',
        },
        ...JSON.parse(value),
      };

    case 'yml':
    case 'yaml':
    default:
      return {
        meta: {
          src: 'string',
        },
        ...parseYaml(value),
      };
  }
}

/**
 * @deprecated use resolveWorkflow instead and another way to load from the file system
 * @param possibleFileName
 * @param workingDir
 * @returns
 */
export async function resolveWorkflowNameOrFileToWorkflow(
  possibleFileName: string,
  workingDir: string,
): Promise<Workflow> {
  // if the file name is remote, download it, write it to
  // a tmp dir and then remove the tmp dir. we need the extension
  // if it has one, to parse the file
  if (possibleFileName.startsWith('http')) {
    const tmpDir = await tmpDirAsync();
    const content = await (await fetch(possibleFileName)).text();

    await tmpDir.writeAsync(basename(possibleFileName), content);

    const outFile = join(tmpDir.cwd(), basename(possibleFileName));
    const result = await resolveWorkflowNameOrFileToWorkflow(
      outFile,
      workingDir,
    );

    await tmpDir.removeAsync();

    return { ...result, meta: { url: possibleFileName } };
  }

  // if possibleFileName is not a file, we need to start
  // looking for it in common places and see if we can
  // find it there
  if (!(await existsAsync(possibleFileName))) {
    const possibleFiles: string[] = supportedFileExtensions.map((ext) =>
      [possibleFileName, ext].join('.'),
    );

    for (const file of possibleFiles) {
      // check if the file is in the standard workflow directory
      if (
        await existsAsync(join(workingDir, '.elwood-studio/workflows/', file))
      ) {
        return resolveWorkflowNameOrFileToWorkflow(file, workingDir);
      }

      // is if the file is in the root of the working directory
      if (await existsAsync(join(workingDir, file))) {
        return resolveWorkflowNameOrFileToWorkflow(
          join(workingDir, file),
          workingDir,
        );
      }

      // as a last resort, check if the file is in the current working directory
      if (await existsAsync(join(process.cwd(), file))) {
        return resolveWorkflowNameOrFileToWorkflow(
          join(process.cwd(), file),
          workingDir,
        );
      }
    }

    throw new Error(`Workflow "${possibleFileName}" not found`);
  }

  function addMetaToWorkflow(workflow: Workflow): Workflow {
    return {
      meta: {
        cwd: dirname(possibleFileName),
        filePath: possibleFileName,
      },
      ...workflow,
    };
  }

  // try to parse the file based on the extension
  switch (extname(possibleFileName)) {
    case '.js': {
      const mod = require(possibleFileName);
      if (mod.default) {
        return addMetaToWorkflow(mod.default);
      }
      return addMetaToWorkflow(mod);
    }
    case '.json':
      return addMetaToWorkflow(await readAsync(possibleFileName, 'json'));
    case '.yml':
    case '.yaml':
      return addMetaToWorkflow(
        parseYaml((await readAsync(possibleFileName, 'utf8')) ?? ''),
      );
    default:
      throw new Error(
        `Unsupported workflow file extension: ${extname(possibleFileName)}`,
      );
  }
}
