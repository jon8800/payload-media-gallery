'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BulkUploadDrawer,
  BulkUploadProvider,
  toast,
  useBulkUpload,
  useBulkUploadDrawerSlug,
  useListDrawerContext,
  useListQuery,
  useModal,
  useSelection,
} from '@payloadcms/ui'
import type { ListViewClientProps } from 'payload'

import './mediaGallery.scss'
import { MediaGalleryCard } from './MediaGalleryCard.js'
import { MediaLightbox } from './MediaLightbox.js'
import { LIGHTBOX_SLUG, type MediaDoc } from './internal.js'

function MediaGalleryInner({ collectionSlug }: ListViewClientProps) {
  const { data } = useListQuery()
  const router = useRouter()
  const { openModal } = useModal()
  const { selected, setSelection } = useSelection()
  const { isInDrawer, onSelect } = useListDrawerContext()
  const { setCollectionSlug, setInitialFiles, setOnSuccess } = useBulkUpload()
  const bulkUploadDrawerSlug = useBulkUploadDrawerSlug()

  const docs = (data?.docs ?? []) as MediaDoc[]

  const [dragging, setDragging] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const dragCounter = useRef(0)

  // Set up bulk upload for the target collection
  useEffect(() => {
    setCollectionSlug(collectionSlug)
  }, [setCollectionSlug, collectionSlug])

  // Refresh list after successful bulk upload
  useEffect(() => {
    setOnSuccess(() => {
      toast.success('Files uploaded')
      router.refresh()
    })
  }, [setOnSuccess, router])

  const openBulkUpload = useCallback((files?: FileList | null) => {
    if (files && files.length > 0) {
      setInitialFiles(files)
    }
    openModal(bulkUploadDrawerSlug)
  }, [openModal, bulkUploadDrawerSlug, setInitialFiles])

  // Stable handler refs so memoized cards don't re-render when upstream hooks
  // (useSelection, useModal, useListDrawerContext) return fresh function refs
  // on unrelated state changes.
  const handlersRef = useRef({ isInDrawer, onSelect, collectionSlug, openModal, setSelection })
  handlersRef.current = { isInDrawer, onSelect, collectionSlug, openModal, setSelection }

  const handleCardClick = useCallback((index: number, doc: MediaDoc) => {
    const { isInDrawer, onSelect, collectionSlug, openModal } = handlersRef.current
    if (isInDrawer && onSelect) {
      onSelect({ collectionSlug, doc, docID: String(doc.id) })
      return
    }
    setLightboxIndex(index)
    openModal(LIGHTBOX_SLUG)
  }, [])

  const handleSelectionToggle = useCallback((id: number) => {
    handlersRef.current.setSelection(id)
  }, [])

  // ── Drag handlers ───────────────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) {
      setDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(false)
      dragCounter.current = 0
      openBulkUpload(e.dataTransfer.files)
    },
    [openBulkUpload],
  )

  return (
    <div
      className={`media-gallery ${dragging ? 'media-gallery--dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {dragging && (
        <div className="media-gallery__drop-overlay">
          <div className="media-gallery__drop-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Drop files to upload</span>
          </div>
        </div>
      )}

      <div className="media-gallery__items">
        {docs.length === 0 ? (
          <div className="media-gallery__empty">
            <p>No media files found. Drag and drop files here to upload.</p>
          </div>
        ) : (
          docs.map((doc, index) => (
            <MediaGalleryCard
              key={doc.id}
              doc={doc}
              index={index}
              isSelected={selected.get(doc.id) === true}
              isInDrawer={isInDrawer}
              onClick={handleCardClick}
              onSelectionToggle={handleSelectionToggle}
            />
          ))
        )}
      </div>

      {!isInDrawer && (
        <MediaLightbox
          docs={docs}
          collectionSlug={collectionSlug}
          lightboxIndex={lightboxIndex}
          setLightboxIndex={setLightboxIndex}
        />
      )}

      {!isInDrawer && <BulkUploadDrawer />}
    </div>
  )
}

export default function MediaGalleryView(props: ListViewClientProps) {
  return (
    <BulkUploadProvider>
      <MediaGalleryInner {...props} />
    </BulkUploadProvider>
  )
}
