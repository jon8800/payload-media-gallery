export const LIGHTBOX_SLUG = 'media-gallery-lightbox'

export interface SizeEntry {
  url?: string | null
  width?: number | null
  height?: number | null
  filesize?: number | null
}

export interface MediaDoc {
  id: number
  alt?: string
  filename?: string
  mimeType?: string
  filesize?: number
  url?: string
  thumbnailURL?: string
  width?: number
  height?: number
  createdAt?: string
  updatedAt?: string
  sizes?: Record<string, SizeEntry | undefined>
}

export function isImage(mimeType?: string | null): boolean {
  return !!mimeType?.startsWith('image/')
}

export function formatBytes(bytes?: number | null): string {
  if (bytes == null) return ''
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function formatType(mimeType?: string | null): string {
  if (!mimeType) return ''
  const sub = mimeType.split('/')[1] ?? ''
  return sub.replace(/^x-/, '').toUpperCase()
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
