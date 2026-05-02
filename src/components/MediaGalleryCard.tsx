'use client'

import React from 'react'
import { formatBytes, formatType, isImage, type MediaDoc } from './internal.js'

interface Props {
  doc: MediaDoc
  index: number
  isSelected: boolean
  isInDrawer: boolean
  onClick: (index: number, doc: MediaDoc) => void
  onSelectionToggle: (id: number) => void
}

function MediaGalleryCardComponent({
  doc,
  index,
  isSelected,
  isInDrawer,
  onClick,
  onSelectionToggle,
}: Props) {
  const thumbUrl = doc.sizes?.thumbnail?.url || doc.thumbnailURL || doc.url
  const mime = doc.mimeType

  return (
    <button
      type="button"
      className={`media-gallery__card ${isSelected ? 'media-gallery__card--selected' : ''}`}
      onClick={() => onClick(index, doc)}
    >
      {!isInDrawer && (
        <div
          className={`media-gallery__checkbox ${isSelected ? 'media-gallery__checkbox--checked' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelectionToggle(doc.id)
          }}
          role="checkbox"
          aria-checked={isSelected}
        >
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}

      <div className="media-gallery__preview">
        {isImage(mime) && thumbUrl ? (
          <img
            src={thumbUrl}
            alt={doc.alt || doc.filename || ''}
            loading="lazy"
          />
        ) : (
          <div className="media-gallery__file-icon">
            <span>{mime?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
          </div>
        )}
      </div>
      <div className="media-gallery__info">
        <span className="media-gallery__filename">
          {doc.filename || `Media ${doc.id}`}
        </span>
        <span className="media-gallery__meta">
          {[formatType(doc.mimeType), formatBytes(doc.filesize)].filter(Boolean).join(' · ')}
        </span>
      </div>
    </button>
  )
}

export const MediaGalleryCard = React.memo(MediaGalleryCardComponent)
