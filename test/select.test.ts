import type { CollectionConfig, Config, PayloadRequest, SelectFnArgs } from 'payload'
import { describe, expect, it } from 'vitest'

import { GALLERY_SELECT_FIELDS, mediaGalleryPlugin } from '../src/plugin.js'

const req = {} as PayloadRequest

async function mediaCollection(collection: Partial<CollectionConfig> = {}) {
  const config = await mediaGalleryPlugin({ collectionSlug: 'media' })({
    collections: [{ slug: 'media', fields: [{ name: 'alt', type: 'text' }], upload: true, ...collection }],
  } as unknown as Config)
  return config.collections![0]!
}

function select(collection: CollectionConfig, args: Omit<SelectFnArgs, 'req'>) {
  return collection.select!({ ...args, req })
}

describe('gallery select', () => {
  it('adds file metadata to an include-mode read select (the list view columns)', async () => {
    const media = await mediaCollection()
    const result = select(media, { operation: 'read', select: { filename: true } })
    for (const field of GALLERY_SELECT_FIELDS) expect(result?.[field]).toBe(true)
    expect(result?.alt).toBe(true)
    expect(result?.filename).toBe(true)
  })

  it('replaces a nested variants select so the lightbox gets every variant property', async () => {
    const media = await mediaCollection()
    const result = select(media, { operation: 'read', select: { variants: { thumbnail: { url: true } } } })
    expect(result?.variants).toBe(true)
  })

  it('does not add `alt` when the collection has no alt field', async () => {
    const media = await mediaCollection({ fields: [] })
    const result = select(media, { operation: 'read', select: { filename: true } })
    expect(result?.alt).toBeUndefined()
  })

  it('leaves exclude-mode selects, missing selects and writes unchanged', async () => {
    const media = await mediaCollection()
    expect(select(media, { operation: 'read', select: { filename: false } })).toBeUndefined()
    expect(select(media, { operation: 'read' })).toBeUndefined()
    expect(select(media, { operation: 'update', select: { filename: true } })).toBeUndefined()
  })

  it("builds on the collection's own select function", async () => {
    const media = await mediaCollection({
      select: ({ select: current }) => (current ? { ...current, title: true } : undefined),
    } as Partial<CollectionConfig>)
    const result = select(media, { operation: 'read', select: { filename: true } })
    expect(result?.title).toBe(true)
    expect(result?.url).toBe(true)
  })

  it('keeps access control and other collection settings', async () => {
    const read = () => true
    const media = await mediaCollection({ access: { read } })
    expect(media.access?.read).toBe(read)
  })
})
