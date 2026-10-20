import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const { version, publishConfig } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
assert.match(version, /^\d+\.\d+\.\d+-next\.\d+$/, 'Only next prerelease versions can use this workflow.')
assert.equal(process.env.GITHUB_REF_TYPE, 'tag', 'Publish only from a tag.')
assert.equal(process.env.GITHUB_REF_NAME, `v${version}`, 'Git tag must match package.json.')
assert.equal(publishConfig.tag, 'next', 'Prereleases must use the next npm dist-tag.')
console.log(`Validated ${version} for npm dist-tag next.`)
