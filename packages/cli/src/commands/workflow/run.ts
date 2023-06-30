import ora from 'ora';
import { invariant } from 'ts-invariant';

import type { Arguments, Context, WorkflowRunOptions } from '../../types.ts';
import { printErrorMessage, printMessage } from '../../libs/print-message.ts';
import { getInput, getWorkflow } from '../../libs/workflow.ts';

export async function run(args: Arguments<WorkflowRunOptions>) {
  const context = args.context as Required<Context>;
  const spin = ora('Sending workflow...').start();

  try {
    const input = getInput(args.input ?? []);
    let result: { tracking_id?: string; event_id?: string } = {};

    invariant(args.workflow || args.event, 'Must provide workflow or event');

    if (args.event) {
      result = await context.client.workflow.event(args.event, input);
    } else if (args.workflow) {
      const workflow = await getWorkflow(
        args.workflow,
        context.workingDir.join(''),
      );

      // force the workflow
      if (args.force !== false) {
        workflow.when = true;
      }
      result = await context.client.workflow.run(workflow, input);
    } else {
      throw new Error('Unable to run workflow or submit event');
    }

    invariant(
      result.tracking_id || result.event_id,
      'Unable to find Tracking ID or Event ID in response',
    );

    spin.succeed(`Send complete!`);
    spin.stop();
    spin.clear();

    if (result.event_id) {
      printMessage({
        type: 'success',
        title: 'Workflow Event Sent!',
        message: `Your workflow event has been submitted. Event id: ${result.event_id}`,
        body: [
          'Check the status of any workflows trigger by this event using running:',
          `elwood-studio workflow:report --event-id=${result.event_id}`,
        ],
      });
    } else {
      printMessage({
        type: 'success',
        title: 'Workflow Sent!',
        message: `Your workflow has been submitted. Tracking id: ${result.tracking_id}`,
        body: [
          'Check the status of the workflow by running:',
          `elwood-studio workflow:report ${result.tracking_id}`,
        ],
      });
    }
  } catch (e) {
    spin.stop();
    printErrorMessage(e as Error);
  }
}
