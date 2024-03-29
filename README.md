# ftajs cli

ftajs cli

> --fork from napi/cli
> 处理 ftajs 使用在多平台 分发二进制产物的问题

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [ftajs cli](#ftajs-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @ftajs/cli
$ ftajs COMMAND
running command...
$ ftajs (--version)
@ftajs/cli/0.0.3 darwin-arm64 node-v16.19.1
$ ftajs --help [COMMAND]
USAGE
  $ ftajs COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`ftajs artifacts`](#ftajs-artifacts)
* [`ftajs help [COMMAND]`](#ftajs-help-command)
* [`ftajs prepublish`](#ftajs-prepublish)

## `ftajs artifacts`

处理下载下来的 Artifacts

```
USAGE
  $ ftajs artifacts [-c <value>] [--package-json-path <value>] [-o <value>] [--npm-dir <value>]

FLAGS
  -c, --cwd=<value>                [default: /Users/qiczhang/Documents/ymm2021/fta/cli-ftajs] The working directory of
                                   where napi command will be executed in
  -o, --output-dir=<value>         [default: ./artifacts] Path to the folder where all built `.node` files put
      --npm-dir=<value>            [default: npm] Path to the folder where the npm packages put
      --package-json-path=<value>  [default: package.json] Path to `package.json`

DESCRIPTION
  处理下载下来的 Artifacts

EXAMPLES
  $ ftajs artifacts
  artifacts successfully processed!
```

_See code: [src/commands/artifacts/index.ts](https://github.com/kkaaddff/ftajs-cli/blob/v0.0.3/src/commands/artifacts/index.ts)_

## `ftajs help [COMMAND]`

display help for ftajs

```
USAGE
  $ ftajs help [COMMAND] [--all]

ARGUMENTS
  COMMAND  command to show help for

FLAGS
  --all  see all commands in CLI

DESCRIPTION
  display help for ftajs
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.3.1/src/commands/help.ts)_

## `ftajs prepublish`

更新 package.json 文件并 将 二进制组件 复制到每个平台的包中。

```
USAGE
  $ ftajs prepublish [-c <value>] [--package-json-path <value>] [--config-path <value>] [-p <value>] [-t
    <value>] [--gh-release] [--gh-release-name <value>] [--gh-release-id <value>] [--dry-run]

FLAGS
  -c, --cwd=<value>                [default: /Users/qiczhang/Documents/ymm2021/fta/cli-ftajs] The working directory of
                                   where napi command will be executed in
  -p, --npm-dir=<value>            [default: npm] Path to the folder where the npm packages put
  -t, --tag-style=<value>          [default: lerna] git tag style, `npm` or `lerna`
      --config-path=<value>        Path to `napi` config json file
      --dry-run                    Dry run without touching file system
      --gh-release                 Whether create GitHub release
      --gh-release-id=<value>      Existing GitHub release id
      --gh-release-name=<value>    GitHub release name
      --package-json-path=<value>  [default: package.json] Path to `package.json`

DESCRIPTION
  更新 package.json 文件并 将 二进制组件 复制到每个平台的包中。

EXAMPLES
  $ ftajs prepublish -c ./ -p ./npm -t npm
```

_See code: [src/commands/prepublish/index.ts](https://github.com/kkaaddff/ftajs-cli/blob/v0.0.3/src/commands/prepublish/index.ts)_
<!-- commandsstop -->
