import type { Workflow } from '@elwood/workflow-types';

export const workflow: Workflow = {
  name: 'dropbox',
  when: '*',
  jobs: {
    default: {
      steps: [
        {
          action: 'github',
          input: {
            repo: 'elwood-studio/actions-dropbox#download',
            entry: 'download.js',
            src: '{%= input.src %}',
            dest: 'source',
          },
          env: {
            DROPBOX_CLIENT_ID: '{%= secret("dropbox_client_id") %}',
            DROPBOX_CLIENT_SECRET: '{%= secret("dropbox_client_secret") %}',
            DROPBOX_ACCESS_TOKEN: '{%= secret("dropbox_access_token") %}',
          },
        },
        // {
        //   action: 'run/ffprobe',
        //   input: {
        //     args: '-show_format -show_streams source',
        //     save_to: 'result.json',
        //     as_json: 'yes',
        //   },
        // },
        // {
        //   name: 'read',
        //   action: 'output',
        //   input: {
        //     name: 'result',
        //     value: 'file://result.json',
        //   },
        // },
        // {
        //   name: 'echo',
        //   action: 'echo',
        //   input: {
        //     message:
        //       '{%= fromJson(job.steps.read.output.result).streams[0].duration %}',
        //   },
        // },
      ],
    },
  },
};

export const secrets = [
  ['dropbox_client_id', process.env.DROPBOX_CLIENT_ID],
  ['dropbox_client_secret', process.env.DROPBOX_CLIENT_SECRET],
  ['dropbox_access_token', process.env.DROPBOX_ACCESS_TOKEN],
];

export const input = {
  src: process.env.SRC,
};
