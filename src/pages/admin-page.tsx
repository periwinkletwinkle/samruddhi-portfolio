import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadExtraImages, saveExtraImages, type ExtraImage } from '@/lib/extra-images'
import { blobToBase64, prepareImage } from '@/lib/prepare-image'

type Draft = {
  id: string
  file: File
  alt: string
  placement: 'stacked' | 'row'
  previewUrl: string
}

export function AdminPage() {
  const [saved, setSaved] = useState<ExtraImage[]>(() => loadExtraImages())
  const [drafts, setDrafts] = useState<Draft[]>([])
  const draftsRef = useRef(drafts)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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

  async function save() {
    if (drafts.some((draft) => draft.alt.trim() === '')) {
      setError('Add a short description for every image.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const additions: ExtraImage[] = []
      for (const draft of drafts) {
        const prepared = await prepareImage(draft.file)
        const base64 = await blobToBase64(prepared.blob)
        additions.push({
          id: draft.id,
          placement: draft.placement,
          alt: draft.alt.trim(),
          width: prepared.width,
          height: prepared.height,
          src: `data:image/jpeg;base64,${base64}`,
        })
      }
      const next = [...saved, ...additions]
      saveExtraImages(next)
      for (const draft of drafts) URL.revokeObjectURL(draft.previewUrl)
      setSaved(next)
      setDrafts([])
    } catch (caught) {
      const full = caught instanceof DOMException && caught.name === 'QuotaExceededError'
      setError(
        full
          ? 'This browser ran out of room for more images. Remove one, or use a smaller file.'
          : caught instanceof Error
            ? caught.message
            : 'Could not save the images.',
      )
    } finally {
      setSaving(false)
    }
  }

  function removeSaved(id: string) {
    const next = saved.filter((image) => image.id !== id)
    saveExtraImages(next)
    setSaved(next)
  }

  return (
    <main className="mx-auto min-h-svh max-w-3xl px-6 py-10">
      <p className="font-display text-sm tracking-[0.16em]">ADD ARTWORK</p>
      <h1 className="mt-3 font-display text-4xl tracking-wide">New images</h1>
      <p className="mt-4 max-w-xl">
        Choose images, add a short description, and save. They show on Home in this browser.
      </p>
      <p className="mt-6">
        <Link to="/" className="underline underline-offset-4">
          Back to the site
        </Link>
      </p>

      <label className="mt-10 block">
        <span className="font-normal">Images</span>
        <input
          className="mt-2 block w-full"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </label>

      <ul className="mt-6 flex flex-col gap-6">
        {drafts.map((draft) => (
          <li key={draft.id} className="grid gap-4 border border-ink/15 bg-white p-4 sm:grid-cols-[120px_1fr]">
            <img src={draft.previewUrl} alt="" className="h-28 w-full object-cover" />
            <div>
              <label className="block">
                <span className="text-sm">Description</span>
                <input
                  className="mt-1 w-full border border-ink/20 bg-cream px-3 py-2"
                  value={draft.alt}
                  onChange={(event) => updateDraft(draft.id, { alt: event.target.value })}
                />
              </label>
              <label className="mt-3 block">
                <span className="text-sm">Placement</span>
                <select
                  className="mt-1 w-full border border-ink/20 bg-cream px-3 py-2"
                  value={draft.placement}
                  onChange={(event) =>
                    updateDraft(draft.id, { placement: event.target.value as Draft['placement'] })
                  }
                >
                  <option value="stacked">Full width on Home</option>
                  <option value="row">Small row on Home</option>
                </select>
              </label>
              <button
                type="button"
                className="mt-3 text-sm underline underline-offset-4"
                onClick={() => removeDraft(draft.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {drafts.length > 0 ? (
        <button
          type="button"
          className="mt-6 border border-ink px-5 py-3 font-normal tracking-wide disabled:opacity-50"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? 'Saving…' : 'Save to Home'}
        </button>
      ) : null}

      {error ? <p className="mt-6 text-red-800">{error}</p> : null}

      {saved.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-sans text-xl font-normal">Saved in this browser</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {saved.map((image) => (
              <li key={image.id} className="flex items-center gap-4">
                <img src={image.src} alt="" className="h-16 w-16 object-cover" />
                <span className="min-w-0 flex-1">{image.alt}</span>
                <button
                  type="button"
                  className="text-sm underline underline-offset-4"
                  onClick={() => removeSaved(image.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
