import { Args, Command, Flags } from '@oclif/core'
import { Octokit } from '@octokit/rest'
import { execSync } from 'child_process'
import { existsSync, statSync } from 'fs'
import { readFileSync } from 'fs-extra'
import { join, resolve } from 'path'
import type { PrePublishOptions } from '../../types'
import { readNapiConfig, updatePackageJson } from '../../utils/config'
import { applyDefaultPrePublishOptions } from '../../utils/def'
import { version } from '../../utils/version'

interface PackageInfo {
  name: string
  version: string
  tag: string
}

async function prePublish(userOptions: PrePublishOptions) {
  const options = applyDefaultPrePublishOptions(userOptions)

  const packageJsonPath = resolve(options.cwd, options.packageJsonPath)

  const { packageJson, targets, packageName, binaryName, npmClient } = readNapiConfig(
    packageJsonPath,
    options.configPath ? resolve(options.cwd, options.configPath) : undefined
  )

  async function createGhRelease(packageName: string, version: string) {
    if (!options.ghRelease) {
      return {
        owner: null,
        repo: null,
        pkgInfo: { name: null, version: null, tag: null },
      }
    }
    const { repo, owner, pkgInfo, octokit } = getRepoInfo(packageName, version)

    if (!repo || !owner) {
      return {
        owner: null,
        repo: null,
        pkgInfo: { name: null, version: null, tag: null },
      }
    }

    if (!options.dryRun) {
      try {
        await octokit.repos.createRelease({
          owner,
          repo,
          tag_name: pkgInfo.tag,
          name: options.ghReleaseName,
          prerelease: version.includes('alpha') || version.includes('beta') || version.includes('rc'),
        })
      } catch (e) {
        console.error(e)
      }
    }
    return { owner, repo, pkgInfo, octokit }
  }

  function getRepoInfo(packageName: string, version: string) {
    const headCommit = execSync('git log -1 --pretty=%B', {
      encoding: 'utf-8',
    }).trim()

    const { GITHUB_REPOSITORY } = process.env
    if (!GITHUB_REPOSITORY) {
      return {
        owner: null,
        repo: null,
        pkgInfo: { name: null, version: null, tag: null },
      }
    }

    const [owner, repo] = GITHUB_REPOSITORY.split('/')
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    })
    let pkgInfo: PackageInfo | undefined
    if (options.tagStyle === 'lerna') {
      const packagesToPublish = headCommit
        .split('\n')
        .map((line) => line.trim())
        .filter((line, index) => line.length && index)
        .map((line) => line.substring(2))
        .map(parseTag)

      pkgInfo = packagesToPublish.find((pkgInfo) => pkgInfo.name === packageName)

      if (!pkgInfo) {
        throw new TypeError(`No release commit found with ${packageName}, original commit info: ${headCommit}`)
      }
    } else {
      pkgInfo = {
        tag: `v${version}`,
        version,
        name: packageName,
      }
    }
    return { owner, repo, pkgInfo, octokit }
  }

  if (!options.dryRun) {
    version(userOptions)
    updatePackageJson(packageJsonPath, {
      optionalDependencies: targets.reduce((deps, target) => {
        deps[`${packageName}-${target.platformArchABI}`] = packageJson.version

        return deps
      }, {} as Record<string, string>),
    })
  }

  const { owner, repo, pkgInfo, octokit } = options.ghReleaseId
    ? getRepoInfo(packageName, packageJson.version)
    : await createGhRelease(packageName, packageJson.version)

  for (const target of targets) {
    const pkgDir = resolve(options.cwd, options.npmDir, `${target.platformArchABI}`)
    const ext = 'node'
    const filename = `${binaryName}.${target.platformArchABI}.${ext}`
    const dstPath = join(pkgDir, filename)

    if (!options.dryRun) {
      if (!existsSync(dstPath)) {
        continue
      }

      execSync(`${npmClient} publish`, {
        cwd: pkgDir,
        env: process.env,
      })

      if (options.ghRelease && repo && owner) {
        try {
          const releaseId = options.ghReleaseId
            ? Number(options.ghReleaseId)
            : (
                await octokit!.repos.getReleaseByTag({
                  repo: repo,
                  owner: owner,
                  tag: pkgInfo.tag,
                })
              ).data.id
          const dstFileStats = statSync(dstPath)
          const assetInfo = await octokit!.repos.uploadReleaseAsset({
            owner: owner,
            repo: repo,
            name: filename,
            release_id: releaseId,
            mediaType: { format: 'raw' },
            headers: {
              'content-length': dstFileStats.size,
              'content-type': 'application/octet-stream',
            },
            data: readFileSync(dstPath, 'utf-8'),
          })
          console.log(`GitHub release created`)
          console.log(`Download URL: %s`, assetInfo.data.browser_download_url)
        } catch (e) {}
      }
    }
  }
}

function parseTag(tag: string) {
  const segments = tag.split('@')
  const version = segments.pop()!
  const name = segments.join('@')

  return {
    name,
    version,
    tag,
  }
}

export default class PrePublish extends Command {
  static description = 'Update package.json and copy addons into per platform packages'

  static examples = [
    `$ ftajs prepublish 
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ]

  static flags = {
    cwd: Flags.string({
      char: 'c',
      default: process.cwd(),
      description: 'The working directory of where napi command will be executed in',
    }),
    'package-json-path': Flags.string({
      description: 'Path to `package.json`',
      default: 'package.json',
    }),
    'config-path': Flags.string({
      description: 'Path to `napi` config json file',
    }),
    'npm-dir': Flags.string({
      char: 'p',
      description: 'Path to the folder where the npm packages put',
      default: 'npm',
    }),
    'tag-style': Flags.string({
      char: 't',
      description: 'git tag style, `npm` or `lerna`',
      default: 'lerna',
    }),
    'gh-release': Flags.boolean({
      description: 'Whether create GitHub release',
      default: true,
    }),
    'gh-release-name': Flags.string({
      description: 'GitHub release name',
    }),
    'gh-release-id': Flags.string({
      description: 'Existing GitHub release id',
    }),
    'dry-run': Flags.boolean({
      description: 'Dry run without touching file system',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(PrePublish)
    const options = {
      cwd: flags.cwd,
      configPath: flags['config-path'],
      packageJsonPath: flags['package-json-path'],
      npmDir: flags['npm-dir'],
      tagStyle: flags['tag-style'],
      ghRelease: flags['gh-release'],
      ghReleaseName: flags['gh-release-name'],
      ghReleaseId: flags['gh-release-id'],
      dryRun: flags['dry-run'],
    }
    await prePublish(options)
    this.log('\n PrePublish successfully processed!')
  }
}
