import { CommandProvider } from '../provider';

export class NodeCommandProvider extends CommandProvider {
  constructor(version = '') {
    super({
      name: version ? `node@${version}` : 'node',
      container: {
        image: version ? `node:${version}-alpine` : 'node',
        cmd: null,
        entrypoint: ['node'],
        args: [],
      },
      env: {},
    });
  }
}
