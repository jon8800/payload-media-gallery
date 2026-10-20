import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

function check(refType: string, refName: string) {
  return spawnSync(process.execPath, ['scripts/check-release.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, GITHUB_REF_TYPE: refType, GITHUB_REF_NAME: refName },
    encoding: 'utf8',
  })
}

test('publish guard permits only the matching prerelease tag', () => {
  assert.equal(check('tag', `v${version}`).status, 0)
  assert.notEqual(check('branch', 'release/payload-v4-next').status, 0)
  assert.notEqual(check('tag', 'v0.2.0-next.999').status, 0)
  assert.notEqual(check('tag', 'v0.2.0').status, 0)
})
