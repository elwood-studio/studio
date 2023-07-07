import { join } from 'path';
import { normalizeSources } from '../commands/fs/upload.ts';

describe('commands/fs/upload', () => {
  describe('normalizeSources()', () => {
    test('should separate local and remote files', () => {
      expect(normalizeSources('local.txt,https://remote.awesome')).toEqual([
        `file://${join(process.cwd(), 'local.txt')}`,
        'https://remote.awesome',
      ]);
    });
  });
});
