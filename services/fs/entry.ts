// do not change this to use @elwood-studio/workflow-service
import {
  startFileSystemService,
  stopFileSystemService,
} from './node_modules/@elwood-studio/fs-service/src/';

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
