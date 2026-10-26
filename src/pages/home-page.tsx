import { useCallback, useState } from 'react'
import { Lightbox } from '@/components/lightbox'
import { homeRow, homeStacked, type Artwork } from '@/data/content'

const gallery = [...homeStacked, ...homeRow]

export function HomePage() {
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
        {homeStacked.map((image) => (
          <button
            key={image.src}
            type="button"
            className="block cursor-zoom-in"
            aria-label={image.alt}
            onClick={() => open(image)}
          >
            <img src={image.src} alt={image.alt} className="w-full" />
          </button>
        ))}
      </div>
      <div className="mt-2.5 overflow-x-auto">
        <div className="mx-auto flex w-max gap-2.5 px-3 sm:px-5">
          {homeRow.map((image) => (
            <button
              key={image.src}
              type="button"
              className="block w-[min(78vw,520px)] shrink-0 cursor-zoom-in"
              aria-label={image.alt}
              onClick={() => open(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="aspect-square w-full object-cover"
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
