import { Link, useParams } from "react-router"
import { posts } from "./content.ts"
import { frame } from "./frame.ts"
import { usePageMeta } from "./page-meta.ts"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return `${MONTHS[(month ?? 1) - 1]} ${day}, ${year}`
}

export function BlogIndex() {
  usePageMeta("Blog — Ben Cully", "/blog")

  return (
    <div className={frame}>
      <section className="pt-14 pb-4" aria-labelledby="blog-heading">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="font-mono text-xs tracking-[0.08em] text-muted">01</span>
          <h1
            id="blog-heading"
            className="font-serif text-[2rem] leading-none font-[560] tracking-[-0.03em]"
          >
            Blog
          </h1>
        </div>
        <ol className="list-none border-t border-ink p-0">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Link
                className="group grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-4 border-b border-line px-3 py-5 no-underline hover:bg-[#e5f0ea] focus-visible:bg-[#e5f0ea] max-md:grid-cols-[2.5rem_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-2"
                to={`/blog/${post.slug}`}
              >
                <span
                  className="pt-1.5 font-mono text-xs tracking-[0.08em] text-pine-mid"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-[1.35rem] tracking-[-0.03em] transition-transform duration-150 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                    {post.title}
                  </span>
                  <span className="max-w-2xl text-muted">{post.paragraphs[0]}</span>
                </span>
                <time
                  className="pt-1.5 font-mono text-xs tracking-[0.08em] text-muted max-md:col-start-2 max-md:pt-0"
                  dateTime={post.date}
                >
                  {formatDate(post.date)}
                </time>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const post = posts.find((entry) => entry.slug === slug)

  usePageMeta(
    post ? `${post.title} — Ben Cully` : "Not found — Ben Cully",
    post ? `/blog/${post.slug}` : "/blog",
  )

  if (!post) {
    return (
      <div className={frame}>
        <section className="pt-14" aria-labelledby="missing-post-heading">
          <h1
            id="missing-post-heading"
            className="font-serif text-[2rem] leading-none font-[560] tracking-[-0.03em]"
          >
            Not found
          </h1>
          <p className="mt-4 max-w-xl">That post is not on this site.</p>
          <p className="mt-6">
            <Link
              className="underline decoration-mark decoration-[3px] underline-offset-[0.18em] hover:text-pine-mid"
              to="/blog"
            >
              Back to the blog
            </Link>
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className={frame}>
      <article className="pt-14" aria-labelledby="post-heading">
        <p>
          <Link
            className="font-mono text-xs tracking-[0.08em] text-pine-mid uppercase no-underline hover:text-ink"
            to="/blog"
          >
            Blog
          </Link>
        </p>
        <h1
          id="post-heading"
          className="mt-4 font-serif text-[clamp(2.4rem,6vw,4.5rem)] leading-none font-[560] tracking-[-0.04em]"
        >
          {post.title}
        </h1>
        <time
          className="mt-4 block font-mono text-xs tracking-[0.08em] text-muted uppercase"
          dateTime={post.date}
        >
          {formatDate(post.date)}
        </time>
        <div className="mt-8 flex max-w-2xl flex-col gap-4">
          {post.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}

export function NotFound() {
  usePageMeta("Not found — Ben Cully", "/")

  return (
    <div className={frame}>
      <section className="pt-14" aria-labelledby="missing-heading">
        <h1
          id="missing-heading"
          className="font-serif text-[2rem] leading-none font-[560] tracking-[-0.03em]"
        >
          Not found
        </h1>
        <p className="mt-4 max-w-xl">That page is not on this site.</p>
        <p className="mt-6">
          <Link
            className="underline decoration-mark decoration-[3px] underline-offset-[0.18em] hover:text-pine-mid"
            to="/"
          >
            Back home
          </Link>
        </p>
      </section>
    </div>
  )
}
