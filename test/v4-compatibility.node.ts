import assert from 'node:assert/strict'
import test from 'node:test'
import type { Config, PayloadRequest } from 'payload'
import { mediaGalleryPlugin } from '../src/plugin.js'

test('gallery preserves endpoints and access while adding metadata to selected list columns', async () => {
  const read = () => true
  const endpoint = { path: '/keep', method: 'get' as const, handler: () => Response.json({}) }
  const config = await mediaGalleryPlugin({ collectionSlug: 'media' })({
    collections: [{ slug: 'media', fields: [], upload: true, access: { read } }],
    endpoints: [endpoint],
  } as Config)
  assert.deepEqual(config.endpoints, [endpoint])
  const media = config.collections![0]
  assert.equal(media.access?.read, read)
  const req = {} as PayloadRequest
  const select = media.select!({ operation: 'read', req, select: { filename: true } })
  assert.equal(select?.url, true)
  assert.equal(select?.mimeType, true)
  assert.equal(select?.variants, true)
  const exclude = media.select!({ operation: 'read', req, select: { filename: false, privateNote: false } })
  assert.equal(exclude, undefined)
  assert.equal(media.select!({ operation: 'read', req, select: { private: { note: false } } }), undefined)
  assert.equal(media.select!({ operation: 'read', req }), undefined)
  assert.equal(media.select!({ operation: 'update', req, select: { filename: true } }), undefined)
})
