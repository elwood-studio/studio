import debug from 'debug';

export default function log(ns: string): debug.Debugger {
  return debug(`runner:${ns}`);
}
