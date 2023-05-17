import { Writable } from 'stream';
import { appendFile } from 'fs';
import { promisify } from 'util';
import { EOL } from 'os';

import debug from './debug';

const log = debug('library:loggers');

const appendFileAsync = promisify(appendFile);

// from https://github.com/chalk/ansi-regex/blob/main/index.js
const ansi = new RegExp(
  [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|'),
  'g',
);

export class Logger extends Writable {
  #path: string | null;
  #stack: string[] = [];

  name: string = 'unknown';
  writable = true;

  constructor(path: string | null) {
    super();
    this.#path = path;
  }

  get stack() {
    return this.#stack;
  }

  clean(chunk: string) {
    return chunk.toString().replace(ansi, '').trim();
  }

  push(chunk: string) {
    const data = this.clean(chunk)
      .split('\n')
      .map((line) => line.trim());
    log(`%s: %o`, this.name, data);
    this.emit('data', data);
    this.#stack.push(...data);
  }

  _write(
    chunk: any,
    _encoding: string,
    callback: (error?: Error | null) => void,
  ) {
    this.push(chunk);
    if (this.#path) {
      return appendFileAsync(this.#path, this.clean(chunk))
        .then(() => callback())
        .catch((err) => callback(err));
    }

    callback();
  }

  getStack() {
    return this.#stack;
  }

  toString() {
    return this.#stack.join(EOL);
  }
}
