import { useEffect } from 'react'
import type { Artwork } from '@/data/content'

type LightboxProps = {
  images: Artwork[]
  index: number
  onClose: () => void
  onIndex: (index: number) => void
}

export function Lightbox({ images, index, onClose, onIndex }: LightboxProps) {
  const image = images[index]

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onIndex((index + 1) % images.length)
      if (event.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length)
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [images.length, index, onClose, onIndex])

  if (!image) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 px-3 py-2 text-sm tracking-[0.14em] text-white"
        onClick={onClose}
      >
        CLOSE
      </button>
      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className="absolute top-1/2 left-3 -translate-y-1/2 px-3 py-2 text-2xl text-white"
            onClick={(event) => {
              event.stopPropagation()
              onIndex((index - 1 + images.length) % images.length)
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            className="absolute top-1/2 right-3 -translate-y-1/2 px-3 py-2 text-2xl text-white"
            onClick={(event) => {
              event.stopPropagation()
              onIndex((index + 1) % images.length)
            }}
          >
            ›
          </button>
        </>
      ) : null}
      <img
        src={image.src}
        alt={image.alt}
        className="max-h-[90vh] max-w-[92vw] object-contain"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}
