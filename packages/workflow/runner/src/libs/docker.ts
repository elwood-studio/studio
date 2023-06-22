import type { Writable } from 'stream';

import Docker, { Container, ContainerCreateOptions } from 'dockerode';
import invariant from 'ts-invariant';

import type { WorkflowRunnerCommand } from '@elwood/workflow-types';
import type { JsonObject } from '@elwood/types';

import type { WorkflowRunnerRuntimeRun } from '../types';
import debug from './debug';

const log = debug('library:docker');
const pulledImages: string[] = [];

export function createContainerCreateOptions(
  opts: ContainerCreateOptions,
): ContainerCreateOptions {
  const o = opts as JsonObject;
  return Object.keys(opts).reduce((acc, key) => {
    if (o[key] === undefined) {
      return acc;
    }

    return {
      ...acc,
      [key]: o[key],
    };
  }, {} as ContainerCreateOptions);
}

export type CreateDockerInput = {
  socketPath: string;
};

export async function createDocker(
  input: CreateDockerInput,
): Promise<Docker | null> {
  const { socketPath } = input;

  log('createDocker(%o)', input);

  invariant(socketPath, 'DOCKER_SOCKET_PATH is required');

  const docker = new Docker({
    socketPath,
  });

  invariant((await docker.ping()).toString() === 'OK', 'Docker ping failed');

  return docker;
}

export function pullDockerImage(docker: Docker, img: string): Promise<void> {
  log('pullDockerImage(%s)', img);

  if (pulledImages.includes(img)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    docker.pull(img, {}, (err, stream) => {
      if (err) {
        return reject(err);
      }
      if (!stream) {
        return reject(`Unable to pull "${img}"`);
      }

      docker.modem.followProgress(stream, (err) => {
        if (err) {
          reject(err);
        }
        pulledImages.push(img);
        resolve();
      });
    });
  });
}

export type RockerRunImageInput = {
  docker: Docker;
  image: string;
  args: string[];
  output: Writable | Writable[];
  options: ContainerCreateOptions;
};

export type DockerRunImageOutput = [
  { Error: string | null; StatusCode: number | null },
  Container,
];

export async function runDockerImage(
  input: RockerRunImageInput,
): Promise<DockerRunImageOutput> {
  const { docker, image, args, output, options } = input;

  log('runDockerImage(%o)', { image, args, options });

  await pullDockerImage(docker, image);

  const [result, container] = (await docker.run(
    image,
    args,
    output,
    options,
  )) as DockerRunImageOutput;

  return [result, container];
}

type CreateDockerRuntimeContainerInput = {
  docker: Docker;
  image: string;
  id: string;
  stageDir: string;
  logsDir: string;
};

export async function createDockerRuntimeContainer(
  input: CreateDockerRuntimeContainerInput,
): Promise<Container> {
  const { docker, image, id, stageDir, logsDir } = input;

  log('createDockerRuntimeContainer(%o)', { ...input, docker: true });

  await pullDockerImage(docker, image);

  const runtime = await docker.createContainer({
    name: `runtime-${id}`,
    Image: image,
    Entrypoint: ['tail', '-f', '/dev/null'],
    Tty: false,
    Env: ['NO_COLOR='],
    AttachStdin: false,
    AttachStderr: true,
    AttachStdout: true,
    OpenStdin: false,
    StdinOnce: false,
    WorkingDir: '/var/stage',
    Volumes: {
      '/var/stage': {},
      '/var/logs': {},
    },
    HostConfig: {
      Binds: [
        [logsDir, '/var/logs'].join(':'),
        [stageDir, '/var/stage'].join(':'),
      ],
      ExtraHosts: [`runner:host-gateway`],
    },
  });

  return runtime;
}

export async function runDocker(
  docker: Docker,
  image: string,
  cmd: string[],
  output: [Writable, Writable] | [Writable] | [] = [],
  createOptions: ContainerCreateOptions = {},
): Promise<[{ Error: string | null; StatusCode: number }, Container]> {
  await pullDockerImage(docker, image);
  return await docker.run(image, cmd, output, createOptions);
}

export async function createCommandContainer(
  docker: Docker,
  run: WorkflowRunnerRuntimeRun,
  container: WorkflowRunnerCommand['container'],
): Promise<Container> {
  try {
    const id = ['cmd', run.runtime.uuid('cm')].join('-');
    const image = container.image;

    log('createCommandContainer(%o)', { id, container });

    await pullDockerImage(docker, image);

    const stageDir = run.stageDir.path();
    const logsDir = '/tmp';
    const opts: ContainerCreateOptions = {
      name: id,
      Image: image,
      Tty: false,
      Env: ['NO_COLOR='],
      AttachStdin: false,
      AttachStderr: true,
      AttachStdout: true,
      OpenStdin: false,
      StdinOnce: false,
      WorkingDir: '/var/stage',
      Volumes: {
        '/var/stage': {},
        '/var/logs': {},
      },
      HostConfig: {
        ExtraHosts: [`runner:host-gateway`],
        Binds: [
          [logsDir, '/var/logs'].join(':'),
          [stageDir, '/var/stage'].join(':'),
        ],
      },
    };

    log(' > opts(%o)', opts);

    const runtime = await docker.createContainer(opts);

    log(' > created');

    return runtime;
  } catch (err) {
    throw new Error(
      `Unable to create command container "${container.image}": ${
        (err as Error).message
      }`,
    );
  }
}
