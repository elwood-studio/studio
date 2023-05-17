import { EOL } from 'os';

export function printHelp(code: number | null = null) {
  [
    'Usage: workflow-server <command> [options]',
    '',
    ' commands:',
    '  start  start the server',
    '  stop   stop a running server',
    '  post|get|put|delete  send a command to the server',
    ' ',
    ' options:',
    '  --port <port>  server port',
    '  --env <env_file> path of env file to load',
    '  --workingDir <dir> working directory',
  ].forEach((ln) => {
    process.stdout.write(ln);
    process.stdout.write(EOL);
  });
  process.exit(code === null ? 0 : code);
}

export async function getStdin(): Promise<string | undefined> {
  if (!Boolean(process.stdout.isTTY)) {
    const data = [];
    let len = 0;

    for await (const chunk of process.stdin) {
      data.push(chunk);
      len += chunk.length;
    }

    return Buffer.concat(data, len).toString();
  }

  return undefined;
}

export function println(...args: string[]) {
  args.forEach((ln) => process.stdout.write(`${ln}${EOL}`));
}
