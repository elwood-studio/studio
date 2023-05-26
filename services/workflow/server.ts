import {
  createService,
  type WorkflowService,
} from '@elwood-studio/workflow-service';

let currentService: WorkflowService | null = null;

createService()
  .then((service) => {
    currentService = service;
    console.log('Workflow watcher started successfully');
  })
  .catch((err) => {
    console.log(`Error: ${err.message}`);
    console.log(err.stack);
    process.exit(1);
  });

// catch a sigint and stop boss before
// exiting
process.on('SIGINT', async () => {
  currentService && (await currentService.teardown());
  process.exit();
});
