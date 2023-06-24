import * as mod from 'https://deno.land/std@0.192.0/yaml/mod.ts';
import { Validator } from 'npm:jsonschema';

const v = new Validator();

// schema
const schema = await (
  await fetch(
    'https://raw.githubusercontent.com/Kong/deck/main/file/kong_json_schema.json',
  )
).json();

const config = {
  _format_version: '1.1',
  consumers: [
    {
      username: 'anon',
      keyauth_credentials: [
        {
          key: '$YML_ANON_CRED',
        },
      ],
    },
    {
      username: 'service_role',
      keyauth_credentials: [
        {
          key: '$YML_SR_KEY',
        },
      ],
    },
  ],
  acls: [
    {
      consumer: 'anon',
      group: 'anon',
    },
    {
      consumer: 'service_role',
      group: 'admin',
    },
  ],
  services: [
    {
      name: 'pong-v1',
      url: 'http://localhost',
      routes: [
        {
          name: 'pong-v1-all',
          strip_path: true,
          paths: ['/ping'],
        },
      ],
      plugins: [
        {
          name: 'request-termination',
          config: {
            status_code: 200,
            message: 'pong',
          },
        },
      ],
    },
  ],
};

for await (const file of Deno.readDir('./services')) {
  console.log(`Loading ${file.name}...`);

  const { service } = await import(`./services/${file.name}`);

  if (typeof service === 'undefined') {
    throw new Error(`Unable to find service`);
  }

  config.services.push(...service);
}

// validate the schema
// const result = v.validate(config, schema);

// if (!result.valid) {
//   throw new Error('Invalid schema');
// }

console.log('Writing kong.yml...');

await Deno.writeTextFile('kong.yml', mod.stringify(config));
