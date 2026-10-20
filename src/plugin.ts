import type { Plugin, SelectFnArgs, SelectIncludeType } from 'payload'
import { getSelectMode } from 'payload/shared'
import type { MediaGalleryPluginOptions } from './types.js'

export function mediaGalleryPlugin(options: MediaGalleryPluginOptions): Plugin {
  const { collectionSlug } = options

  return (incomingConfig) => {
    const collections = (incomingConfig.collections || []).map((collection) => {
      if (collection.slug !== collectionSlug) return collection

      const existingViews = collection.admin?.components?.views ?? {}
      const existingList = existingViews.list ?? {}

      return {
        ...collection,
        select: (args: SelectFnArgs) => {
          const configured = collection.select?.(args)
          const select = configured ?? args.select
          if (args.operation !== 'read' || !select || getSelectMode(select) === 'exclude') return configured
          // v4 reads only active table columns. The gallery also needs file metadata.
          const metadata = ['filename', 'mimeType', 'filesize', 'url', 'thumbnailURL', 'width', 'height', 'createdAt', 'updatedAt', 'variants']
          const next = { ...select } as SelectIncludeType
          for (const field of metadata) next[field] = true
          return next
        },
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

    return {
      ...incomingConfig,
      collections,
    }
  }
}
