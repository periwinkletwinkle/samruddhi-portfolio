import type { Artwork } from '@/data/content'

const STORAGE_KEY = 'samruddhi-extra-images'

export type ExtraImage = {
  id: string
  placement: 'stacked' | 'row'
  alt: string
  width: number
  height: number
  src: string
}

export function loadExtraImages(): ExtraImage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ExtraImage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveExtraImages(images: ExtraImage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
}

export function toArtwork(image: ExtraImage): Artwork {
  return {
    src: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
  }
}
