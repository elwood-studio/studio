# Elwood CLI

Command Line Interface for Elwood

[![npm (scoped)](https://img.shields.io/npm/v/@elwood/cli)](https://www.npmjs.com/package/@elwood/cli)

## Overview

**Elwood** is an open source Dropbox alternative, built for advanced media management. Lighting fast uploads. Real-time, multi-user collaboration. Powerful role-based sharing. Simple one-click distribution.

- 📖 [Documentation and Reference](https://elwood.studio/docs/cli)
- 🚀 [More about Elwood Studio](https://github.com/elwood-studio/elwood/blob/main/readme.md)

## Install

### Node

```bash
# as a global dependency
yarn global add elwood
npm install -g elwood
pnpm add -g elwood
```

### macOS

```bash
# available from homebrew
brew install elwood-studio/tap/cli

# to update
brew upgrade elwood-studio
```

## Usage

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

## :raised_hand: Support

- [Community Forum](https://github.com/orgs/elwood-studio/discussions): Good for developer discussion, help debugging, ask questions. **Not sure, start here**
- [Discord](https://discord.gg/ZxWKPeABNG): Join our Discord Server
- [GitHub Issues](https://github.com/elwood-studio/elwood/issues): Good for bugs and errors in running Elwood Studio locally
- [Email Support](mailto:support@elwood.studio): Good for errors using Elwood Studio Cloud.

## 🏛️ License

Distributed under the Apache-2.0 license. See [LICENSE](https://github.com/elwood-studio/elwood/blob/main/LICENSE) for more information.

## 📧 Contact

Elwood Studio - [support@elwood.studio](mailto:support@elwood.studio)
