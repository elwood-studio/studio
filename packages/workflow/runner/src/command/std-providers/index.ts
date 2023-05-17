import { FFMpegCommandProvider } from './ffmpeg';
import { FFProbeCommandProvider } from './ffprobe';
import { NodeCommandProvider } from './node';

export const stdCommandProviders = [
  new FFMpegCommandProvider(),
  new FFProbeCommandProvider(),
  new NodeCommandProvider(),
];
