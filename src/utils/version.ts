import { join, resolve } from 'path'
import type { VersionOptions } from '../types'
import { readNapiConfig, updatePackageJson } from './config'
import { applyDefaultVersionOptions } from './def'

export function version(userOptions: VersionOptions) {
  const options = applyDefaultVersionOptions(userOptions)
  const packageJsonPath = resolve(options.cwd, options.packageJsonPath)

  const config = readNapiConfig(
    packageJsonPath,
    options.configPath ? resolve(options.cwd, options.configPath) : undefined
  )

  for (const target of config.targets) {
    const pkgDir = resolve(options.cwd, options.npmDir, target.platformArchABI)

    updatePackageJson(join(pkgDir, 'package.json'), {
      version: config.packageJson.version,
    })
  }
}
