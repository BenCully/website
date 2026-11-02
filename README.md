# Ben Cully

Personal site for Ben Cully. React, Vite, Tailwind CSS, Node 24, and Yarn. The production build is a static `dist/` folder published to the existing S3 and CloudFront stack. Route 53 keeps pointing at that CloudFront distribution; deploys do not change DNS.

The canonical URL in the page metadata is [bencully.com](https://bencully.com/).

## Local development

Use Node 24 (`nvm use` reads `.nvmrc`).

```bash
yarn install
yarn dev
```

Other scripts:

```bash
yarn lint
yarn build
yarn preview
```

`yarn build` typechecks, then writes the static site to `dist/`.

Copy for the page lives in `src/content.ts`.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds on every pull request and on `main`. A push to `main`, or a manual run, also publishes the site.

The first deploy fails until these are set under **Settings → Secrets and variables → Actions**.

Secrets:

| Name | Value |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | Access key for the deploy user |
| `AWS_SECRET_ACCESS_KEY` | Secret key for the deploy user |

Variables:

| Name | Value |
| --- | --- |
| `AWS_REGION` | Region of the S3 bucket, for example `us-east-1` |
| `S3_BUCKET` | Bucket name only, no `s3://` prefix |
| `CF_DISTRO_ID` | CloudFront distribution id, for example `E1ABCDEFGHIJK` |

The deploy user needs permission to list, put, and delete objects in that bucket, and to create an invalidation on that distribution.

The bucket is the CloudFront origin. The distribution's default root object should be `index.html`. The Route 53 record for the site should already be an alias to that distribution. After the variables are saved, re-run the failed workflow from the Actions tab.

Hashed assets are cached for a year. `index.html`, `robots.txt`, and `sitemap.xml` are uploaded again with `must-revalidate`, then CloudFront is invalidated.
