import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { posts, site } from "../src/content.ts"

// CloudFront uses the S3 REST origin. A route works only when that exact
// object key exists. /blog is the key "blog", not blog/index.html, and a
// local file cannot also be the blog/ directory, so the index is written
// as dist/blog/index.html and the deploy uploads it to the key "blog".
const dist = "dist"
const index = join(dist, "index.html")
const routes = [
  ["index.html", "index.html"],
  ["home", "home"],
  ["blog/index.html", "blog"],
]

copyFileSync(index, join(dist, "home"))
mkdirSync(join(dist, "blog"), { recursive: true })
copyFileSync(index, join(dist, "blog/index.html"))

for (const post of posts) {
  const file = join("blog", post.slug)
  const target = join(dist, file)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(index, target)
  routes.push([file, file])
}

// The dashboard is its own document, not the React shell. Vite copies
// public/used-cars.html to dist/used-cars.html. The S3 key is `used-cars`.
const usedCarsFile = "used-cars.html"
const hasUsedCars = existsSync(join(dist, usedCarsFile))
if (hasUsedCars) routes.push([usedCarsFile, "used-cars"])

writeFileSync(
  join(dist, "html-routes.txt"),
  `${routes.map(([source, key]) => `${source}\t${key}`).join("\n")}\n`,
)

const urls = [
  `${site.url}/`,
  ...(hasUsedCars ? [`${site.url}/used-cars`] : []),
  `${site.url}/blog`,
  ...posts.map((post) => `${site.url}/blog/${post.slug}`),
]

function xml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${xml(url)}</loc>\n  </url>`).join("\n")}
</urlset>
`

writeFileSync(join(dist, "sitemap.xml"), sitemap)

const publicSitemap = readFileSync("public/sitemap.xml", "utf8")
if (publicSitemap !== sitemap) {
  console.warn("public/sitemap.xml does not match the routes in src/content.ts")
}
