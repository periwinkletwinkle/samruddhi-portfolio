# Samruddhi Dhumal — Portfolio

Static illustrator portfolio for **Samruddhi Dhumal**. Built with Vite, React, TypeScript, and Tailwind CSS. Deploys to **GitHub Pages**.

Remote: `https://github.com/periwinkletwinkle/samruddhi-portfolio.git`

## Local development

```bash
npm install
npm run dev
```

The dev server runs at [http://127.0.0.1:4318](http://127.0.0.1:4318).

```bash
npm run build
npm run preview
```

## GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main`. The workflow in `.github/workflows/deploy-pages.yml` publishes the site at `https://periwinkletwinkle.github.io/samruddhi-portfolio/`.

The workflow sets the Vite base path to `/samruddhi-portfolio/` so assets resolve on that project URL.

## Custom domain

1. Copy `public/CNAME.example` to `public/CNAME` and put the bare domain on one line, with no `https://`.
2. In GitHub **Settings → Pages → Custom domain**, enter the same hostname.
3. Add a repository variable **Settings → Secrets and variables → Actions → Variables** named `VITE_BASE_PATH` with value `/`.
4. At the registrar, add the DNS records GitHub shows.
5. Push to `main`.

Do not commit a `CNAME` file until the domain is registered and DNS is ready.

## Content

Copy and image paths live in `src/data/content.ts`. Artwork files are in `public/images/`.
