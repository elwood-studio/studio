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
      env: {},
    });
  }
}
