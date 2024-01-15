import { existsSync, readFileSync } from 'fs-extra'
import { merge, omit } from 'lodash'
import type { Target } from './triple'
import { parseTriple } from './triple'

export const DEFAULT_TARGETS = [
  'x86_64-apple-darwin',
  'aarch64-apple-darwin',
  'x86_64-pc-windows-msvc',
  'x86_64-unknown-linux-gnu',
]

export const UniArchsByPlatform = {
  darwin: ['x64', 'arm64'],
}

export interface UserNapiConfig {
  /**
   * Name of the binary to be generated, default to `index`
   */
  binaryName?: string
  /**
   * Name of the npm package, default to the name of root package.json name
   *
   * Always given `@scope/pkg` and arch suffix will be appended like `@scope/pkg-linux-gnu-x64`
   */
  packageName?: string
  /**
   * All targets the crate will be compiled for
   */
  targets?: string[]

  /**
   * The npm client project uses.
   */
  npmClient?: string

  /**
   * Whether generate const enum for typescript bindings
   */
  constEnum?: boolean

  /**
   * @deprecated binaryName instead
   */
  name?: string
  /**
   * @deprecated use packageName instead
   */
  package?: {
    name?: string
  }
  /**
   * @deprecated use targets instead
   */
  triples?: {
    /**
     * Whether enable default targets
     */
    defaults: boolean
    /**
     * Additional targets to be compiled for
     */
    additional?: string[]
  }
}
export interface CommonPackageJsonFields {
  name: string
  version: string
  description?: string
  keywords?: string[]
  author?: string
  authors?: string[]
  license?: string
  repository?: any
  homepage?: any
  engines?: Record<string, string>
  publishConfig?: any
  bugs?: any
  // eslint-disable-next-line no-use-before-define
  napi?: UserNapiConfig
  type?: 'module' | 'commonjs'
  scripts?: Record<string, string>

  // modules
  main?: string
  module?: string
  types?: string
  exports?: any

  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>

  ava?: {
    timeout?: string
  }
}

export type NapiConfig = Required<Pick<UserNapiConfig, 'binaryName' | 'packageName' | 'npmClient'>> & {
  targets: Target[]
  packageJson: CommonPackageJsonFields
}

export function readNapiConfig(path: string, configPath?: string): NapiConfig {
  if (configPath && !existsSync(configPath)) {
    throw new Error(`NAPI-RS config not found at ${configPath}`)
  }
  if (!existsSync(path)) {
    throw new Error(`package.json not found at ${path}`)
  }
  // May support multiple config sources later on.
  const content = readFileSync(path, 'utf8')
  let pkgJson
  try {
    pkgJson = JSON.parse(content)
  } catch (e) {
    throw new Error(`Failed to parse package.json at ${path}`)
  }

  let separatedConfig
  if (configPath) {
    const configContent = readFileSync(configPath, 'utf8')
    try {
      separatedConfig = JSON.parse(configContent)
    } catch (e) {
      throw new Error(`Failed to parse NAPI-RS config at ${configPath}`)
    }
  }

  const userNapiConfig = pkgJson.napi ?? {}
  if (pkgJson.napi && separatedConfig) {
    const pkgJsonPath = path
    const configPathUnderline = configPath
    console.warn(
      `Both napi field in ${pkgJsonPath} and [NAPI-RS config](${configPathUnderline}) file are found, the NAPI-RS config file will be used.`
    )
    Object.assign(userNapiConfig, separatedConfig)
  }
  const napiConfig = merge(
    {
      binaryName: 'index',
      packageName: pkgJson.name,
      targets: [],
      packageJson: pkgJson,
      npmClient: 'npm',
    },
    omit(userNapiConfig, 'targets')
  )

  let targets = userNapiConfig.targets ?? []

  // compatible with old config
  if (userNapiConfig?.name) {
    console.warn('[DEPRECATED] napi.name is deprecated, use napi.binaryName instead.')
    napiConfig.binaryName = userNapiConfig.name
  }

  if (!targets.length) {
    let deprecatedWarned = false
    const warning = '[DEPRECATED] napi.triples is deprecated, use napi.targets instead.'
    if (userNapiConfig.triples?.defaults) {
      deprecatedWarned = true
      console.warn(warning)
      targets = targets.concat(DEFAULT_TARGETS)
    }

    if (userNapiConfig.triples?.additional?.length) {
      targets = targets.concat(userNapiConfig.triples.additional)
      if (!deprecatedWarned) {
        console.warn(warning)
      }
    }
  }

  napiConfig.targets = targets.map(parseTriple)

  return napiConfig
}
