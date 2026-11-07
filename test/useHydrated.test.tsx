import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useHydrated } from '../src/components/useHydrated.js'

function Probe() {
  return <span>{useHydrated() ? 'client' : 'server'}</span>
}

describe('useHydrated', () => {
  it('is false during server rendering, so the lightbox renders no <dialog> there', () => {
    expect(renderToString(<Probe />)).toBe('<span>server</span>')
  })
})
