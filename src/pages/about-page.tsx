import { about, site } from '@/data/content'

export function AboutPage() {
  return (
    <section className="mx-auto grid max-w-[1100px] items-start gap-10 px-6 py-10 sm:px-10 md:grid-cols-2 md:py-14">
      <img src={about.portrait} alt={about.portraitAlt} className="w-full" />
      <div className="max-w-md md:pt-6">
        <h1 className="font-sans text-[1.35rem] font-normal tracking-wide">{site.name.toUpperCase()}</h1>
        <p className="mt-1 tracking-[0.08em]">{site.role.toUpperCase()}</p>
        <h2 className="mt-8 font-sans text-[1.35rem] font-normal">My Story</h2>
        {about.story.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="mt-4">
            {paragraph}
          </p>
        ))}
        <h2 className="mt-8 font-sans text-[1.35rem] font-normal">Contact</h2>
        <p className="mt-4">Email:</p>
        <p>
          <a className="underline underline-offset-4" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
        <ul className="mt-5 flex gap-3">
          {site.socials.map((social) => (
            <li key={social.href}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex size-10 items-center justify-center border border-ink/30 hover:bg-white"
              >
                <SocialIcon name={social.label} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function SocialIcon({ name }: { name: string }) {
  if (name === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (name === 'LinkedIn') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
        <path d="M4.7 3.4A1.8 1.8 0 1 0 4.7 7a1.8 1.8 0 0 0 0-3.6ZM3.3 8.7h2.8V20.5H3.3V8.7Zm4.6 0h2.7v1.6h.1c.4-.7 1.3-1.5 2.7-1.5 2.9 0 3.4 1.9 3.4 4.4v7.3h-2.8v-6.5c0-1.5 0-3.5-2.1-3.5s-2.5 1.7-2.5 3.4v6.6H7.9V8.7Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
      <path d="M4 16.5 8.2 8.2 12.2 14l2.4-4.2L20 16.5H4Zm8.2-9.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
    </svg>
  )
}
