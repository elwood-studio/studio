/**
 * Elwood Studio Workflow Runner
 * ==============================
 * Docs: https://elwood.studio/docs/workflow/
 * Bin Usage:
 *  npx @elwood-studio/workflow-runner [workflow] [options]
 *  yarn cli [workflow] [options]
 *
 * Glossary:
 *  Runtime: The runtime is the main entry point for the workflow runner.
 *  Workflow Instructions: Normalized instructions from the workflow file
 *  Run: A run is a single execution of a workflow.
 *  Job: A job is a group of steps in a workflow
 *  Step: A step is a single command in a job
 *  Context: The current state of a run, job or step
 *  Input: data that is passed into a workflow
 *  Workflow Runner: The s
 *  Command: A request sent from a step container to perform an action in the workflow runner
 */

export { runWorkflow } from './libs/run-workflow';
export { createRuntime } from './libs/create-runtime';
export { handleWorkflowCallback } from './libs/callback';
export { cli } from './cli/cli';
export { shouldRunWhen } from './libs/should-run-when';

export { FileReporterPlugin } from './plugins/file-reporter';

export * from './types';
export * from './constants';
