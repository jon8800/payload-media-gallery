'use client'

import { DefaultListView, usePreferences } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ListViewClientProps } from 'payload'
import { useCallback, useEffect } from 'react'

import MediaGalleryView from './MediaGalleryView.js'
import ViewModeToggle from './ViewModeToggle.js'

type Mode = 'grid' | 'list'

const VIEW_PARAM = 'view'
const PREF_KEY_PREFIX = 'media-gallery-view-mode'
const COOKIE_PREFIX = 'mg-view-mode'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

interface Props extends ListViewClientProps {
  /** Resolved server-side from cookie or preference. Used when URL has no `?view=`. */
  initialMode?: Mode
}

export default function MediaGalleryListView({ initialMode = 'grid', ...props }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { setPreference } = usePreferences()
  const collectionSlug = props.collectionSlug

  const hasViewParam = searchParams?.has(VIEW_PARAM) === true
  const mode: Mode = hasViewParam
    ? (searchParams.get(VIEW_PARAM) === 'list' ? 'list' : 'grid')
    : initialMode
  const isGrid = mode === 'grid'

  const setMode = useCallback((next: Mode) => {
    // Cookie is sync — written before router.replace, eliminates the race
    // where the next SSR pass reads a stale preference because the API write
    // hadn't landed yet.
    document.cookie = `${COOKIE_PREFIX}-${collectionSlug}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`

    // Preference is async — for cross-device sync. Server falls back to it
    // when no cookie exists on the current device.
    void setPreference(`${PREF_KEY_PREFIX}:${collectionSlug}`, next)

    const params = new URLSearchParams(searchParams?.toString() || '')
    if (next === 'grid') {
      params.delete(VIEW_PARAM)
    } else {
      params.set(VIEW_PARAM, next)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, router, pathname, setPreference, collectionSlug])

  useEffect(() => {
    document.body.classList.toggle('media-gallery-grid-mode', isGrid)
    return () => document.body.classList.remove('media-gallery-grid-mode')
  }, [isGrid])

  return (
    <DefaultListView
      {...props}
      beforeActions={[
        <ViewModeToggle
          key="media-gallery-view-mode-toggle"
          mode={mode}
          onChange={setMode}
        />,
        ...(props.beforeActions ?? []),
      ]}
      Table={isGrid ? <MediaGalleryView {...props} /> : props.Table}
    />
  )
}
