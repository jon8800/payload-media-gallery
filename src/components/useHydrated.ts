'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * Returns `false` on the server and during hydration, then `true`.
 *
 * React uses the server snapshot (`false`) while it hydrates, so the first
 * client render matches the server HTML. React then re-renders with `true`.
 * When a component mounts later on the client (no hydration), it gets `true`
 * on the first render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
