# Elwood Workflow

Workflows are a collection of jobs that can be run sequentially or in parallel.

- [Elwood Workflow](#elwood-workflow)
  - [Configuration](#configuration)
    - [Example](#example)
    - [Syntax](#syntax)
      - [Workflow](#workflow)
      - [Job](#job)
      - [Step](#step)
      - [`when`](#when)
      - [`when-run`](#when-run)
      - [`defaults`](#defaults)
      - [`permission`](#permission)
      - [`permission-value`](#permission-value)
  - [Service](#service)
    - [Endpoints](#endpoints)
      - [`POST /workflow/v1/event/:name`](#post-workflowv1eventname)
      - [`GET|POST|PUT /workflow/v1/trigger`](#getpostput-workflowv1trigger)
      - [`POST /workflow/v1/run`](#post-workflowv1run)
      - [`GET /workflow/v1/run/:tracking-id`](#get-workflowv1runtracking-id)
      - [`GET /workflow/v1/config`](#get-workflowv1config)
      - [`GET /workflow/v1/config/:name`](#get-workflowv1configname)
      - [`GET /workflow/v1/config/:name/resolve`](#get-workflowv1confignameresolve)
      - [`POST /workflow/v1/config/resolve`](#post-workflowv1configresolve)
  - [Guides](#guides)
    - [Respond to a S3 Notification](#respond-to-a-s3-notification)
      - [1. Create a trigger workflow](#1-create-a-trigger-workflow)
      - [2. Create a workflow to handle S3:ObjectCreated:\*](#2-create-a-workflow-to-handle-s3objectcreated)
      - [3. Create an SNS Topic](#3-create-an-sns-topic)
      - [4. Create S3 Bucket Notifications](#4-create-s3-bucket-notifications)
      - [5. Subscribe to S3 SNS Topic](#5-subscribe-to-s3-sns-topic)

## Configuration

Workflows are a collection of jobs that can be run sequentially or in parallel. They can be triggered by an event or run on a schedule. You can define your workflows in [YAML](https://learnxinyminutes.com/docs/yaml/) (`.yml` or `.yaml`) or [JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON) (`.json`).

### Example

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

### Syntax

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

#### Workflow

| Key         | Description                                                         | Type                         |
| ----------- | ------------------------------------------------------------------- | ---------------------------- |
| name        | The name of the workflow.                                           | `string`                     |
| description | The description of the workflow.                                    | `string`                     |
| when        | The conditions that must be met for the workflow to run.            | [`when`](#when)              |
| defaults    | The default values for the workflow.                                | [`defaults`](#defaults)      |
| env         | The environment variables that are available to all jobs and steps. | `string[]`                   |
| jobs        | The jobs that are part of the workflow.                             | [`record<string,job>`](#job) |

#### Job

| Key         | Description                                              | Type                 |
| ----------- | -------------------------------------------------------- | -------------------- |
| name        | The name of the job.                                     | `string`             |
| description | The description of the job.                              | `string`             |
| matrix      | The matrix of the job.                                   | `string`, `string[]` |
| env         | The environment variables that are available to the job. | `object`             |
| when        | The conditions that must be met for the job to run.      | [`when`](#when)      |
| steps       | The steps that are part of the job.                      | [`step[]`](#step)    |

#### Step

| Key    | Description                                               | Type            |
| ------ | --------------------------------------------------------- | --------------- |
| name   | The name of the step.                                     | `string`        |
| run    | The script that is executed by the step.                  | `string`        |
| action | The action that is executed by the step.                  | `string`        |
| input  | The input that is passed to the action.                   | `object`        |
| env    | The environment variables that are available to the step. | `object`        |
| when   | The conditions that must be met for the step to run.      | [`when`](#when) |

#### `when`

| Key     | Description                                              | Type                                        |
| ------- | -------------------------------------------------------- | ------------------------------------------- |
| `event` | The event that triggered the workflow.                   | `string`, `string[]`                        |
| `all`   | The conditions that must be met for the workflow to run. | `string`, `string[]`, `boolean`, `when-run` |
| `any`   | The conditions that must be met for the workflow to run. | `string`, `string[]`, `boolean`, `when-run` |

#### `when-run`

| Key     | Description                 | Type     |
| ------- | --------------------------- | -------- |
| `run`   | Deno script to run          | `string` |
| `input` | Input to pass to the script | `object` |

#### `defaults`

| Key          | Description                          | Type                        |
| ------------ | ------------------------------------ | --------------------------- |
| `permission` | Permissions for a job step           | [`permission`](#permission) |
| `env`        | Environment variables for a job step | `object`                    |

#### `permission`

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

#### `permission-value`

Permission value can be `true`, `false`, `string`, or `string[]`

## Service

### Endpoints

#### `POST /workflow/v1/event/:name`

#### `GET|POST|PUT /workflow/v1/trigger`

#### `POST /workflow/v1/run`

#### `GET /workflow/v1/run/:tracking-id`

#### `GET /workflow/v1/config`

#### `GET /workflow/v1/config/:name`

#### `GET /workflow/v1/config/:name/resolve`

#### `POST /workflow/v1/config/resolve`

## Guides

### Respond to a S3 Notification

#### 1. Create a trigger workflow

Save the workflow to `./elwood/workflow/s3-sns-file-event.yml`

```yaml
name: s3-sns-file-event
when:
  event: trigger
  any:
    - "{% elwood.trigger.header['x-amz-sns-message-type] === 'SubscriptionConfirmation' %}"
    - "{% elwood.trigger.header['x-amz-sns-message-type] === 'Notification' %}"
env:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_DEFAULT_REGION
jobs:
  subscription:
    when: "{% elwood.trigger.header['x-amz-sns-message-type] === 'SubscriptionConfirmation' %}"
    steps:
      - action: run/aws
        env:
          AWS_ACCESS_KEY_ID: ${env.AWS_ACCESS_KEY_ID}
          AWS_SECRET_ACCESS_KEY: ${env.AWS_SECRET_ACCESS_KEY}
          AWS_DEFAULT_REGION: ${env.AWS_DEFAULT_REGION}
        input:
          args: 'sns confirm-subscription --topic-arn {% elwood.trigger.body.TopicArn %} --token {% elwood.trigger.body.Token %}'
  notification:
    when: "{% elwood.trigger.header['x-amz-sns-message-type] === 'Notification' %}"
    steps:
      - name: parse-sns-message
        input:
          message: '{% elwood.trigger.body.Message %}'
        run: |
          const message = JSON.parse(core.getInput('message'));
          const records = message?.Records ?? [];

          // loop through each record and trigger a workflow event
          await Promise.all(records.map(async (record) => {
            await sdk.workflow.event(record.eventName, record);
          })
```

#### 2. Create a workflow to handle S3:ObjectCreated:\*

Save the workflow to `./elwood/workflow/s3-create-event.yml`

```yaml
name: s3-create-event
when:
  event:
    - s3:ObjectCreated:Copy
    - s3:ObjectCreated:Post
    - s3:ObjectCreated:Put
env:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_DEFAULT_REGION
jobs:
  transcribe:
    when: "{% ['.mov','.mp4','.mp3'].includes(extname(elwood.trigger.s3.object.key)) %}"
    steps:
      - name: source
        action: run/output
        input:
          name: value
          value: 'source{% extname(elwood.trigger.s3.object.key) %}'
      - action: run/aws
        env:
          AWS_ACCESS_KEY_ID: ${env.AWS_ACCESS_KEY_ID}
          AWS_SECRET_ACCESS_KEY: ${env.AWS_SECRET_ACCESS_KEY}
          AWS_DEFAULT_REGION: ${env.AWS_DEFAULT_REGION}
        input:
          args:
            - s3
            - cp
            - 's3://{% elwood.trigger.s3.bucket.name %}/{% elwood.trigger.s3.object.key %}'
            - '{% job.source.outputs.source.value %}'
      - action: run/whisper
        input:
          src: ${job.source.outputs.source.value}
```

#### 3. Create an SNS Topic

```base
aws sns create-topic s3-event-notifications
```

#### 4. Create S3 Bucket Notifications

```bash
aws s3api put-bucket-notification-configuration \
  --bucket $BUCKET_NAME \
  --notification-configuration '{"TopicConfigurations": [{"Id": "string", "TopicArn": "$TOPIC_ARN", "Events": ["s3:*"]}]}'
```

#### 5. Subscribe to S3 SNS Topic

```bash
aws sns subscribe
  --topic-arn $TOPIC_ARN
  --protocol https
  --notification-endpoint https://demo.elwood.cloud/workflow/v1/trigger
```
