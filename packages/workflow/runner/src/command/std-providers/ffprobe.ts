import { CommandProvider } from '../provider';

export class FFProbeCommandProvider extends CommandProvider {
  constructor() {
    super({
      name: 'ffprobe',
      container: {
        image: 'jrottenberg/ffmpeg',
        cmd: null,
        entrypoint: ['ffprobe'],
        args: [],
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
