/** 

Hello World Example
============================

This is an example of a workflow that prints
"Hello World" to stdout.

Usage:
------
yarn cli hello-world.js

Expected Output:
-----------------
[default.echo.stdout]: Hello World!

Learn More:
 - https://elwood.studio/docs/workflow/
 
*/

// Define our workflow
export const workflow = {
  // give your workflow a descriptive name
  name: 'hello-world',

  // determine when to run the workflow.
  // '*' means always run. You can also use an
  // expression like "{% is_true(input.run_now ) %}"
  // more info:
  //  https://elwood.studio/docs/workflow/syntax#when
  //  https://elwood.studio/docs/workflow/expression/
  when: '*',

  // each job must have a unique name. it can be any
  // alphanumeric string, but must start with a letter.
  // more info:
  //  https://elwood.studio/docs/workflow/syntax#jobs
  jobs: {
    default: {
      steps: [
        {
          // optional: give your step a name. helpful when
          // you need to reference its output
          // more info:
          //  https://elwood.studio/docs/workflow/syntax#jobs.step.name
          name: 'echo',

          // required: the action to perform. this can be any of
          // the pre-defined actions in https://github.com/elwood-studio/actions
          // or a docker container to execute
          // more info:
          //  https://elwood.studio/docs/workflow/actions
          //  https://elwood.studio/docs/workflow/syntax#jobs.step.action
          action: 'echo',

          // optional: the input to pass to the action.
          input: {
            // input variables are case-insensitive and can be
            // a literal string or an expression
            // more info:
            //  https://elwood.studio/docs/workflow/input
            //  https://elwood.studio/docs/workflow/expression/
            //  https://elwood.studio/docs/workflow/syntax#jobs.step.input
            message: '{%= input.message %}',
          },
        },
      ],
    },
  },
};

// Define input that is passed into the workflow
export const input = { message: 'Hello World!' };
