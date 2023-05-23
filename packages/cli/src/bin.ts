import { main } from './cli.ts';

main(process.argv).catch((err) => {
  console.log(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});
