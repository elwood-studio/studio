# Elwood Workflow Guides

## Respond to a S3 Notification

### 1. Create a trigger workflow

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

### 2. Create a workflow to handle S3:ObjectCreated:\*

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

## 3. Create an SNS Topic

```base
aws sns create-topic s3-event-notifications
```

### 4. Create S3 Bucket Notifications

```bash
aws s3api put-bucket-notification-configuration \
  --bucket $BUCKET_NAME \
  --notification-configuration '{"TopicConfigurations": [{"Id": "string", "TopicArn": "$TOPIC_ARN", "Events": ["s3:*"]}]}'
```

### 5. Subscribe to S3 SNS Topic

```bash
aws sns subscribe
  --topic-arn $TOPIC_ARN
  --protocol https
  --notification-endpoint https://demo.elwood.cloud/workflow/v1/trigger
```
