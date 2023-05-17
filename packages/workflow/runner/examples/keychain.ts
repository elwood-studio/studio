import type { Workflow } from '@elwood-studio/workflow-types';
import { createKeyPair } from '@elwood-studio/workflow-secrets';

export default async function init() {
  const workflow: Workflow = {
    name: 'keychain',
    when: '*',
    jobs: {
      default: {
        steps: [
          {
            name: 'echo',
            action: 'echo',
            input: {
              message: '{%= secret("secret_message") %}',
            },
          },
        ],
      },
    },
  };

  const input = {
    message: '{%= secret("secret_message") %}',
  };

  const [pk, sk] = await createKeyPair();

  const keychain = [
    ['example_key', pk.toString('base64'), sk.toString('base64')],
  ];

  const secrets = [
    ['example_key', 'secret_message', 'Hello World, I am secret!'],
  ];

  return {
    workflow,
    keychain,
    secrets,
    input,
  };
}
