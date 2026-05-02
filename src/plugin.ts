import type { Plugin } from 'payload'
import type { MediaGalleryPluginOptions } from './types.js'
import { deleteEndpoint } from './endpoints/delete.js'

export function mediaGalleryPlugin(options: MediaGalleryPluginOptions): Plugin {
  const { collectionSlug } = options

  return (incomingConfig) => {
    const collections = (incomingConfig.collections || []).map((collection) => {
      if (collection.slug !== collectionSlug) return collection

      const existingViews = collection.admin?.components?.views ?? {}
      const existingList = existingViews.list ?? {}

      return {
        ...collection,
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
      endpoints: [
        ...(incomingConfig.endpoints || []),
        deleteEndpoint,
      ],
    }
  }
}
