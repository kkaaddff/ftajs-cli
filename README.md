# ftajs cli

ftajs cli

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
@ftajs/cli/0.0.1 darwin-arm64 node-v18.17.1
$ ftajs --help [COMMAND]
USAGE
  $ ftajs COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`ftajs artifacts`](#ftajs-artifacts)
* [`ftajs hello PERSON`](#ftajs-hello-person)
* [`ftajs help [COMMANDS]`](#ftajs-help-commands)
* [`ftajs plugins`](#ftajs-plugins)
* [`ftajs plugins:install PLUGIN...`](#ftajs-pluginsinstall-plugin)
* [`ftajs plugins:inspect PLUGIN...`](#ftajs-pluginsinspect-plugin)
* [`ftajs plugins:install PLUGIN...`](#ftajs-pluginsinstall-plugin-1)
* [`ftajs plugins:link PLUGIN`](#ftajs-pluginslink-plugin)
* [`ftajs plugins:uninstall PLUGIN...`](#ftajs-pluginsuninstall-plugin)
* [`ftajs plugins reset`](#ftajs-plugins-reset)
* [`ftajs plugins:uninstall PLUGIN...`](#ftajs-pluginsuninstall-plugin-1)
* [`ftajs plugins:uninstall PLUGIN...`](#ftajs-pluginsuninstall-plugin-2)
* [`ftajs plugins update`](#ftajs-plugins-update)

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

_See code: [src/commands/artifacts/index.ts](https://github.com/kkaaddff/ftajs-cli/blob/v0.0.1/src/commands/artifacts/index.ts)_

## `ftajs hello PERSON`

Say hello

```
USAGE
  $ ftajs hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ ftajs hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/kkaaddff/ftajs-cli/blob/v0.0.1/src/commands/hello/index.ts)_

## `ftajs help [COMMANDS]`

Display help for ftajs.

```
USAGE
  $ ftajs help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ftajs.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.12/src/commands/help.ts)_

## `ftajs plugins`

List installed plugins.

```
USAGE
  $ ftajs plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ftajs plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.16/src/commands/plugins/index.ts)_

## `ftajs plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ ftajs plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ ftajs plugins add

EXAMPLES
  $ ftajs plugins add myplugin 

  $ ftajs plugins add https://github.com/someuser/someplugin

  $ ftajs plugins add someuser/someplugin
```

## `ftajs plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ftajs plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ ftajs plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.16/src/commands/plugins/inspect.ts)_

## `ftajs plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ ftajs plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ ftajs plugins add

EXAMPLES
  $ ftajs plugins install myplugin 

  $ ftajs plugins install https://github.com/someuser/someplugin

  $ ftajs plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.16/src/commands/plugins/install.ts)_

## `ftajs plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ ftajs plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ ftajs plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.16/src/commands/plugins/link.ts)_

## `ftajs plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ftajs plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ftajs plugins unlink
  $ ftajs plugins remove

EXAMPLES
  $ ftajs plugins remove myplugin
```

## `ftajs plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ ftajs plugins reset
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.16/src/commands/plugins/reset.ts)_

## `ftajs plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ftajs plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ftajs plugins unlink
  $ ftajs plugins remove

EXAMPLES
  $ ftajs plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.16/src/commands/plugins/uninstall.ts)_

## `ftajs plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ftajs plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ftajs plugins unlink
  $ ftajs plugins remove

EXAMPLES
  $ ftajs plugins unlink myplugin
```

## `ftajs plugins update`

Update installed plugins.

```
USAGE
  $ ftajs plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.16/src/commands/plugins/update.ts)_
<!-- commandsstop -->
