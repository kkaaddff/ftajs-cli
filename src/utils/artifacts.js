const fs = require('fs')
const { program } = require('commander')
const { promisify } = require('util')
const { UniArchsByPlatform, readNapiConfig } = require('./config.js')
const { applyDefaultArtifactsOptions } = require('./def.js')

const readdirAsync = promisify(fs.readdir)
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const statAsync = promisify(fs.stat)

async function fileExists(path) {
  const exists = await statAsync(path)
    .then(() => true)
    .catch(() => false)
  return exists
}

module.exports = {
  readdirAsync,
  readFileAsync,
  writeFileAsync,
  statAsync,
  fileExists,
}

program
  .option(
    '--cwd <path>',
    'The working directory of where napi command will be executed in, all other paths options are relative to this path',
    process.cwd()
  )
  .option('--config-path, -c <path>', 'Path to `napi` config json file')
  .option('--package-json-path <path>', 'Path to `package.json`', 'package.json')
  .option(
    '--output-dir, -o, -d <path>',
    'Path to the folder where all built `.node` files put, same as `--output-dir` of build command',
    './artifacts'
  )
  .option('--npm-dir <path>', 'Path to the folder where the npm packages put', 'npm')
  .option(
    '--build-output-dir <path>',
    'Path to the build output dir, only needed when targets contains `wasm32-wasi-*`'
  )

program.parse(process.argv)

const options = program.opts()

const cwd = options.cwd || process.cwd()
const configPath = options.configPath
const packageJsonPath = options.packageJsonPath || 'package.json'
const outputDir = options.outputDir || './artifacts'
const npmDir = options.npmDir || 'npm'
const buildOutputDir = options.buildOutputDir

async function collectNodeBinaries(root) {
  const files = await readdirAsync(root, { withFileTypes: true })
  const nodeBinaries = files
    .filter((file) => file.isFile() && (file.name.endsWith('.node') || file.name.endsWith('.wasm')))
    .map((file) => join(root, file.name))

  const dirs = files.filter((file) => file.isDirectory())
  for (const dir of dirs) {
    if (dir.name !== 'node_modules') {
      nodeBinaries.push(...(await collectNodeBinaries(join(root, dir.name))))
    }
  }
  return nodeBinaries
}

async function collectArtifacts(userOptions) {
  const options = applyDefaultArtifactsOptions(userOptions)

  const packageJsonPath = join(options.cwd, options.packageJsonPath)
  const { targets, binaryName } = await readNapiConfig(packageJsonPath)

  const distDirs = targets.map((platform) => join(options.cwd, options.npmDir, platform.platformArchABI))

  const universalSourceBins = new Set(
    targets
      .filter((platform) => platform.arch === 'universal')
      .flatMap((p) => UniArchsByPlatform[p.platform]?.map((a) => `${p.platform}-${a}`))
      .filter(Boolean)
  )

  await collectNodeBinaries(join(options.cwd, options.outputDir)).then((output) =>
    Promise.all(
      output.map(async (filePath) => {
        console.info(`Read [${filePath}]`)
        const sourceContent = await readFileAsync(filePath)
        const parsedName = parse(filePath)
        const terms = parsedName.name.split('.')
        const platformArchABI = terms.pop()
        const _binaryName = terms.join('.')

        if (_binaryName !== binaryName) {
          console.warn(`[${_binaryName}] is not matched with [${binaryName}], skip`)
          return
        }
        const dir = distDirs.find((dir) => dir.includes(platformArchABI))
        if (!dir && universalSourceBins.has(platformArchABI)) {
          console.warn(`[${platformArchABI}] has no dist dir but it is source bin for universal arch, skip`)
          return
        }
        if (!dir) {
          throw new Error(`No dist dir found for ${filePath}`)
        }

        const distFilePath = join(dir, parsedName.base)
        console.info(`Write file content to [${distFilePath}]`)
        await writeFileAsync(distFilePath, sourceContent)
        const distFilePathLocal = join(parse(packageJsonPath).dir, parsedName.base)
        console.info(`Write file content to [${distFilePathLocal}]`)
        await writeFileAsync(distFilePathLocal, sourceContent)
      })
    )
  )

  const wasiTarget = targets.find((t) => t.platform === 'wasi')
  if (wasiTarget) {
    const wasiDir = join(options.cwd, options.npmDir, wasiTarget.platformArchABI)
    const cjsFile = join(options.buildOutputDir ?? options.cwd, `${binaryName}.wasi.cjs`)
    const workerFile = join(options.buildOutputDir ?? options.cwd, `wasi-worker.mjs`)
    console.info(`Move wasi cjs file [${cjsFile}] to [${wasiDir}]`)
    await writeFileAsync(join(wasiDir, `${binaryName}.wasi.cjs`), await readFileAsync(cjsFile))
    console.info(`Move wasi worker file [${workerFile}] to [${wasiDir}]`)
    await writeFileAsync(join(wasiDir, `wasi-worker.mjs`), await readFileAsync(workerFile))
  }
}

async function run() {
  await collectArtifacts({
    cwd: cwd,
    configPath: configPath,
    packageJsonPath: packageJsonPath,
    outputDir: outputDir,
    npmDir: npmDir,
    buildOutputDir: buildOutputDir,
  })
}

run()
