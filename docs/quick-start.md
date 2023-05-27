# Quick Start Guide

## 1. Create Your Project

```bash
curl -fsSL https://elwood.studio/install.sh | sh
```

<details>
  <summary>Other ways to install Elwood CLI</summary>
  
**Homebrew**

```bash
brew install elwood-studio/tap/cli
```

**Package Manager**

```bash
# npm
npm install -g elwood-studio

# yarn
yarn add global elwood-studio

# pnpm
pnpm add global elwood-studio
```

```bash
curl -fsSL https://elwood.studio/install.sh | sh
```

</details>

## 2. Start the local server

```bash
elwood start
```

## 3. Upload a file

```bash
elwood fs:upload https://x.elwood.studio/bunny.mp4
```

## 4. Start a workflow

```bash
elwood workflow:run clip-video --input.file=elwood://bunny.mp4
```
