import { useCallback, useMemo, useState } from 'react'
import { Lightbox } from '@/components/lightbox'
import type { Artwork } from '@/data/content'
import { visibleGallery } from '@/lib/gallery-edits'

export function HomePage() {
  const entries = useState(() => visibleGallery())[0]
  const stacked = useMemo(() => entries.filter((image) => image.placement === 'stacked'), [entries])
  const row = useMemo(() => entries.filter((image) => image.placement === 'row'), [entries])
  const gallery = useMemo(() => [...stacked, ...row], [stacked, row])
  const [index, setIndex] = useState<number | null>(null)
  const close = useCallback(() => setIndex(null), [])
  const set = useCallback((next: number) => setIndex(next), [])

  function open(image: Artwork) {
    const found = gallery.findIndex((item) => item.src === image.src)
    setIndex(found)
  }

  return (
    <div className="pb-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2.5 px-3 pt-3 sm:px-5">
        {stacked.map((image, imageIndex) => (
          <button
            key={image.id}
            type="button"
            className="block cursor-zoom-in"
            aria-label={image.alt}
            onClick={() => open(image)}
          >
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-auto w-full"
              loading={imageIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={imageIndex === 0 ? 'high' : 'low'}
            />
          </button>
        ))}
      </div>
      <div className="mt-2.5 overflow-x-auto">
        <div className="mx-auto flex w-max gap-2.5 px-3 sm:px-5">
          {row.map((image) => (
            <button
              key={image.id}
              type="button"
              className="block w-[min(78vw,520px)] shrink-0 cursor-zoom-in"
              aria-label={image.alt}
              onClick={() => open(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="aspect-square h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </button>
          ))}
        </div>
      </div>
      {index !== null ? (
        <Lightbox images={gallery} index={index} onClose={close} onIndex={set} />
      ) : null}
    </div>
  )
}
