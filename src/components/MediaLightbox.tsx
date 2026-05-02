'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, toast, useConfig, useListQuery, useModal } from '@payloadcms/ui'

import {
  formatBytes,
  formatDate,
  formatType,
  isImage,
  LIGHTBOX_SLUG,
  type MediaDoc,
} from './internal.js'

interface Props {
  docs: MediaDoc[]
  collectionSlug: string
  lightboxIndex: number
  setLightboxIndex: React.Dispatch<React.SetStateAction<number>>
}

function MediaLightboxComponent({
  docs,
  collectionSlug,
  lightboxIndex,
  setLightboxIndex,
}: Props) {
  const { data, handlePageChange } = useListQuery()
  const { config } = useConfig()
  const router = useRouter()
  const { closeModal, isModalOpen } = useModal()

  const adminRoute = config.routes?.admin ?? '/admin'
  const serverURL = config.serverURL || ''
  const apiRoute = config.routes?.api ?? '/api'

  const [pendingNav, setPendingNav] = useState<'first' | 'last' | null>(null)
  const [sizesOpen, setSizesOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const lightboxOpen = isModalOpen(LIGHTBOX_SLUG)
  const activeDoc = docs[lightboxIndex] ?? null

  // After page change completes, jump to the correct end
  useEffect(() => {
    if (!pendingNav || docs.length === 0) return
    if (pendingNav === 'first') setLightboxIndex(0)
    else if (pendingNav === 'last') setLightboxIndex(docs.length - 1)
    setPendingNav(null)
  }, [docs, pendingNav, setLightboxIndex])

  const handleDelete = useCallback(async (docId: number) => {
    setDeleting(true)
    try {
      const res = await fetch(`${serverURL}${apiRoute}/media-gallery/delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: collectionSlug, id: docId }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('File deleted')
        closeModal(LIGHTBOX_SLUG)
        setConfirmingDelete(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Delete failed')
      }
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }, [serverURL, apiRoute, collectionSlug, closeModal, router])

  const canGoNext = lightboxIndex < docs.length - 1 || !!(data?.hasNextPage)
  const canGoPrev = lightboxIndex > 0 || !!(data?.hasPrevPage)

  const goNext = useCallback(() => {
    if (lightboxIndex < docs.length - 1) {
      setLightboxIndex((i) => i + 1)
    } else if (data?.hasNextPage && data.nextPage && handlePageChange) {
      setPendingNav('first')
      handlePageChange(data.nextPage)
    }
  }, [lightboxIndex, docs.length, data?.hasNextPage, data?.nextPage, handlePageChange, setLightboxIndex])

  const goPrev = useCallback(() => {
    if (lightboxIndex > 0) {
      setLightboxIndex((i) => i - 1)
    } else if (data?.hasPrevPage && data.prevPage && handlePageChange) {
      setPendingNav('last')
      handlePageChange(data.prevPage)
    }
  }, [lightboxIndex, data?.hasPrevPage, data?.prevPage, handlePageChange, setLightboxIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') closeModal(LIGHTBOX_SLUG)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, goNext, goPrev, closeModal])

  if (!lightboxOpen || !activeDoc) {
    return (
      <Modal
        slug={LIGHTBOX_SLUG}
        className="media-lightbox"
        onClose={() => {
          setConfirmingDelete(false)
          setSizesOpen(false)
        }}
      />
    )
  }

  return (
    <Modal
      slug={LIGHTBOX_SLUG}
      className="media-lightbox"
      onClick={() => closeModal(LIGHTBOX_SLUG)}
      onClose={() => {
        setConfirmingDelete(false)
        setSizesOpen(false)
      }}
    >
      <div className="media-lightbox__layout" onClick={(e) => e.stopPropagation()}>
        <div className="media-lightbox__image-area">
          {canGoPrev && (
            <button type="button" className="media-lightbox__nav media-lightbox__nav--prev" onClick={goPrev} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div className="media-lightbox__image-wrap">
            {isImage(activeDoc.mimeType) ? (
              <img
                key={activeDoc.id}
                src={activeDoc.url || ''}
                alt={activeDoc.alt || activeDoc.filename || ''}
                className="media-lightbox__image"
                onLoad={(e) => e.currentTarget.classList.add('media-lightbox__image--loaded')}
              />
            ) : (
              <div className="media-lightbox__file-placeholder">
                <span>{formatType(activeDoc.mimeType) || 'FILE'}</span>
                <span className="media-lightbox__file-placeholder-name">{activeDoc.filename}</span>
              </div>
            )}
          </div>

          {canGoNext && (
            <button type="button" className="media-lightbox__nav media-lightbox__nav--next" onClick={goNext} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        <div className="media-lightbox__sidebar">
          <div className="media-lightbox__sidebar-header">
            <h4 className="media-lightbox__sidebar-title">Details</h4>
            <button
              type="button"
              className="media-lightbox__close"
              onClick={() => closeModal(LIGHTBOX_SLUG)}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <dl className="media-lightbox__meta-list">
            <dt>Filename</dt>
            <dd>
              {activeDoc.url ? (
                <a href={activeDoc.url} target="_blank" rel="noopener noreferrer" className="media-lightbox__file-link">
                  {activeDoc.filename || '—'}
                </a>
              ) : (
                activeDoc.filename || '—'
              )}
            </dd>

            <dt>Format</dt>
            <dd>{formatType(activeDoc.mimeType) || '—'}</dd>

            <dt>File size</dt>
            <dd>{formatBytes(activeDoc.filesize) || '—'}</dd>

            {activeDoc.width && activeDoc.height && (
              <>
                <dt>Dimensions</dt>
                <dd>{activeDoc.width} × {activeDoc.height}</dd>
              </>
            )}

            <dt>Alt text</dt>
            <dd>{activeDoc.alt || '—'}</dd>

            {activeDoc.createdAt && (
              <>
                <dt>Uploaded</dt>
                <dd>{formatDate(activeDoc.createdAt)}</dd>
              </>
            )}

            {activeDoc.updatedAt && (
              <>
                <dt>Modified</dt>
                <dd>{formatDate(activeDoc.updatedAt)}</dd>
              </>
            )}
          </dl>

          {isImage(activeDoc.mimeType) && activeDoc.sizes && (
            <div className="media-lightbox__sizes">
              <button
                type="button"
                className="media-lightbox__sizes-toggle"
                onClick={() => setSizesOpen((v) => !v)}
              >
                <span>Preview sizes</span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: sizesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {sizesOpen && (
                <div className="media-lightbox__sizes-list">
                  {activeDoc.url && (
                    <a href={activeDoc.url} target="_blank" rel="noopener noreferrer" className="media-lightbox__size-item">
                      <span className="media-lightbox__size-name">Original</span>
                      <span className="media-lightbox__size-dims">
                        {activeDoc.width && activeDoc.height ? `${activeDoc.width}×${activeDoc.height}` : ''}
                        {activeDoc.filesize ? ` · ${formatBytes(activeDoc.filesize)}` : ''}
                      </span>
                    </a>
                  )}
                  {Object.entries(activeDoc.sizes).map(([name, size]) => {
                    if (!size?.url) return null
                    return (
                      <a key={name} href={size.url} target="_blank" rel="noopener noreferrer" className="media-lightbox__size-item">
                        <span className="media-lightbox__size-name">{name}</span>
                        <span className="media-lightbox__size-dims">
                          {size.width ? `${size.width}` : ''}
                          {size.width && size.height ? `×${size.height}` : ''}
                          {size.filesize ? ` · ${formatBytes(size.filesize)}` : ''}
                        </span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {(data?.totalDocs ?? 0) > 1 && (
            <div className="media-lightbox__counter">
              {((data?.page ?? 1) - 1) * (data?.limit ?? docs.length) + lightboxIndex + 1} / {data?.totalDocs ?? docs.length}
            </div>
          )}

          <div className="media-lightbox__actions">
            <button
              type="button"
              className="media-lightbox__action-btn"
              onClick={() => {
                closeModal(LIGHTBOX_SLUG)
                router.push(`${adminRoute}/collections/${collectionSlug}/${activeDoc.id}`)
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit details
            </button>

            {!confirmingDelete ? (
              <button
                type="button"
                className="media-lightbox__action-btn media-lightbox__action-btn--danger"
                onClick={() => setConfirmingDelete(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            ) : (
              <div className="media-lightbox__confirm-delete">
                <span>Delete this file?</span>
                <div className="media-lightbox__confirm-btns">
                  <button
                    type="button"
                    className="media-lightbox__confirm-btn media-lightbox__confirm-btn--yes"
                    disabled={deleting}
                    onClick={() => handleDelete(activeDoc.id)}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    type="button"
                    className="media-lightbox__confirm-btn"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export const MediaLightbox = React.memo(MediaLightboxComponent)
