'use client'

type Mode = 'grid' | 'list'

interface Props {
  mode: Mode
  onChange: (next: Mode) => void
}

function pillClasses(active: boolean): string {
  return [
    'pill',
    active ? 'pill--style-dark' : 'pill--style-light',
    'pill--size-small',
    'pill--has-action',
    'media-gallery-view-toggle__btn',
  ].join(' ')
}

export default function ViewModeToggle({ mode, onChange }: Props) {
  const isList = mode === 'list'

  return (
    <div
      className="media-gallery-view-toggle"
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        className={pillClasses(!isList)}
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        aria-pressed={!isList}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        type="button"
        className={pillClasses(isList)}
        onClick={() => onChange('list')}
        aria-label="List view"
        aria-pressed={isList}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  )
}
