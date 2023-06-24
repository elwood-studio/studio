const host = '$WORKFLOW_HOST';

export const service = [
  {
    name: 'workflow-v1',
    url: `http://${host}/`,
    routes: [
      {
        name: 'workflow-v1-all',
        strip_path: true,
        paths: ['/workflow/v1/'],
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
          allow: ['admin'],
        },
      },
    ],
  },
];
