import { useCallback, useState } from 'react'
import { Lightbox } from '@/components/lightbox'
import { backgrounds } from '@/data/content'

export function BackgroundsPage() {
  const [index, setIndex] = useState<number | null>(null)
  const close = useCallback(() => setIndex(null), [])
  const set = useCallback((next: number) => setIndex(next), [])

  return (
    <div className="overflow-x-auto py-3">
      <div className="mx-auto flex w-max items-center gap-2.5 px-3 sm:px-5">
        {backgrounds.map((image, imageIndex) => (
          <button
            key={image.src}
            type="button"
            className="block shrink-0 cursor-zoom-in"
            aria-label={image.alt}
            onClick={() => setIndex(imageIndex)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="h-[min(72vh,680px)] w-auto max-w-none"
            />
          </button>
        ))}
      </div>
      {index !== null ? (
        <Lightbox images={backgrounds} index={index} onClose={close} onIndex={set} />
      ) : null}
    </div>
  )
}
