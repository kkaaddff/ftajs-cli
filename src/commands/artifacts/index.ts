import { Command, Flags } from '@oclif/core'
import { readFileSync, readdirSync, writeFileSync } from 'fs-extra'
import { join, parse } from 'path'
import type { TUserOptions } from '../../types'
import { UniArchsByPlatform, readNapiConfig } from '../../utils/config'
import { applyDefaultArtifactsOptions } from '../../utils/def'

function collectNodeBinaries(root: string) {
  const files = readdirSync(root, { withFileTypes: true })
  const nodeBinaries = files
    .filter((file) => file.isFile() && (file.name.endsWith('.node') || file.name.endsWith('.wasm')))
    .map((file) => join(root, file.name))

  const dirs = files.filter((file) => file.isDirectory())
  for (const dir of dirs) {
    if (dir.name !== 'node_modules') {
      nodeBinaries.push(...collectNodeBinaries(join(root, dir.name)))
    }
  }
  return nodeBinaries
}

async function collectArtifacts(userOptions: TUserOptions) {
  const options = applyDefaultArtifactsOptions(userOptions)

  const packageJsonPath = join(options.cwd, options.packageJsonPath)
  const { targets, binaryName } = readNapiConfig(packageJsonPath)

  const distDirs = targets.map((platform) => join(options.cwd, options.npmDir, platform.platformArchABI))

  const universalSourceBins = new Set(
    targets
      .filter((platform) => platform.arch === 'universal')
      // @ts-ignore
      .flatMap((p) => UniArchsByPlatform[p.platform]?.map((a) => `${p.platform}-${a}`))
      .filter(Boolean)
  )

  const output = collectNodeBinaries(join(options.cwd, options.outputDir))

  output.map((filePath) => {
    console.info(`Read [${filePath}]`)
    const sourceContent = readFileSync(filePath)
    const parsedName = parse(filePath)
    const terms = parsedName.name.split('.')
    const platformArchABI = terms.pop()
    const _binaryName = terms.join('.')

    if (_binaryName !== binaryName) {
      console.warn(`[${_binaryName}] is not matched with [${binaryName}], skip`)
      return
    }
    const dir = distDirs.find((dir) => dir.includes(platformArchABI!))
    if (!dir && universalSourceBins.has(platformArchABI)) {
      console.warn(`[${platformArchABI}] has no dist dir but it is source bin for universal arch, skip`)
      return
    }
    if (!dir) {
      throw new Error(`No dist dir found for ${filePath}`)
    }

    const distFilePath = join(dir, parsedName.base)
    console.info(`Write file content to [${distFilePath}]`)
    writeFileSync(distFilePath, sourceContent)
    const distFilePathLocal = join(parse(packageJsonPath).dir, parsedName.base)
    console.info(`Write file content to [${distFilePathLocal}]`)
    writeFileSync(distFilePathLocal, sourceContent)
  })

  const wasiTarget = targets.find((t) => t.platform === 'wasi')

  if (wasiTarget) {
    const wasiDir = join(options.cwd, options.npmDir, wasiTarget.platformArchABI)
    const cjsFile = join(options.buildOutputDir ?? options.cwd, `${binaryName}.wasi.cjs`)
    const workerFile = join(options.buildOutputDir ?? options.cwd, `wasi-worker.mjs`)
    console.info(`Move wasi cjs file [${cjsFile}] to [${wasiDir}]`)
    writeFileSync(join(wasiDir, `${binaryName}.wasi.cjs`), readFileSync(cjsFile))
    console.info(`Move wasi worker file [${workerFile}] to [${wasiDir}]`)
    writeFileSync(join(wasiDir, `wasi-worker.mjs`), readFileSync(workerFile))
  }
}

export default class Artifacts extends Command {
  static description = '处理下载下来的 Artifacts'

  static examples = [
    `$ ftajs artifacts
artifacts successfully processed! 
`,
  ]

  static flags = {
    cwd: Flags.string({
      char: 'c',
      default: process.cwd(),
      description: 'The working directory of where napi command will be executed in',
    }),
    'config-path': Flags.string({
      char: 'c',
      description: 'Path to `napi` config json file',
    }),
    'package-json-path': Flags.string({
      description: 'Path to `package.json`',
      default: 'package.json',
    }),
    'output-dir': Flags.string({
      char: 'o',
      description: 'Path to the folder where all built `.node` files put',
      default: './artifacts',
    }),
    'npm-dir': Flags.string({
      description: 'Path to the folder where the npm packages put',
      default: 'npm',
    }),
    'build-output-dir': Flags.string({
      description: 'Path to the build output dir, only needed when targets contains `wasm32-wasi-*`',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Artifacts)

    const options = flags

    const cwd = options.cwd || process.cwd()
    const configPath = options.configPath
    const packageJsonPath = options.packageJsonPath || 'package.json'
    const outputDir = options.outputDir || './artifacts'
    const npmDir = options.npmDir || 'npm'
    const buildOutputDir = options.buildOutputDir

    await collectArtifacts({
      cwd: cwd,
      configPath: configPath,
      packageJsonPath: packageJsonPath,
      outputDir: outputDir,
      npmDir: npmDir,
      buildOutputDir: buildOutputDir,
    })

    this.log(`hello ${flags.from}! (./src/commands/artifacts/index.ts)`)
  }
}
