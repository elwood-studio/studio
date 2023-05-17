# Elwood Studio Workflow
Automate your media pipeline

## Documentation 
Documentation is available at [elwood.studio/docs/workflow](https://elwood.studio/docs/workflow).

## Packages
 - [runner](./runner) Application is used to execute workflows
 - [config](./config) Used to read, validate & normalize workflow [configuration files](https://elwood.studio/docs/workflow/configuration)
 - [secrets](./secrets) Secrets Manager for encrypting and decrypting workflow [secrets](https://elwood.studio/docs/workflow/secrets)
 - [server](./server) HTTP Server for managing a workflow runner

## Examples
Run examples locally:
```
yarn cli ./examples/01-hello-world.js
```

## Actions
Actions are the building blocks of Workflows.

 - Documentation at [elwood.studio/docs/workflow/actions](https://elwood.studio/docs/workflow/actions)
 - Prebuilt Action library at [github.com/elwood-studio/actions](https://github.com/elwood-studio/actions)