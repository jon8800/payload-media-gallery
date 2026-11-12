'use client'

import { LayoutToggle } from '@payloadcms/ui'

type Mode = 'grid' | 'list'

interface Props {
  mode: Mode
  onChange: (next: Mode) => void
}

/**
 * Payload 4's own table / grid layout toggle, driven by the gallery's mode.
 * The gallery hides Payload's built-in copy of this toggle, because that one
 * switches to Payload's document grid instead of the gallery.
 */
export default function ViewModeToggle({ mode, onChange }: Props) {
  return (
    <div className="media-gallery-view-toggle">
      <LayoutToggle
        layout={mode === 'list' ? 'table' : 'grid'}
        onChange={(layout) => onChange(layout === 'table' ? 'list' : 'grid')}
      />
    </div>
  )
}
