import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

function check(refType: string, refName: string) {
  return spawnSync(process.execPath, ['scripts/check-release.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, GITHUB_REF_TYPE: refType, GITHUB_REF_NAME: refName },
    encoding: 'utf8',
  })
}

test('publish guard permits only the matching prerelease tag', () => {
  assert.equal(check('tag', 'v0.2.0-next.0').status, 0)
  assert.notEqual(check('branch', 'release/payload-v4-next').status, 0)
  assert.notEqual(check('tag', 'v0.2.0-next.1').status, 0)
  assert.notEqual(check('tag', 'v0.2.0').status, 0)
})
