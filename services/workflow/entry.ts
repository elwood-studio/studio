// do not change this to use @elwood-studio/workflow-service
import {
  launchWorkflowService,
  destroyWorkflowService,
} from './node_modules/@elwood-studio/workflow-service/src/';

launchWorkflowService().catch(async (err) => {
  console.error(err);
  await destroyWorkflowService();
  process.exit(1);
});

// catch sigint and exit cleanly
// since docker doesn't like it when we don't
process.on('SIGINT', async function () {
  await destroyWorkflowService();
  process.exit();
});
