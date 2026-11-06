import { homeRow, homeStacked, type Artwork } from '@/data/content'

const STORAGE_KEY = 'samruddhi-gallery-edits'
const OLD_STORAGE_KEY = 'samruddhi-extra-images'

export type Placement = 'stacked' | 'row'

export type GalleryEntry = Artwork & {
  id: string
  placement: Placement
  builtIn: boolean
}

type Patch = Partial<Pick<GalleryEntry, 'placement' | 'alt' | 'width' | 'height' | 'src'>>

type Edits = {
  hidden: string[]
  patches: Record<string, Patch>
  added: GalleryEntry[]
}

function emptyEdits(): Edits {
  return { hidden: [], patches: {}, added: [] }
}

function baseEntries(): GalleryEntry[] {
  return [
    ...homeStacked.map((item) => ({ ...item, id: item.src, placement: 'stacked' as const, builtIn: true })),
    ...homeRow.map((item) => ({ ...item, id: item.src, placement: 'row' as const, builtIn: true })),
  ]
}

function loadEdits(): Edits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...emptyEdits(), ...(JSON.parse(raw) as Edits) }
  } catch {
    return emptyEdits()
  }

  try {
    const old = localStorage.getItem(OLD_STORAGE_KEY)
    if (!old) return emptyEdits()
    const parsed = JSON.parse(old) as GalleryEntry[]
    const edits = emptyEdits()
    if (Array.isArray(parsed)) {
      edits.added = parsed.map((item) => ({ ...item, builtIn: false }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(edits))
    }
    return edits
  } catch {
    return emptyEdits()
  }
}

function saveEdits(edits: Edits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edits))
}

function update(change: (edits: Edits) => void) {
  const edits = loadEdits()
  change(edits)
  saveEdits(edits)
  return edits
}

export function visibleGallery(): GalleryEntry[] {
  const edits = loadEdits()
  const builtIn = baseEntries()
    .filter((item) => !edits.hidden.includes(item.id))
    .map((item) => ({ ...item, ...edits.patches[item.id] }))
  return [...builtIn, ...edits.added]
}

export function removedGallery(): GalleryEntry[] {
  const hidden = new Set(loadEdits().hidden)
  return baseEntries().filter((item) => hidden.has(item.id))
}

export function isReplaced(id: string) {
  return Boolean(loadEdits().patches[id]?.src)
}

export function hideImage(id: string) {
  update((edits) => {
    if (edits.added.some((item) => item.id === id)) {
      edits.added = edits.added.filter((item) => item.id !== id)
      return
    }
    if (!edits.hidden.includes(id)) edits.hidden.push(id)
  })
}

export function restoreImage(id: string) {
  update((edits) => {
    edits.hidden = edits.hidden.filter((item) => item !== id)
  })
}

export function useOriginal(id: string) {
  update((edits) => {
    const patch = { ...edits.patches[id] }
    delete patch.src
    delete patch.width
    delete patch.height
    if (Object.keys(patch).length === 0) delete edits.patches[id]
    else edits.patches[id] = patch
  })
}

export function patchImage(id: string, patch: Patch) {
  update((edits) => {
    const added = edits.added.find((item) => item.id === id)
    if (added) {
      edits.added = edits.added.map((item) => (item.id === id ? { ...item, ...patch } : item))
      return
    }
    edits.patches[id] = { ...edits.patches[id], ...patch }
  })
}

export function addImages(images: GalleryEntry[]) {
  update((edits) => {
    edits.added.push(...images)
  })
}
