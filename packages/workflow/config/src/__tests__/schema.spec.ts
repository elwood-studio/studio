import { WorkflowJob } from '@elwood-studio/workflow-types';

import { job } from '../schema/job';

describe('schema', () => {
  describe('job', () => {
    test('pass', () => {
      const def: WorkflowJob = {
        when: '*',
        description: 'hello world',
        steps: [
          {
            run: 'echo "Hello World"',
          },
        ],
      };
      const result = job.validate(def);

      expect(result.error).toBeUndefined();
    });
    test('fail', () => {
      const result = job.validate({ steps: [] });
      expect(result.error).not.toBeUndefined();
    });
  });
});
