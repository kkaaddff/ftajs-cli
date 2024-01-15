import { TUserOptions } from '../types'

export function applyDefaultArtifactsOptions(options: Partial<TUserOptions>) {
  return {
    cwd: process.cwd(),
    packageJsonPath: 'package.json',
    outputDir: './artifacts',
    npmDir: 'npm',
    ...options,
  }
}
