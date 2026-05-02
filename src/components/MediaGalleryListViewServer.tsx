import { cookies } from 'next/headers'

import MediaGalleryListView from './MediaGalleryListView.js'

// Payload's RenderServerComponent merges serverProps into our props when it
// detects an RSC. Those contain non-serializable functions (field hooks,
// validators) that crash the RSC -> client boundary. Strip them before
// passing through.
//
// Source of truth: @payloadcms/next/dist/views/List/index.js (renderListView,
// the `serverProps` const). If Payload adds a new server-only prop in a
// future release, the dev warning below will flag it on first hit.
const SERVER_PROP_KEYS = new Set([
  'collectionConfig',
  'data',
  'i18n',
  'limit',
  'listSearchableFields',
  'locale',
  'params',
  'payload',
  'permissions',
  'searchParams',
  'user',
])

// Known clientProps Payload passes (renderListView clientProps + listViewSlots
// keys). Unknown keys outside both sets get a dev-mode warning so we catch
// Payload changes early rather than silently leaking.
const KNOWN_CLIENT_PROP_KEYS = new Set([
  'AfterList',
  'AfterListTable',
  'BeforeList',
  'BeforeListTable',
  'beforeActions',
  'Description',
  'collectionSlug',
  'columnState',
  'disableBulkDelete',
  'disableBulkEdit',
  'disableQueryPresets',
  'enableRowSelections',
  'hasCreatePermission',
  'hasDeletePermission',
  'hasTrashPermission',
  'listMenuItems',
  'listPreferences',
  'newDocumentURL',
  'queryPreset',
  'queryPresetPermissions',
  'renderedFilters',
  'resolvedFilterOptions',
  'Table',
  'viewType',
])

const PREF_KEY_PREFIX = 'media-gallery-view-mode'
const COOKIE_PREFIX = 'mg-view-mode'

function prefKey(collectionSlug: string): string {
  return `${PREF_KEY_PREFIX}:${collectionSlug}`
}

function cookieName(collectionSlug: string): string {
  return `${COOKIE_PREFIX}-${collectionSlug}`
}

export default async function MediaGalleryListViewServer(props: Record<string, unknown>) {
  const { payload, user, collectionSlug } = props as {
    payload?: { find: (args: unknown) => Promise<{ docs: Array<{ value?: unknown }> }> }
    user?: { id: string | number; collection: string }
    collectionSlug: string
  }

  let initialMode: 'grid' | 'list' = 'grid'

  // 1. Cookie wins for sync persistence — written client-side on toggle, so it
  //    races-free against the next SSR pass on the same browser.
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(cookieName(collectionSlug))?.value
  if (cookieValue === 'list') {
    initialMode = 'list'
  } else if (cookieValue !== 'grid' && payload && user) {
    // 2. No cookie yet on this device — fall back to the user's stored
    //    preference for cross-device sync.
    try {
      const result = await payload.find({
        collection: 'payload-preferences',
        where: {
          and: [
            { key: { equals: prefKey(collectionSlug) } },
            { 'user.relationTo': { equals: user.collection } },
            { 'user.value': { equals: user.id } },
          ],
        },
        limit: 1,
        depth: 0,
      })
      if (result.docs?.[0]?.value === 'list') initialMode = 'list'
    } catch {
      // Best-effort; never block the view from rendering.
    }
  }

  const clientProps: Record<string, unknown> = {}
  for (const key of Object.keys(props)) {
    if (SERVER_PROP_KEYS.has(key)) continue
    if (process.env.NODE_ENV !== 'production' && !KNOWN_CLIENT_PROP_KEYS.has(key)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[payload-media-gallery] Unknown prop "${key}" forwarded from Payload's list view. ` +
        `If serialization fails, add it to either SERVER_PROP_KEYS or KNOWN_CLIENT_PROP_KEYS in ` +
        `MediaGalleryListViewServer.tsx.`,
      )
    }
    clientProps[key] = props[key]
  }

  // @ts-expect-error — clientProps shape matches ListViewClientProps after filtering
  return <MediaGalleryListView {...clientProps} initialMode={initialMode} />
}
