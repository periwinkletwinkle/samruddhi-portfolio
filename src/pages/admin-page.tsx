import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addImages,
  hideImage,
  isReplaced,
  patchImage,
  removedGallery,
  restoreImage,
  useOriginal,
  visibleGallery,
  type GalleryEntry,
  type Placement,
} from '@/lib/gallery-edits'
import { blobToBase64, prepareImage } from '@/lib/prepare-image'

type Draft = {
  id: string
  file: File
  alt: string
  placement: Placement
  previewUrl: string
}

export function AdminPage() {
  const [images, setImages] = useState<GalleryEntry[]>(() => visibleGallery())
  const [removed, setRemoved] = useState<GalleryEntry[]>(() => removedGallery())
  const [drafts, setDrafts] = useState<Draft[]>([])
  const draftsRef = useRef(drafts)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const addInput = useRef<HTMLInputElement>(null)

  function refresh() {
    setImages(visibleGallery())
    setRemoved(removedGallery())
  }

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  useEffect(() => {
    return () => {
      for (const draft of draftsRef.current) URL.revokeObjectURL(draft.previewUrl)
    }
  }, [])

  function addFiles(files: FileList | null) {
    if (!files) return
    const next = [...files].map((file) => ({
      id: crypto.randomUUID(),
      file,
      alt: '',
      placement: 'stacked' as const,
      previewUrl: URL.createObjectURL(file),
    }))
    setDrafts((current) => [...current, ...next])
    setError(null)
  }

  function updateDraft(id: string, patch: Partial<Pick<Draft, 'alt' | 'placement'>>) {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)))
  }

  function removeDraft(id: string) {
    setDrafts((current) => {
      const draft = current.find((item) => item.id === id)
      if (draft) URL.revokeObjectURL(draft.previewUrl)
      return current.filter((item) => item.id !== id)
    })
  }

  async function saveDrafts() {
    if (drafts.some((draft) => draft.alt.trim() === '')) {
      setError('Add a short description for every new image.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const additions: GalleryEntry[] = []
      for (const draft of drafts) {
        const prepared = await prepareImage(draft.file)
        const base64 = await blobToBase64(prepared.blob)
        additions.push({
          id: draft.id,
          builtIn: false,
          placement: draft.placement,
          alt: draft.alt.trim(),
          width: prepared.width,
          height: prepared.height,
          src: `data:image/jpeg;base64,${base64}`,
        })
      }
      addImages(additions)
      for (const draft of drafts) URL.revokeObjectURL(draft.previewUrl)
      setDrafts([])
      refresh()
    } catch (caught) {
      setError(storageError(caught))
    } finally {
      setSaving(false)
    }
  }

  async function replaceImage(id: string, file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      const prepared = await prepareImage(file)
      const base64 = await blobToBase64(prepared.blob)
      patchImage(id, {
        src: `data:image/jpeg;base64,${base64}`,
        width: prepared.width,
        height: prepared.height,
      })
      refresh()
    } catch (caught) {
      setError(storageError(caught))
    }
  }

  function removeImage(id: string) {
    hideImage(id)
    refresh()
  }

  const stacked = images.filter((image) => image.placement === 'stacked')
  const row = images.filter((image) => image.placement === 'row')

  return (
    <main className="mx-auto min-h-svh max-w-5xl px-6 py-8 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <p className="font-display text-sm tracking-[0.18em]">GALLERY</p>
          <h1 className="mt-2 font-display text-4xl tracking-wide">Edit images</h1>
        </div>
        <Link to="/" className="border border-ink/20 px-4 py-2 text-sm tracking-wide hover:bg-white">
          View site
        </Link>
      </header>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-sans text-2xl font-normal">Add</h2>
          <button
            type="button"
            className="border border-ink px-4 py-2 text-sm tracking-wide hover:bg-white"
            onClick={() => addInput.current?.click()}
          >
            Choose images
          </button>
          <input
            ref={addInput}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => {
              addFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </div>
        {drafts.length === 0 ? (
          <button
            type="button"
            className="mt-4 w-full border border-dashed border-ink/30 bg-white/50 px-6 py-10 text-center hover:bg-white"
            onClick={() => addInput.current?.click()}
          >
            Drop images here, or choose files. They are resized before saving.
          </button>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {drafts.map((draft) => (
              <li key={draft.id} className="border border-ink/10 bg-white">
                <img src={draft.previewUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="space-y-3 p-4">
                  <label className="block">
                    <span className="text-sm">Description</span>
                    <input
                      className="mt-1 w-full border border-ink/15 bg-cream px-3 py-2"
                      value={draft.alt}
                      onChange={(event) => updateDraft(draft.id, { alt: event.target.value })}
                    />
                  </label>
                  <PlacementSelect
                    value={draft.placement}
                    onChange={(placement) => updateDraft(draft.id, { placement })}
                  />
                  <button
                    type="button"
                    className="text-sm underline underline-offset-4"
                    onClick={() => removeDraft(draft.id)}
                  >
                    Discard
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {drafts.length > 0 ? (
          <button
            type="button"
            className="mt-4 border border-ink bg-ink px-5 py-3 tracking-wide text-cream disabled:opacity-50"
            disabled={saving}
            onClick={() => void saveDrafts()}
          >
            {saving ? 'Saving…' : 'Add to Home'}
          </button>
        ) : null}
      </section>

      {error ? <p className="mt-6 text-red-800">{error}</p> : null}

      <ImageGroup
        title="Full width"
        images={stacked}
        onChange={refresh}
        onReplace={replaceImage}
        onRemove={removeImage}
      />
      <ImageGroup
        title="Small row"
        images={row}
        onChange={refresh}
        onReplace={replaceImage}
        onRemove={removeImage}
      />

      {removed.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-sans text-2xl font-normal">Removed</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {removed.map((image) => (
              <li key={image.id} className="flex items-center gap-4 border border-ink/10 bg-white p-3">
                <img src={image.src} alt="" className="h-20 w-28 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{image.alt}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm underline underline-offset-4"
                    onClick={() => {
                      restoreImage(image.id)
                      refresh()
                    }}
                  >
                    Put back
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}

function ImageGroup({
  title,
  images,
  onChange,
  onReplace,
  onRemove,
}: {
  title: string
  images: GalleryEntry[]
  onChange: () => void
  onReplace: (id: string, file: File | undefined) => void
  onRemove: (id: string) => void
}) {
  if (images.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="font-sans text-2xl font-normal">{title}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onChange={onChange}
            onReplace={onReplace}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  )
}

function ImageCard({
  image,
  onChange,
  onReplace,
  onRemove,
}: {
  image: GalleryEntry
  onChange: () => void
  onReplace: (id: string, file: File | undefined) => void
  onRemove: (id: string) => void
}) {
  const inputId = `replace-${image.id}`
  const replaced = image.builtIn && isReplaced(image.id)

  return (
    <li className="border border-ink/10 bg-white">
      <img src={image.src} alt="" className="aspect-[4/3] w-full object-cover" />
      <div className="space-y-3 p-4">
        <label className="block">
          <span className="text-sm">Description</span>
          <input
            className="mt-1 w-full border border-ink/15 bg-cream px-3 py-2"
            defaultValue={image.alt}
            key={image.alt}
            onBlur={(event) => {
              const alt = event.target.value.trim()
              if (!alt || alt === image.alt) return
              patchImage(image.id, { alt })
              onChange()
            }}
          />
        </label>
        <PlacementSelect
          value={image.placement}
          onChange={(placement) => {
            patchImage(image.id, { placement })
            onChange()
          }}
        />
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className="cursor-pointer border border-ink/20 px-3 py-2 text-sm tracking-wide hover:bg-cream"
          >
            Replace
          </label>
          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              void onReplace(image.id, event.target.files?.[0])
              event.target.value = ''
            }}
          />
          {replaced ? (
            <button
              type="button"
              className="px-3 py-2 text-sm underline underline-offset-4"
              onClick={() => {
                useOriginal(image.id)
                onChange()
              }}
            >
              Use original
            </button>
          ) : null}
          <button
            type="button"
            className="px-3 py-2 text-sm underline underline-offset-4"
            onClick={() => onRemove(image.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

function PlacementSelect({
  value,
  onChange,
}: {
  value: Placement
  onChange: (placement: Placement) => void
}) {
  return (
    <label className="block">
      <span className="text-sm">Placement</span>
      <select
        className="mt-1 w-full border border-ink/15 bg-cream px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value as Placement)}
      >
        <option value="stacked">Full width on Home</option>
        <option value="row">Small row on Home</option>
      </select>
    </label>
  )
}

function storageError(caught: unknown) {
  const full = caught instanceof DOMException && caught.name === 'QuotaExceededError'
  if (full) return 'This browser ran out of room for more images. Remove one, or use a smaller file.'
  return caught instanceof Error ? caught.message : 'Could not save the images.'
}
