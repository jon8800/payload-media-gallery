import type { CollectionSlug, Endpoint, PayloadRequest } from 'payload'

export const DELETE_ENDPOINT_PATH = '/media-gallery/delete'

/**
 * Key the plugin sets in `collection.custom` on every collection that uses the
 * gallery. The delete endpoint only acts on collections that carry it.
 */
export const GALLERY_MARKER = 'mediaGallery'

function json(status: number, body: { success: boolean; error?: string }) {
  return Response.json(body, { status })
}

function isGalleryCollection(req: PayloadRequest, slug: string): boolean {
  const collection = req.payload.collections?.[slug as CollectionSlug]
  return collection?.config?.custom?.[GALLERY_MARKER] === true
}

function errorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object' || !('status' in err)) return undefined
  const { status } = err as { status: unknown }
  return typeof status === 'number' ? status : undefined
}

/**
 * Deletes one document from a gallery collection.
 *
 * - No signed-in user: 401.
 * - The delete runs through Payload's access control (`overrideAccess: false`),
 *   so the collection's `access.delete` decides. Denied access: 403.
 */
export async function deleteHandler(req: PayloadRequest): Promise<Response> {
  if (!req.user) {
    return json(401, { success: false, error: 'You must be signed in to delete files.' })
  }

  let body: unknown
  try {
    body = await req.json?.()
  } catch {
    return json(400, { success: false, error: 'Invalid JSON body' })
  }

  const { collection, id } = (body ?? {}) as { collection?: unknown; id?: unknown }
  const validId = (typeof id === 'string' && id !== '') || typeof id === 'number'
  if (typeof collection !== 'string' || !collection || !validId) {
    return json(400, { success: false, error: 'Missing collection or id' })
  }

  if (!isGalleryCollection(req, collection)) {
    return json(400, { success: false, error: 'This collection does not use the media gallery.' })
  }

  try {
    await req.payload.delete({
      collection: collection as CollectionSlug,
      id: id as number | string,
      overrideAccess: false,
      req,
      user: req.user,
    })
    return json(200, { success: true })
  } catch (err: unknown) {
    const status = errorStatus(err)
    if (status === 401 || status === 403) {
      return json(403, { success: false, error: 'You are not allowed to delete this file.' })
    }
    if (status === 404) {
      return json(404, { success: false, error: 'File not found' })
    }
    if (status && status >= 400 && status < 500) {
      return json(status, { success: false, error: err instanceof Error ? err.message : 'Delete failed' })
    }
    req.payload.logger?.error?.({ err, msg: '[payload-media-gallery] Delete failed' })
    return json(500, { success: false, error: 'Delete failed' })
  }
}

export const deleteEndpoint: Endpoint = {
  path: DELETE_ENDPOINT_PATH,
  method: 'delete',
  handler: deleteHandler,
}
