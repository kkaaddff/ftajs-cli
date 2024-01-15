import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const { platform, arch } = process

function isMusl() {
  // For Node 10
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      const lddPath = execSync('which ldd').toString().trim()
      return readFileSync(lddPath, 'utf8').includes('musl')
    } catch (e) {
      return true
    }
  } else {
    // @ts-ignore
    const { glibcVersionRuntime } = process.report.getReport().header
    return !glibcVersionRuntime
  }
}

export function parseTargetTriple() {
  let targetTriple = ''
  switch (platform) {
    case 'android':
      switch (arch) {
        case 'arm64':
          targetTriple = 'android-arm64'
          break
        case 'arm':
          targetTriple = 'android-arm-eabi'
          break
        default:
          throw new Error(`Unsupported architecture on Android ${arch}`)
      }
      break
    case 'win32':
      switch (arch) {
        case 'x64':
          targetTriple = 'win32-x64-msvc'
          break
        case 'ia32':
          targetTriple = 'win32-ia32-msvc'
          break
        case 'arm64':
          targetTriple = 'win32-arm64-msvc'
          break
        default:
          throw new Error(`Unsupported architecture on Windows: ${arch}`)
      }
      break
    case 'darwin':
      targetTriple = 'darwin-universal'
      switch (arch) {
        case 'x64':
          targetTriple = 'darwin-x64'
          break
        case 'arm64':
          targetTriple = 'darwin-arm64'
          break
        default:
          throw new Error(`Unsupported architecture on macOS: ${arch}`)
      }
      break
    case 'freebsd':
      if (arch !== 'x64') {
        throw new Error(`Unsupported architecture on FreeBSD: ${arch}`)
      }
      targetTriple = 'freebsd-x64'
      break
    case 'linux':
      switch (arch) {
        case 'x64':
          if (isMusl()) {
            targetTriple = 'linux-x64-musl'
          } else {
            targetTriple = 'linux-x64-gnu'
          }
          break
        case 'arm64':
          if (isMusl()) {
            targetTriple = 'linux-arm64-musl'
          } else {
            targetTriple = 'linux-arm64-gnu'
          }
          break
        case 'arm':
          targetTriple = 'linux-arm-gnueabihf'
          break
        default:
          throw new Error(`Unsupported architecture on Linux: ${arch}`)
      }
      break
    default:
      throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`)
  }
  return targetTriple
}

// https://nodejs.org/api/process.html#process_process_arch
type NodeJSArch =
  | 'arm'
  | 'arm64'
  | 'ia32'
  | 'mips'
  | 'mipsel'
  | 'ppc'
  | 'ppc64'
  | 'riscv64'
  | 's390'
  | 's390x'
  | 'x32'
  | 'x64'
  | 'universal'
  | 'wasm32'

export type Platform = NodeJS.Platform

const SysToNodePlatform: Record<string, Platform> = {
  linux: 'linux',
  freebsd: 'freebsd',
  darwin: 'darwin',
  windows: 'win32',
}

const CpuToNodeArch: Record<string, NodeJSArch> = {
  x86_64: 'x64',
  aarch64: 'arm64',
  i686: 'ia32',
  armv7: 'arm',
  riscv64gc: 'riscv64',
}

export interface Target {
  triple: string
  platformArchABI: string
  platform: Platform
  arch: NodeJSArch
  abi: string | null
}

export function parseTriple(rawTriple: string): Target {
  const triple = rawTriple.endsWith('eabi') ? `${rawTriple.slice(0, -4)}-eabi` : rawTriple
  const triples = triple.split('-')
  let cpu: string
  let sys: string
  let abi: string | null = null
  if (triples.length === 2) {
    // aarch64-fuchsia
    // ^ cpu   ^ sys
    ;[cpu, sys] = triples
  } else {
    // aarch64-unknown-linux-musl
    // ^ cpu           ^ sys ^ abi
    // aarch64-apple-darwin
    // ^ cpu         ^ sys  (abi is None)
    ;[cpu, , sys, abi = null] = triples
  }

  const platform = SysToNodePlatform[sys] ?? (sys as Platform)
  const arch = CpuToNodeArch[cpu] ?? (cpu as NodeJSArch)
  return {
    triple: rawTriple,
    platformArchABI: abi ? `${platform}-${arch}-${abi}` : `${platform}-${arch}`,
    platform,
    arch,
    abi,
  }
}
