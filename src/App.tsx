import type { ReactNode } from "react"
import { projects, site } from "./content.ts"

const frame =
  "mx-auto w-[min(1080px,calc(100%-3rem))] max-md:w-[min(1080px,calc(100%-2rem))]"

function ExternalLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

function Header() {
  return (
    <header className="border-b-4 border-mark bg-pine text-paper" id="top">
      <div className={`${frame} flex min-h-[4.75rem] flex-wrap items-center gap-x-6 gap-y-1 max-md:py-3`}>
        <a
          className="font-[580] tracking-[-0.03em] text-paper no-underline hover:text-mark"
          href="#top"
        >
          {site.name}
        </a>
        <nav aria-label="Sections">
          <ul className="flex list-none gap-1 p-0 max-md:-ml-3 max-md:w-full">
            {["Work", "About", "Contact"].map((label) => (
              <li key={label}>
                <a
                  className="inline-flex min-h-11 items-center px-3 text-[0.95rem] no-underline hover:text-mark focus-visible:outline-mark"
                  href={`#${label.toLowerCase()}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="ml-auto font-mono text-[0.78rem] tracking-[0.12em] uppercase max-md:ml-0">
          {site.location}
        </p>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="pt-18 pb-12 max-md:pt-11" aria-labelledby="intro-heading">
      <p className="font-mono text-[0.78rem] tracking-[0.14em] text-pine-mid uppercase">
        {site.role}
        <span aria-hidden="true"> · </span>
        <span>since {site.since}</span>
      </p>
      <h1
        id="intro-heading"
        className="mt-3 flex flex-col font-serif text-[clamp(5.25rem,16vw,10.5rem)] leading-[0.78] font-[560] tracking-[-0.055em]"
      >
        <span>Ben</span>
        <span className="text-pine">Cully</span>
      </h1>
      <p className="mt-7 max-w-xl text-[1.35rem] leading-[1.45]">{site.lede}</p>
      <dl className="mt-9 grid grid-cols-[repeat(3,max-content)] gap-8 border-t border-line pt-5 max-md:grid-cols-1 max-md:gap-4">
        <div>
          <dt className="font-mono text-[0.72rem] tracking-[0.12em] text-muted uppercase">
            Based
          </dt>
          <dd className="mt-1 text-[1.05rem]">{site.location}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.72rem] tracking-[0.12em] text-muted uppercase">
            Making things since
          </dt>
          <dd className="mt-1 text-[1.05rem]">{site.since}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.72rem] tracking-[0.12em] text-muted uppercase">
            Code
          </dt>
          <dd className="mt-1 text-[1.05rem]">
            <ExternalLink
              className="underline underline-offset-[0.18em] hover:text-pine-mid"
              href={site.github}
            >
              GitHub
            </ExternalLink>
          </dd>
        </div>
      </dl>
    </section>
  )
}

function SectionLabel({
  index,
  id,
  children,
}: {
  index: string
  id: string
  children: ReactNode
}) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs tracking-[0.08em] text-muted">{index}</span>
      <h2
        id={id}
        className="font-serif text-[2rem] leading-none font-[560] tracking-[-0.03em]"
      >
        {children}
      </h2>
    </div>
  )
}

function Work() {
  return (
    <section className="pt-10" id="work" aria-labelledby="work-heading">
      <SectionLabel index="01" id="work-heading">
        Work
      </SectionLabel>
      <ol className="list-none border-t border-ink p-0">
        {projects.map((project, index) => (
          <li key={project.href}>
            <ExternalLink
              className="group grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-4 border-b border-line px-3 py-5 no-underline hover:bg-[#e5f0ea] focus-visible:bg-[#e5f0ea] max-md:grid-cols-[2.5rem_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-2"
              href={project.href}
            >
              <span
                className="pt-1.5 font-mono text-xs tracking-[0.08em] text-pine-mid"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="text-[1.35rem] tracking-[-0.03em] transition-transform duration-150 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                  {project.name}
                </span>
                <span className="max-w-2xl text-muted">{project.summary}</span>
              </span>
              <span className="flex flex-col items-end gap-1 pt-1.5 font-mono text-xs tracking-[0.08em] text-muted max-md:col-start-2 max-md:flex-row max-md:items-center max-md:justify-start max-md:gap-3 max-md:pt-0">
                <span>{project.language}</span>
                <span>{project.year}</span>
              </span>
            </ExternalLink>
          </li>
        ))}
      </ol>
    </section>
  )
}

function About() {
  return (
    <section className="pt-10" id="about" aria-labelledby="about-heading">
      <SectionLabel index="02" id="about-heading">
        About
      </SectionLabel>
      <div className="flex max-w-xl flex-col gap-4">
        {site.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="pt-10" id="contact" aria-labelledby="contact-heading">
      <SectionLabel index="03" id="contact-heading">
        Contact
      </SectionLabel>
      <p className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-tight tracking-[-0.04em]">
        <ExternalLink
          className="underline decoration-mark decoration-[3px] underline-offset-[0.12em] hover:text-pine-mid"
          href={site.github}
        >
          {site.githubLabel}
        </ExternalLink>
      </p>
    </section>
  )
}

const copyrightYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="mt-16 border-t border-line py-5 pb-8 font-mono text-xs tracking-[0.06em] text-muted">
      <div className={`${frame} flex justify-between gap-4`}>
        <p>
          © {copyrightYear} {site.name}
        </p>
        <p>{site.location}</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <a
        className="absolute top-[-4rem] left-4 z-10 bg-mark px-3.5 py-2.5 text-ink no-underline focus:top-4"
        href="#content"
      >
        Skip to content
      </a>
      <Header />
      <main id="content" className="pb-16">
        <div className={frame}>
          <Hero />
          <Work />
          <About />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  )
}
