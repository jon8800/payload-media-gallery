import type { CollectionConfig, Plugin, SelectFnArgs, SelectIncludeType } from 'payload'
import { getSelectMode } from 'payload/shared'

import type { MediaGalleryPluginOptions } from './types.js'
import { deleteEndpoint, GALLERY_MARKER } from './endpoints/delete.js'

/**
 * File metadata the gallery cards and the lightbox read. Payload 4's list view
 * selects only the active table columns, so the gallery adds these fields to
 * every read that uses an include-mode `select`.
 */
export const GALLERY_SELECT_FIELDS = [
  'createdAt',
  'filename',
  'filesize',
  'height',
  'mimeType',
  'thumbnailURL',
  'updatedAt',
  'url',
  'variants',
  'width',
] as const

function hasTopLevelField(collection: CollectionConfig, name: string): boolean {
  return collection.fields.some((field) => 'name' in field && field.name === name)
}

/**
 * Wraps the collection's own `select` function (if any) and adds the gallery
 * fields. Exclude-mode selects and reads without a `select` already return
 * every field, so they pass through unchanged.
 */
export function gallerySelect(collection: CollectionConfig) {
  const fields: string[] = [...GALLERY_SELECT_FIELDS]
  if (hasTopLevelField(collection, 'alt')) fields.push('alt')
  const configured = collection.select

  return (args: SelectFnArgs): SelectIncludeType | undefined => {
    const fromCollection = configured?.(args) as SelectIncludeType | undefined
    const select = fromCollection ?? args.select
    if (args.operation !== 'read' || !select || getSelectMode(select) === 'exclude') {
      return fromCollection
    }

    const next = { ...select } as SelectIncludeType
    for (const field of fields) next[field] = true
    return next
  }
}

export function mediaGalleryPlugin(options: MediaGalleryPluginOptions): Plugin {
  const { collectionSlug } = options

  return (incomingConfig) => {
    const collections = (incomingConfig.collections || []).map((collection) => {
      if (collection.slug !== collectionSlug) return collection

      const existingViews = collection.admin?.components?.views ?? {}
      const existingList = existingViews.list ?? {}

      return {
        ...collection,
        custom: {
          ...collection.custom,
          [GALLERY_MARKER]: true,
        },
        select: gallerySelect(collection),
        admin: {
          ...collection.admin,
          components: {
            ...collection.admin?.components,
            views: {
              ...existingViews,
              list: {
                ...existingList,
                Component: 'payload-media-gallery/rsc#MediaGalleryListViewServer',
              },
            },
          },
        },
      }
    })

    // The plugin can run once per gallery collection. Register the endpoint once.
    const endpoints = incomingConfig.endpoints || []
    const hasDeleteEndpoint = endpoints.some(
      (endpoint) => endpoint.path === deleteEndpoint.path && endpoint.method === deleteEndpoint.method,
    )

    return {
      ...incomingConfig,
      collections,
      endpoints: hasDeleteEndpoint ? endpoints : [...endpoints, deleteEndpoint],
    }
  }
}
