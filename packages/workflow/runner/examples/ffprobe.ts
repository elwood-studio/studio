/** 

FFProbe Example
============================

This is an example of a workflow that sets ffprobe as a command,
downloads a video, and then runs ffprobe on it and prints the duration.

Usage:
------
yarn cli ffprobe.ts

Expected Output:
-----------------
...
[default.echo.stdout]: 596.474195

Learn More:
 - https://elwood.studio/docs/workflow/
 - https://elwood.studio/docs/workflow/commands/
 
*/

import type { Workflow } from '@elwood/workflow-types';

export const workflow: Workflow = {
  name: 'ffprobe',
  when: '*',
  commands: {
    ffprobe: {
      container: {
        image: 'jrottenberg/ffmpeg',
        entrypoint: ['ffprobe'],
      },
    },
  },
  jobs: {
    default: {
      steps: [
        {
          action: 'fs/pull',
          input: {
            src: '{%= input.src %}',
            dest: 'source.mp4',
          },
        },
        {
          action: 'run/ffprobe',
          input: {
            args: '-show_format -show_streams source.mp4',
            save_to: 'result.json',
            as_json: 'yes',
          },
        },
        {
          name: 'read',
          action: 'output',
          input: {
            name: 'result',
            value: 'file://result.json',
          },
        },
        {
          name: 'echo',
          action: 'echo',
          input: {
            message:
              '{%= fromJson(job.steps.read.output.result).streams[0].duration %}',
          },
        },
      ],
    },
  },
};

export const input = {
  src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
};
