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
4. Push to `main`. The workflow in `.github/workflows/deploy-pages.yml` publishes the site. With the custom domain connected, it is served at `https://spicytofu.in`.

## Custom domain

The live domain is `spicytofu.in`. `public/CNAME` contains that hostname, and the Pages build uses base path `/`.

DNS is managed at GoDaddy (`domaincontrol.com`). The apex needs GitHub Pages `A` and `AAAA` records, and `www` needs a `CNAME` to `periwinkletwinkle.github.io`. See [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Content

Copy and image paths live in `src/data/content.ts`. Artwork files are in `public/images/`.
