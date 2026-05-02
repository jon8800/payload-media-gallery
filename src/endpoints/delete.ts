import type { Endpoint } from 'payload'

export const deleteEndpoint: Endpoint = {
  path: '/media-gallery/delete',
  method: 'delete',
  handler: async (req) => {
    try {
      const body = await req.json?.()
      const { collection, id } = body || {}

      if (!collection || !id) {
        return Response.json(
          { success: false, error: 'Missing collection or id' },
          { status: 400 },
        )
      }

      await req.payload.delete({
        collection,
        id,
        req,
      })

      return Response.json({ success: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      return Response.json(
        { success: false, error: message },
        { status: 500 },
      )
    }
  },
}
