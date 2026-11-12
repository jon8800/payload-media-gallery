import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcDir = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? sourceFiles(path) : [path]
  })
}

const files = sourceFiles(srcDir)
const read = (file: string) => readFileSync(file, 'utf8')

describe('Payload 4 compatibility', () => {
  it('ships no SCSS (Payload 4 has no SCSS toolchain)', () => {
    expect(files.filter((file) => file.endsWith('.scss'))).toEqual([])
  })

  it('uses no retired --theme-* or --style-radius-* variables', () => {
    for (const file of files.filter((f) => f.endsWith('.css'))) {
      expect(read(file)).not.toMatch(/--theme-|--style-radius-/)
    }
  })

  it('imports no next/* modules (admin routing comes from @payloadcms/ui)', () => {
    for (const file of files.filter((f) => /\.tsx?$/.test(f))) {
      expect(read(file), file).not.toMatch(/from ['"]next\//)
    }
  })

  it('reads generated image sizes from `variants`, not `sizes`', () => {
    for (const file of files.filter((f) => /\.tsx?$/.test(f))) {
      expect(read(file), file).not.toMatch(/\.sizes\b/)
    }
  })
})
