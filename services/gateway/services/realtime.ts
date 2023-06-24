const host = '$REALTIME_HOST';

export const service = [
  {
    name: 'realtime-v1',
    url: `http://${host}/socket/`,
    routes: [
      {
        name: 'realtime-v1-all',
        strip_path: true,
        paths: ['/realtime/v1/'],
      },
    ],
    plugins: [
      {
        name: 'cors',
      },
      {
        name: 'key-auth',
        config: {
          hide_credentials: false,
        },
      },
      {
        name: 'acl',
        config: {
          hide_groups_header: true,
          allow: ['admin', 'anon'],
        },
      },
    ],
  },
];
