import { existsSync, readFileSync, writeFileSync, writeJSONSync } from 'fs-extra'
import { merge, omit } from 'lodash'
import { CommonPackageJsonFields, UserNapiConfig } from '../types'
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
      binaryName: ['index'],
      packageName: pkgJson.name,
      targets: [],
      packageJson: pkgJson,
      npmClient: 'npm',
    },
    omit(userNapiConfig, 'targets')
  )

  let targets = userNapiConfig.targets ?? []

  // compatible with old config
  napiConfig.binaryName = userNapiConfig.binaryName

  napiConfig.targets = targets.map(parseTriple)

  return napiConfig
}

export function updatePackageJson(path: string, partial: Record<string, any>) {
  const exists = existsSync(path)
  if (!exists) {
    return
  }
  const old = require(path)
  writeJSONSync(path, { ...old, ...partial })
}
