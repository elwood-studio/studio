# Elwood Command Line Interface

## Install

```bash
# Mac & Linux
brew install elwood-studio/tap/elwood

# Node Packages
pnpm add -g elwood
yarn add -g elwood
npm install -g elwood
```

## Commands

```bash
Usage: elwood <command> [options]

Commands:
  elwood                                    Show help                  [default]
  elwood start                              start the server using docker-compose
  elwood stop                               stop the server
  elwood init                               initialize a new project in the current directory
  elwood workflow:run [workflow]            run a workflow
  elwood workflow:report <tracking-id>      Get the report of a workflow
  elwood workflow:execute <workflow>        Execute a workflow directly, without the local or remote API
  elwood workflow:config [workflow]         List all workflow configurations registered with the server
  elwood fs:upload <source> <destination>   upload a file or folder
  elwood fs:copy <source> <destination>     copy a local or remote file to a destination
  elwood fs:download <source> [destination] download a file or folder
  elwood fs:share <type> <path>             share a file
  elwood fs:mkdir <path>                    create a directory
  elwood fs:ls [path]                       list a director
  elwood create                             create a new project

Options:
      --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
  -r, --root-dir    Change the root directory of the project.
                                                         [string] [default: "."]
  -l, --local       Run commands against the local instance.
                                                      [boolean] [default: false]
      --api-url     Base URL for the remote API
                                 [string] [default: "https://api.elwood.studio"]
      --project-id  ID of the Elwood Studio project                     [string]

For more information, visit https://elwood.studio
```
