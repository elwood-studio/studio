# Workflow

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

| Key                                                 | Description                                                         | Type                                              |
| --------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| [name](#name)                                       | The name of the workflow.                                           | `string`                                          |
| [description](#description)                         | The description of the workflow.                                    | `string`                                          |
| [when](#when)                                       | The conditions that must be met for the workflow to run.            | [`when`](#when), `string`, `string[]`, `boolean`  |
| [defaults](#defaults)                               | The default values for the workflow.                                | `object`                                          |
| [env](#env)                                         | The environment variables that are available to all jobs and steps. | `string[]`                                        |
| [jobs](#jobs)                                       | The jobs that are part of the workflow.                             | `object`                                          |
| [jobs.<job_id>](#jobsjob_id)                        | The job that is part of the workflow.                               | `object`                                          |
| [jobs.<job_id>.name](#jobsjob_idname)               | The name of the job.                                                | `string`                                          |
| [jobs.<job_id>.description](#jobsjob_iddescription) | The description of the job.                                         | `string`                                          |
| [jobs.<job_id>.matrix](#jobsjob_idmatrix)           | The matrix of the job.                                              | `string`, `string[]`                              |
| [jobs.<job_id>.env](#jobsjob_idenv)                 | The environment variables that are available to the job.            | `object`                                          |
| [jobs.<job_id>.when](#jobsjob_idwhen)               | The conditions that must be met for the job to run.                 | [`when`](#when), `string`, `string[]`, `boolean`, |
| [jobs.<job_id>.steps](#jobsjob_idsteps)             | The steps that are part of the job.                                 | `object`                                          |
| [jobs.<job_id>.steps[].name](#jobsjob_idstepsname)  | The name of the step.                                               | `string`                                          |
| [jobs.<job_id>.steps[].run](#jobsjob_idstepsrun)    | The script that is executed by the step.                            | `string`                                          |
| [jobs.<job_id>.steps[].action](#jobsjob_idsteps)    | The action that is executed by the step.                            | `string`                                          |
| [jobs.<job_id>.steps[].input](#jobsjob_idsteps)     | The input that is passed to the action.                             | `object`                                          |
| [jobs.<job_id>.steps[].env](#jobsjob_idsteps)       | The environment variables that are available to the step.           | `object`                                          |
| [jobs.<job_id>.steps[].when](#jobsjob_idsteps)      | The conditions that must be met for the step to run.                | [`when`](#when), `string`, `string[]`, `boolean`  |

## Fields

### `name`

### `description`

### `when`

### `defaults`

### `env`

### `jobs`

### `jobs.<job_id>`

### `jobs.<job_id>.name`

### `jobs.<job_id>.description`

### `jobs.<job_id>.matrix`

### `jobs.<job_id>.env`

### `jobs.<job_id>.when`

### `jobs.<job_id>.steps[]`

### `jobs.<job_id>.steps[].name`

### `jobs.<job_id>.steps[].run`

### `jobs.<job_id>.steps[].action`

### `jobs.<job_id>.steps[].input`

### `jobs.<job_id>.steps[].env`

### `jobs.<job_id>.steps[].when`

## Types

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
