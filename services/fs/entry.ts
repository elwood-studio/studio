// always reference node modules to pickup the symlink
import {
  startFileSystemService,
  stopFileSystemService,
} from './node_modules/@elwood/fs-service/src/';

startFileSystemService().catch(async () => {
  await stopFileSystemService();
  process.exit(1);
});

// catch sigint and exit cleanly
// since docker doesn't like it when we don't
process.on('SIGINT', async function () {
  await stopFileSystemService();
  process.exit();
});
