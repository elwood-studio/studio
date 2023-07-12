<p align="center">
<img src="https://raw.githubusercontent.com/elwood-studio/.github/main/profile/gh-banner-light.png#gh-light-mode-only">
<img src="https://raw.githubusercontent.com/elwood-studio/.github/main/profile/gh-banner-dark.png#gh-dark-mode-only">
</p>

<p align="center">
<small>
<a href="https://elwood.studio">elwood.studio</a> &#8226; 
<a href="mailto:mailto:hello@elwood.studio">Email Us</a> &#8226;
<a href="https://discord.gg/ZxWKPeABNG">Discord</a>
</small>
</p>

<p>&nbsp;</p>

# What is Elwood

**Elwood** is an open source Dropbox alternative, built for advanced media management. Lighting fast uploads. Real-time, multi-user collaboration. Powerful role-based sharing. Simple one-click distribution.

<p>Elwood is currently in public <strong>BETA</strong>. We are actively developing and improving the code & documentation. If you have any questions, please reach out to us at <a href="mailto:hello@elwood.studio">hello@elwood.studio</a>.</p>

## 📖 Documentation

- [File System](./docs/fs.md)
- [Workflow](./docs/workflow.md)
- [Command Line Interface](./docs/cli.md)

## 🚀 Getting Started

### Install

```bash
# Mac & Linux
brew install elwood-studio/tap/elwood

# Node Packages
pnpm add -g elwood
yarn add -g elwood
npm install -g elwood
```

### Usage

```bash
# initialize a new workspace
elwood init

# start a local server using docker-compose
elwood start

# Copy a file from the internet to the workspace
elwood fs:copy https://x.elwood.studio/p/bunny.mp4 /bunny.mp4

# Create a workflow run to generate an MP3 of the bunny video
elwood workflow:run @mp3.yml --input.src="elwood://bunny.mp4" --input.dest="elwood://bunny.mp3" --wait

# Download the MP3
elwood fs:download /bunny.mp3

# Create a link to the file with a password
elwood fs:share link /bunny.mp3 --password=test

# stop local server
elwood stop
```

## 💻 Development

```bash
# Setup development environment for working with ./packages
make ready

# Start development watch process
make dev

# Get some information about what you can do with make
make help
```

## :raised_hand: Support

- [Community Forum](https://github.com/orgs/elwood-studio/discussions): Good for developer discussion, help debugging, ask questions. **Not sure, start here**
- [Discord](https://discord.gg/ZxWKPeABNG): Join our Discord Server
- [GitHub Issues](https://github.com/elwood-studio/elwood/issues): Good for bugs and errors in running Elwood locally
- [Email Support](mailto:support@elwood.studio): Good for errors using Elwood Studio Cloud.

## 🏛️ License

Distributed under the Apache-2.0 license. See [LICENSE](LICENSE) for more information.

## 📧 Contact

Elwood Studio - [support@elwood.studio](mailto:support@elwood.studio)
