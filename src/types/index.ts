export type TUserOptions = {
  cwd: string
  packageJsonPath: string
  outputDir: string
  npmDir: string
}

/**
 * Update version in created npm packages
 */
export interface VersionOptions {
  /**
   * The working directory of where napi command will be executed in, all other paths options are relative to this path
   *
   * @default process.cwd()
   */
  cwd?: string
  /**
   * Path to `napi` config json file
   */
  configPath?: string
  /**
   * Path to `package.json`
   *
   * @default 'package.json'
   */
  packageJsonPath?: string
  /**
   * Path to the folder where the npm packages put
   *
   * @default 'npm'
   */
  npmDir?: string
}

export interface UserNapiConfig {
  /**
   * Name of the binary to be generated, default to `index`
   */
  binaryName?: string[]
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

/**
 * Update package.json and copy addons into per platform packages
 */
export interface PrePublishOptions {
  /**
   * The working directory of where napi command will be executed in, all other paths options are relative to this path
   *
   * @default process.cwd()
   */
  cwd?: string
  /**
   * Path to `napi` config json file
   */
  configPath?: string
  /**
   * Path to `package.json`
   *
   * @default 'package.json'
   */
  packageJsonPath?: string
  /**
   * Path to the folder where the npm packages put
   *
   * @default 'npm'
   */
  npmDir?: string
  /**
   * git tag style, `npm` or `lerna`
   *
   * @default 'lerna'
   */
  tagStyle?: string // 'npm' | 'lerna'
  /**
   * Whether create GitHub release
   *
   * @default true
   */
  ghRelease?: boolean
  /**
   * GitHub release name
   */
  ghReleaseName?: string
  /**
   * Existing GitHub release id
   */
  ghReleaseId?: string
  /**
   * Dry run without touching file system
   *
   * @default false
   */
  dryRun?: boolean
}
