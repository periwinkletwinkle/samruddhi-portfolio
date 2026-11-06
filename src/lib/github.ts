import type { GalleryFile, GalleryItem } from '@/data/content'

const API = 'https://api.github.com'
const REPO = 'periwinkletwinkle/samruddhi-portfolio'
const BRANCH = 'main'
const GALLERY_PATH = 'src/data/gallery.json'

export class GitHubError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type GitRef = { object: { sha: string } }
type GitCommit = { tree: { sha: string } }
type GitBlob = { sha: string }
type GitTree = { sha: string }
type RepoAccess = { permissions?: { push?: boolean } }
type GitUser = { login: string }
type ContentFile = { content: string }

async function github<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  if (!response.ok) {
    let message = `GitHub request failed (${response.status}).`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // The body was not JSON.
    }
    throw new GitHubError(message, response.status)
  }
  return (await response.json()) as T
}

export async function checkAccess(token: string) {
  const user = await github<GitUser>(token, '/user')
  const repo = await github<RepoAccess>(token, `/repos/${REPO}`)
  if (!repo.permissions?.push) {
    throw new GitHubError('This token cannot edit the portfolio repository.', 403)
  }
  return user
}

export async function loadGallery(token: string): Promise<GalleryFile> {
  try {
    const file = await github<ContentFile>(
      token,
      `/repos/${REPO}/contents/${GALLERY_PATH}?ref=${BRANCH}`,
    )
    const binary = atob(file.content.replace(/\n/g, ''))
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as GalleryFile
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) {
      throw new GitHubError(
        'The gallery file is not on GitHub yet. Push this version of the site, then try again.',
        404,
      )
    }
    throw error
  }
}

export async function publishImages(
  token: string,
  gallery: GalleryFile,
  files: { path: string; base64: string }[],
) {
  const ref = await github<GitRef>(token, `/repos/${REPO}/git/ref/heads/${BRANCH}`)
  const parent = await github<GitCommit>(token, `/repos/${REPO}/git/commits/${ref.object.sha}`)
  const uploads: { path: string; sha: string }[] = []

  for (const file of files) {
    const blob = await github<GitBlob>(token, `/repos/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: file.base64, encoding: 'base64' }),
    })
    uploads.push({ path: file.path, sha: blob.sha })
  }

  const galleryBlob = await github<GitBlob>(token, `/repos/${REPO}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({
      content: JSON.stringify(gallery, null, 2) + '\n',
      encoding: 'utf-8',
    }),
  })

  const tree = await github<GitTree>(token, `/repos/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: [
        ...uploads.map((file) => ({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: file.sha,
        })),
        {
          path: GALLERY_PATH,
          mode: '100644',
          type: 'blob',
          sha: galleryBlob.sha,
        },
      ],
    }),
  })

  const commit = await github<GitBlob>(token, `/repos/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'Add gallery images.',
      tree: tree.sha,
      parents: [ref.object.sha],
    }),
  })

  await github(token, `/repos/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })
}

export function appendGalleryItem(
  gallery: GalleryFile,
  placement: 'stacked' | 'row',
  item: GalleryItem,
): GalleryFile {
  return {
    stacked: placement === 'stacked' ? [...gallery.stacked, item] : gallery.stacked,
    row: placement === 'row' ? [...gallery.row, item] : gallery.row,
  }
}
