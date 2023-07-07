// always reference node modules to pickup the symlink
import {
  startFileSystemService,
  stopFileSystemService,
} from './node_modules/@elwood/fs-service/src/';

console.log('Starting file system service...');

startFileSystemService().catch(async (err) => {
  console.log('Error starting file system service', err);
  await stopFileSystemService();
  process.exit(1);
});

// catch sigint and exit cleanly
// since docker doesn't like it when we don't
process.on('SIGINT', async function () {
  console.log('Caught interrupt signal');
  await stopFileSystemService();
  process.exit();
});
