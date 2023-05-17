import { CommandProvider } from '../provider';

export class FFMpegCommandProvider extends CommandProvider {
  constructor() {
    super({
      name: 'ffmpeg',
      container: {
        image: 'jrottenberg/ffmpeg',
        entrypoint: ['ffmpeg'],
        args: [],
        cmd: null,
      },
      access: {
        stage: ['*/*'],
        env: { '*': true },
        secrets: { '*': true },
      },
      env: {},
    });
  }
}
