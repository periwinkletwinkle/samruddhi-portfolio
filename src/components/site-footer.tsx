import { site } from '@/data/content'

export function SiteFooter() {
  return (
    <footer className="px-6 py-10 text-center text-sm tracking-wide">
      {site.copyright}
    </footer>
  )
}
