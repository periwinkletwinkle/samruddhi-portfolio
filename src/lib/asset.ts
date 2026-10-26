/** Prefix a public-folder path with Vite's base, so project Pages URLs resolve. */
export function asset(path: string) {
  const normalized = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${normalized}`
}
