# Agents

Personal site for Ben Cully, a software developer in Chicago. It is a single-page React app built with Vite and Tailwind, published as a static site to S3 and CloudFront. The public URL is https://bencully.com/. Route 53 already points at that CloudFront distribution. Deploys do not change DNS.

## Stack

- Node 24 (`.nvmrc`, `package.json` `engines`)
- Yarn 1.22 (`packageManager` in `package.json`). Use Yarn, not npm.
- React 19, TypeScript, Vite 8
- Tailwind CSS 4, via `@tailwindcss/vite`
- Oxlint

## Commands

```bash
nvm use
yarn install
yarn dev        # http://127.0.0.1:5173
yarn lint
yarn build      # typecheck, Vite build, then copy dist/index.html to dist/home
yarn preview
```

CI runs `yarn install --frozen-lockfile`, `yarn lint`, and `yarn build`. Update `yarn.lock` when dependencies change.

## Layout

- `src/content.ts` holds the name, about copy, project list, and job history. Change copy here before rewriting components.
- `src/App.tsx` is the page: header, hero, experience, work, about, contact, footer. Sections are in-page anchors (`#experience`, `#work`, `#about`, `#contact`). There is no router.
- `src/index.css` is the Tailwind entry. Brand colors and fonts live in the `@theme` block (`paper`, `ink`, `muted`, `line`, `pine`, `pine-mid`, `mark`).
- `src/main.tsx` loads the self-hosted fonts, then the CSS and the app.
- `public/` holds the favicon, `robots.txt`, and `sitemap.xml`. Those URLs use `https://bencully.com/`.
- `index.html` holds the title, description, and canonical URL.

Keep new UI on the existing type and color tokens. Prefer Tailwind utilities in the components. Put shared document styles in `@layer base` in `src/index.css`.

## Content

Only describe work Ben has actually published. The current projects come from his public GitHub repositories. Do not invent employers, clients, or projects. Do not add a personal email address. GitHub (https://github.com/BenCully) is the contact path.

## Deploy

`.github/workflows/deploy.yml` builds on pull requests and on pushes to `main`. A push to `main`, or a manual run, also deploys.

The workflow reads repository secrets and repository variables. It does not use a GitHub Environment, so environment secrets are invisible to it.

Repository secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Repository variables:

- `AWS_REGION`
- `S3_BUCKET` (name only, no `s3://`)
- `CF_DISTRO_ID`

Never commit AWS keys or put them in workflow files. `.local.pipeline.keys` is gitignored local scratch for those values. Leave it that way.

The bucket is the CloudFront origin. CloudFront uses the S3 REST endpoint, so the bucket website index and error documents do not apply. The distribution's default root object is `index.html`, which is why `/` works. `/home` is a second copy of that file uploaded as the extensionless object key `home`. The build writes it to `dist/home`, and the deploy sets its content type to `text/html`.

Hashed assets are cached for a year. `index.html`, `home`, `robots.txt`, and `sitemap.xml` are uploaded again with `must-revalidate`, then CloudFront is invalidated.

`/` and `/home` render the same page. Do not add another path unless the build also emits an extensionless object for it, or CloudFront is changed to serve `index.html` for unknown paths.

## Checks

After a UI or copy change, run `yarn lint` and `yarn build`, then open `yarn dev` and use the changed sections. Check a narrow viewport when the layout changes. `dist/` is generated and gitignored.
