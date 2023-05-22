import chalk from 'chalk';
import boxen from 'boxen';

export type PrintMessageType = 'error' | 'warning' | 'success';
export type PrintMessageOptions = {
  type: PrintMessageType;
  message: string;
  title?: string;
};

export function printMessage(options: PrintMessageOptions) {
  const { type, message, title } = options;

  const colors: Record<PrintMessageType, (...text: string[]) => string> = {
    error: chalk.red,
    warning: chalk.yellow,
    success: chalk.green,
  };

  console.log(
    boxen(
      [title && chalk.bold(colors[type](title)), message]
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
  });
}

export function printSuccessMessage(
  message: string,
  title: string = 'SUCCESS!',
) {
  return printMessage({
    type: 'success',
    message,
    title: 'Success',
  });
}
