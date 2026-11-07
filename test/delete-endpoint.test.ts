import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { deleteHandler, GALLERY_MARKER } from '../src/endpoints/delete.js'

class FakeAPIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

interface FakeReqOptions {
  user?: Record<string, unknown> | null
  body?: unknown
  bodyThrows?: boolean
  deleteImpl?: () => Promise<unknown>
}

function fakeReq({ user = { id: 'u1', collection: 'users' }, body, bodyThrows, deleteImpl }: FakeReqOptions = {}) {
  const del = vi.fn(deleteImpl ?? (async () => ({ id: 'doc1' })))
  const req = {
    user,
    json: bodyThrows ? async () => { throw new SyntaxError('bad json') } : async () => body,
    payload: {
      delete: del,
      logger: { error: vi.fn() },
      collections: {
        media: { config: { custom: { [GALLERY_MARKER]: true } } },
        users: { config: { custom: {} } },
      },
    },
  } as unknown as PayloadRequest
  return { req, del }
}

async function call(options: FakeReqOptions) {
  const { req, del } = fakeReq(options)
  const res = await deleteHandler(req)
  return { status: res.status, body: await res.json(), del, req }
}

describe('media gallery delete endpoint', () => {
  it('rejects a request with no signed-in user with 401 and deletes nothing', async () => {
    const { status, body, del } = await call({ user: null, body: { collection: 'media', id: 'doc1' } })
    expect(status).toBe(401)
    expect(body.success).toBe(false)
    expect(del).not.toHaveBeenCalled()
  })

  it('runs the delete through access control with the request user', async () => {
    const { status, body, del, req } = await call({ body: { collection: 'media', id: 'doc1' } })
    expect(status).toBe(200)
    expect(body).toEqual({ success: true })
    expect(del).toHaveBeenCalledTimes(1)
    expect(del).toHaveBeenCalledWith({
      collection: 'media',
      id: 'doc1',
      overrideAccess: false,
      req,
      user: req.user,
    })
  })

  it('accepts numeric ids', async () => {
    const { status, del } = await call({ body: { collection: 'media', id: 42 } })
    expect(status).toBe(200)
    expect(del.mock.calls[0]?.[0]).toMatchObject({ id: 42 })
  })

  it('returns 403 when collection access denies the delete', async () => {
    const { status, body } = await call({
      body: { collection: 'media', id: 'doc1' },
      deleteImpl: async () => { throw new FakeAPIError('You are not allowed to perform this action.', 403) },
    })
    expect(status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('returns 404 when the document does not exist', async () => {
    const { status } = await call({
      body: { collection: 'media', id: 'missing' },
      deleteImpl: async () => { throw new FakeAPIError('Not Found', 404) },
    })
    expect(status).toBe(404)
  })

  it('returns 500 without the internal message for unexpected errors', async () => {
    const { status, body, req } = await call({
      body: { collection: 'media', id: 'doc1' },
      deleteImpl: async () => { throw new Error('connection string leaked') },
    })
    expect(status).toBe(500)
    expect(body.error).toBe('Delete failed')
    expect(req.payload.logger.error).toHaveBeenCalled()
  })

  it('refuses collections that do not use the gallery', async () => {
    const { status, del } = await call({ body: { collection: 'users', id: 'u2' } })
    expect(status).toBe(400)
    expect(del).not.toHaveBeenCalled()
  })

  it('refuses unknown collections', async () => {
    const { status, del } = await call({ body: { collection: 'nope', id: 'x' } })
    expect(status).toBe(400)
    expect(del).not.toHaveBeenCalled()
  })

  it.each([
    [{}],
    [{ collection: 'media' }],
    [{ id: 'doc1' }],
    [{ collection: 'media', id: '' }],
    [{ collection: 'media', id: { $ne: null } }],
    [{ collection: ['media'], id: 'doc1' }],
    [null],
  ])('returns 400 for a bad body %j', async (body) => {
    const { status, del } = await call({ body })
    expect(status).toBe(400)
    expect(del).not.toHaveBeenCalled()
  })

  it('returns 400 for a body that is not JSON', async () => {
    const { status, del } = await call({ bodyThrows: true })
    expect(status).toBe(400)
    expect(del).not.toHaveBeenCalled()
  })

  it('checks the user before it reads the body', async () => {
    const { status } = await call({ user: null, bodyThrows: true })
    expect(status).toBe(401)
  })
})
