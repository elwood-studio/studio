import chalk from 'chalk';
import boxen from 'boxen';

export type PrintMessageType = 'error' | 'warning' | 'success';
export type PrintMessageOptions = {
  type: PrintMessageType;
  message: string;
  title?: string;
  body?: string | string[];
};

export function printMessage(options: PrintMessageOptions) {
  const { type, message, title, body } = options;

  const colors: Record<PrintMessageType, (...text: string[]) => string> = {
    error: chalk.red,
    warning: chalk.yellow,
    success: chalk.green,
  };

  process.stdout.write(
    boxen(
      [
        title && chalk.bold(colors[type](title)),
        message,
        body && '',
        body && Array.isArray(body) ? body.join('\n') : body,
        '',
      ]
        .filter(Boolean)
        .join('\n'),
      {
        padding: 1,
        dimBorder: true,
      },
    ),
  );
}

export function printErrorMessage(err: string | Error) {
  return printMessage({
    type: 'error',
    message: err instanceof Error ? err.message : err,
    title: 'Error',
    body: err instanceof Error ? chalk.dim(err.stack) : undefined,
  });
}

export function printSuccessMessage(
  message: string,
  title: string = 'SUCCESS!',
  body?: string | string[],
) {
  return printMessage({
    type: 'success',
    message,
    title,
    body,
  });
}
