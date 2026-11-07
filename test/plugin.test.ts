import type { Config } from 'payload'
import { describe, expect, it } from 'vitest'

import { DELETE_ENDPOINT_PATH, GALLERY_MARKER } from '../src/endpoints/delete.js'
import { mediaGalleryPlugin } from '../src/plugin.js'

function baseConfig(): Config {
  return {
    collections: [
      { slug: 'media', fields: [], upload: true, custom: { keep: 1 } },
      { slug: 'documents', fields: [], upload: true },
      { slug: 'posts', fields: [] },
    ],
    endpoints: [{ path: '/keep', method: 'get', handler: () => Response.json({}) }],
  } as unknown as Config
}

describe('mediaGalleryPlugin', () => {
  it('marks only the configured collection and keeps its custom data', async () => {
    const config = await mediaGalleryPlugin({ collectionSlug: 'media' })(baseConfig())
    const [media, documents, posts] = config.collections!
    expect(media?.custom).toEqual({ keep: 1, [GALLERY_MARKER]: true })
    expect(documents?.custom?.[GALLERY_MARKER]).toBeUndefined()
    expect(posts?.custom?.[GALLERY_MARKER]).toBeUndefined()
  })

  it('keeps existing endpoints and adds the delete endpoint', async () => {
    const config = await mediaGalleryPlugin({ collectionSlug: 'media' })(baseConfig())
    expect(config.endpoints?.map((e) => e.path)).toEqual(['/keep', DELETE_ENDPOINT_PATH])
  })

  it('registers the delete endpoint once when used for two collections', async () => {
    const once = await mediaGalleryPlugin({ collectionSlug: 'media' })(baseConfig())
    const twice = await mediaGalleryPlugin({ collectionSlug: 'documents' })(once)
    const deletes = twice.endpoints!.filter((e) => e.path === DELETE_ENDPOINT_PATH)
    expect(deletes).toHaveLength(1)
    expect(twice.collections![0]?.custom?.[GALLERY_MARKER]).toBe(true)
    expect(twice.collections![1]?.custom?.[GALLERY_MARKER]).toBe(true)
  })
})
