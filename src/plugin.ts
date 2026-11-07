import type { Plugin } from 'payload'
import type { MediaGalleryPluginOptions } from './types.js'
import { deleteEndpoint, GALLERY_MARKER } from './endpoints/delete.js'

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
