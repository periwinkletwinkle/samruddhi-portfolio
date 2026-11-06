import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GalleryFile } from '@/data/content'
import {
  appendGalleryItem,
  checkAccess,
  GitHubError,
  loadGallery,
  publishImages,
} from '@/lib/github'
import { blobToBase64, imageFileName, prepareImage } from '@/lib/prepare-image'

const TOKEN_KEY = 'samruddhi-admin-token'

type Draft = {
  id: string
  file: File
  alt: string
  placement: 'stacked' | 'row'
  previewUrl: string
}

export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [login, setLogin] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const draftsRef = useRef(drafts)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishedCount, setPublishedCount] = useState(0)

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY)
    if (!saved) return
    void verify(saved)
  }, [])

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  useEffect(() => {
    return () => {
      for (const draft of draftsRef.current) URL.revokeObjectURL(draft.previewUrl)
    }
  }, [])

  async function verify(nextToken: string) {
    setChecking(true)
    setError(null)
    try {
      const user = await checkAccess(nextToken.trim())
      sessionStorage.setItem(TOKEN_KEY, nextToken.trim())
      setToken(nextToken.trim())
      setLogin(user.login)
    } catch (caught) {
      sessionStorage.removeItem(TOKEN_KEY)
      setLogin(null)
      setError(caught instanceof GitHubError ? caught.message : 'Could not sign in.')
    } finally {
      setChecking(false)
    }
  }

  function signOut() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setLogin(null)
    setStatus(null)
  }

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
    setStatus(null)
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

  async function publish() {
    if (drafts.some((draft) => draft.alt.trim() === '')) {
      setError('Add a short description for every image.')
      return
    }
    setPublishing(true)
    setError(null)
    setStatus(null)
    try {
      let gallery = await loadGallery(token)
      const files: { path: string; base64: string }[] = []
      for (const draft of drafts) {
        const prepared = await prepareImage(draft.file)
        const file = imageFileName(draft.file.name)
        const base64 = await blobToBase64(prepared.blob)
        files.push({ path: `public/images/home/${file}`, base64 })
        const item = {
          file,
          alt: draft.alt.trim(),
          width: prepared.width,
          height: prepared.height,
        }
        gallery = appendGalleryItem(gallery, draft.placement, item)
      }
      await publishImages(token, gallery, files)
      for (const draft of drafts) URL.revokeObjectURL(draft.previewUrl)
      setDrafts([])
      setPublishedCount((count) => count + 1)
      setStatus('Published. The live site updates after GitHub Pages finishes rebuilding, usually within a minute.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not publish the images.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <main className="mx-auto min-h-svh max-w-3xl px-6 py-10">
      <p className="font-display text-sm tracking-[0.16em]">PORTFOLIO ADMIN</p>
      <h1 className="mt-3 font-display text-4xl tracking-wide">Add artwork</h1>
      <p className="mt-4 max-w-xl">
        This page is public, but publishing requires a GitHub token that can edit{' '}
        <span className="font-normal">periwinkletwinkle/samruddhi-portfolio</span>. The token stays in this
        browser tab and is never saved in the site.
      </p>
      <p className="mt-6">
        <Link to="/" className="underline underline-offset-4">
          Back to the site
        </Link>
      </p>

      {login ? (
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <p>
              Signed in as <span className="font-normal">{login}</span>
            </p>
            <button type="button" className="underline underline-offset-4" onClick={signOut}>
              Sign out
            </button>
          </div>

          <label className="mt-8 block">
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
              disabled={publishing}
              onClick={() => void publish()}
            >
              {publishing ? 'Publishing…' : 'Publish to the site'}
            </button>
          ) : null}
        </section>
      ) : (
        <TokenForm
          initialToken={token}
          checking={checking}
          onSubmit={(value) => void verify(value)}
        />
      )}

      {error ? <p className="mt-6 text-red-800">{error}</p> : null}
      {status ? <p className="mt-6">{status}</p> : null}
      {login ? <GalleryPreview token={token} refresh={publishedCount} /> : null}
    </main>
  )
}

function TokenForm({
  initialToken,
  checking,
  onSubmit,
}: {
  initialToken: string
  checking: boolean
  onSubmit: (token: string) => void
}) {
  const [value, setValue] = useState(initialToken)

  return (
    <form
      className="mt-10 max-w-xl"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(value)
      }}
    >
      <h2 className="font-sans text-xl font-normal">GitHub token</h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5">
        <li>Open GitHub Settings, then Developer settings, then Fine-grained tokens.</li>
        <li>Choose the account that owns the repository, and limit the token to samruddhi-portfolio.</li>
        <li>Set Contents to Read and write. Leave every other permission off.</li>
        <li>Paste the token below.</li>
      </ol>
      <label className="mt-4 block">
        <span className="sr-only">GitHub token</span>
        <input
          className="w-full border border-ink/20 bg-white px-3 py-2"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <button
        type="submit"
        className="mt-4 border border-ink px-5 py-3 font-normal tracking-wide disabled:opacity-50"
        disabled={checking || value.trim() === ''}
      >
        {checking ? 'Checking…' : 'Continue'}
      </button>
    </form>
  )
}

function GalleryPreview({ token, refresh }: { token: string; refresh: number }) {
  const [gallery, setGallery] = useState<GalleryFile | null>(null)

  useEffect(() => {
    void loadGallery(token)
      .then(setGallery)
      .catch(() => setGallery(null))
  }, [token, refresh])

  if (!gallery) return null
  const items = [...gallery.stacked, ...gallery.row]

  return (
    <section className="mt-12">
      <h2 className="font-sans text-xl font-normal">Already on the site</h2>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={item.file}>{item.file}</li>
        ))}
      </ul>
    </section>
  )
}
