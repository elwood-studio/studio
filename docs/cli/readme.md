# Elwood Command Line Interface

## Install

```bash
pnpm add -g elwood
yarn add -g elwood
npm install -g elwood
```

## Commands

```bash
Usage: elwood <command> [options]

Commands:
  elwood                                   Show help                   [default]
  elwood start                             start the server using docker-compose
  elwood stop                              stop the server
  elwood init                              initialize a new project in the curre
                                           nt directory
  elwood fs:upload <source> <destination>  upload a file or folder
  elwood fs:download <source>              download a file or folder
  elwood fs:share                          share a file
  elwood workflow:run [workflow]           run a workflow
  elwood workflow:report <tracking-id>     Get the report of a workflow
  elwood workflow:execute <workflow>       Execute a workflow directly, without
                                           the local or remote API
  elwood create                            create a new project

Options:
      --version   Show version number                                  [boolean]
  -h, --help      Show help                                            [boolean]
  -r, --root-dir  Change the root directory of the project.
                                                         [string] [default: "."]
  -l, --local     Run commands against the local instance.
                                                      [boolean] [default: false]
      --api-url   Base URL for the remote API
                                 [string] [default: "https://api.elwood.studio"]
```
