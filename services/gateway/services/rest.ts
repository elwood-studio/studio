const host = '$REST_HOST';

export const service = [
  {
    name: 'rest-v1',
    url: `http://${host}/`,
    routes: [
      {
        name: 'rest-v1-all',
        strip_path: true,
        paths: ['/rest/v1/'],
      },
    ],
    plugins: [
      {
        name: 'cors',
      },
      {
        name: 'key-auth',
        config: {
          hide_credentials: true,
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
  {
    name: 'graphql-v1',
    url: `http://${host}/rpc/graphql`,
    routes: [
      {
        name: 'graphql-v1-all',
        strip_path: true,
        paths: ['/graphql/v1'],
      },
    ],
    plugins: [
      {
        name: 'cors',
      },
      {
        name: 'key-auth',
        config: {
          hide_credentials: true,
        },
      },
      {
        name: 'request-transformer',
        config: {
          add: {
            headers: ['Content-Profile:graphql_public'],
          },
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
