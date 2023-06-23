# Elwood Workflow Configuration

Workflows are a collection of jobs that can be run sequentially or in parallel. They can be triggered by an event or run on a schedule. You can define your workflows in [YAML](https://learnxinyminutes.com/docs/yaml/) (`.yml` or `.yaml`) or [JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON) (`.json`).

## Example

This workflow will print "Hello, World" to the console.

```yaml
name: 'hello'
when: '*'
jobs:
  default:
    steps:
      - name: 'echo'
        action: 'run/echo'
        input:
          message: 'Hello, world!'
```

Find more examples in our [Workflows](https://github.com/elwood-studio/workflows) repository.

## Syntax

- `name`
- `description`
- `when`
- `when.event`
- `when.all`
- `when.any`
- `defaults`
- `defaults.permission`
- `defaults.env`
- `env`
- `jobs`
- `jobs.<job-id>.name`
- `jobs.<job-id>.description`
- `jobs.<job-id>.matrix`
- `jobs.<job-id>.env`
- `jobs.<job-id>.when`
- `jobs.<job-id>.steps`
- `jobs.<job-id>.steps[].name`
- `jobs.<job-id>.steps[].run`
- `jobs.<job-id>.steps[].action`
- `jobs.<job-id>.steps[].input`
- `jobs.<job-id>.steps[].env`

### Workflow

| Key         | Description                                                         | Type                         |
| ----------- | ------------------------------------------------------------------- | ---------------------------- |
| name        | The name of the workflow.                                           | `string`                     |
| description | The description of the workflow.                                    | `string`                     |
| when        | The conditions that must be met for the workflow to run.            | [`when`](#when)              |
| defaults    | The default values for the workflow.                                | [`defaults`](#defaults)      |
| env         | The environment variables that are available to all jobs and steps. | `string[]`                   |
| jobs        | The jobs that are part of the workflow.                             | [`record<string,job>`](#job) |

### Job

| Key         | Description                                              | Type                 |
| ----------- | -------------------------------------------------------- | -------------------- |
| name        | The name of the job.                                     | `string`             |
| description | The description of the job.                              | `string`             |
| matrix      | The matrix of the job.                                   | `string`, `string[]` |
| env         | The environment variables that are available to the job. | `object`             |
| when        | The conditions that must be met for the job to run.      | [`when`](#when)      |
| steps       | The steps that are part of the job.                      | [`step[]`](#step)    |

### Step

| Key    | Description                                               | Type            |
| ------ | --------------------------------------------------------- | --------------- |
| name   | The name of the step.                                     | `string`        |
| run    | The script that is executed by the step.                  | `string`        |
| action | The action that is executed by the step.                  | `string`        |
| input  | The input that is passed to the action.                   | `object`        |
| env    | The environment variables that are available to the step. | `object`        |
| when   | The conditions that must be met for the step to run.      | [`when`](#when) |

### `when`

| Key     | Description                                              | Type                                        |
| ------- | -------------------------------------------------------- | ------------------------------------------- |
| `event` | The event that triggered the workflow.                   | `string`, `string[]`                        |
| `all`   | The conditions that must be met for the workflow to run. | `string`, `string[]`, `boolean`, `when-run` |
| `any`   | The conditions that must be met for the workflow to run. | `string`, `string[]`, `boolean`, `when-run` |

### `when-run`

| Key     | Description                 | Type     |
| ------- | --------------------------- | -------- |
| `run`   | Deno script to run          | `string` |
| `input` | Input to pass to the script | `object` |

### `defaults`

| Key          | Description                          | Type                        |
| ------------ | ------------------------------------ | --------------------------- |
| `permission` | Permissions for a job step           | [`permission`](#permission) |
| `env`        | Environment variables for a job step | `object`                    |

### `permission`

| Key      | Description                                  | Type               |
| -------- | -------------------------------------------- | ------------------ |
| run      | Allow action to run a sub process            | `permission-value` |
| read     | Allow action to read files                   | `permission-value` |
| write    | Allow action to write files                  | `permission-value` |
| net      | Allow action to access the network           | `permission-value` |
| env      | Allow action to access environment variables | `permission-value` |
| sys      | Allow action to access the system            | `permission-value` |
| ffi      | Allow action to access FFI                   | `permission-value` |
| unstable | Allow action to access unstable APIs         | `boolean`          |

### `permission-value`

Permission value can be `true`, `false`, `string`, or `string[]`
