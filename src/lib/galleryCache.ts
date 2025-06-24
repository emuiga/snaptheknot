interface GalleryImage {
  src: string
  width: number
  height: number
  date: string
  name: string
}


let galleryCache: {
  images: GalleryImage[]
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 

export const getCachedImages = (): GalleryImage[] | null => {
  if (galleryCache && (Date.now() - galleryCache.timestamp) < CACHE_DURATION) {
    return galleryCache.images
  }
  return null
}

export const setCachedImages = (images: GalleryImage[]): void => {
  galleryCache = {
    images,
    timestamp: Date.now()
  }
}


export const invalidateGalleryCache = (): void => {
  galleryCache = null
}


if (typeof window !== 'undefined') {
  (window as any).invalidateGalleryCache = invalidateGalleryCache
}

export type { GalleryImage } 