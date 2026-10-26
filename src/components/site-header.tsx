import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'HOME', end: true },
  { to: '/about', label: 'ABOUT ME', end: false },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8 sm:px-10 md:flex-row md:items-end md:justify-between md:py-12">
        <NavLink to="/" className="block min-w-0">
          <span className="block font-display text-[clamp(1.05rem,2.9vw,3.15rem)] leading-none tracking-[0.14em] whitespace-nowrap text-ink">
            SAMRUDDHI DHUMAL
          </span>
          <span className="mt-3 block font-sans text-[clamp(1.15rem,2vw,1.95rem)] font-light tracking-[0.08em] text-ink">
            ILLUSTRATOR
          </span>
        </NavLink>
        <nav aria-label="Site">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      'font-display text-[1.35rem] tracking-[0.1em] text-ink',
                      isActive ? 'underline decoration-1 underline-offset-8' : 'hover:opacity-70',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
