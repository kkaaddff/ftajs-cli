import type { PrePublishOptions, TUserOptions, VersionOptions } from '../types'

export function applyDefaultArtifactsOptions(options: Partial<TUserOptions>) {
  return {
    cwd: process.cwd(),
    packageJsonPath: 'package.json',
    outputDir: './artifacts',
    npmDir: 'npm',
    ...options,
  }
}

export function applyDefaultVersionOptions(options: VersionOptions) {
  return {
    cwd: process.cwd(),
    packageJsonPath: 'package.json',
    npmDir: 'npm',
    ...options,
  }
}

export function applyDefaultPrePublishOptions(options: PrePublishOptions) {
  return {
    cwd: process.cwd(),
    packageJsonPath: 'package.json',
    npmDir: 'npm',
    tagStyle: 'lerna',
    ghRelease: true,
    dryRun: false,
    ...options,
  }
}
