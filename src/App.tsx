import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { Link, NavLink, Route, Routes, useLocation } from "react-router"
import { BlogIndex, BlogPost, NotFound } from "./Blog.tsx"
import { experience, marks, menuProjects, projects, site } from "./content.ts"
import { frame } from "./frame.ts"
import { usePageMeta } from "./page-meta.ts"

const sections = [
  ["Experience", "experience"],
  ["Work", "work"],
  ["About", "about"],
  ["Contact", "contact"],
] as const

const navLinkClass =
  "relative inline-flex min-h-11 items-center px-3 text-[0.95rem] no-underline hover:text-mark focus-visible:outline-mark after:absolute after:bottom-2 after:left-3 after:h-0.5 after:w-[calc(100%-1.5rem)] after:origin-left after:scale-x-0 after:bg-mark after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const MotionContext = createContext(true)

function useMotion() {
  return useContext(MotionContext)
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  return reduced
}

function useInView<T extends HTMLElement>() {
  const motion = useMotion()
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!motion) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px 12% 0px", threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [motion])

  return { ref, shown: motion ? shown : true }
}

function revealClass(shown: boolean, className?: string) {
  return ["reveal", shown ? "is-in" : "", className].filter(Boolean).join(" ")
}

function formatMonth(iso: string) {
  const [year, month] = iso.split("-")
  return `${MONTHS[Number(month) - 1]} ${year}`
}

// Count the start and end months, so a span reads the way a résumé does.
function formatTenure(start: string, end: string | null, now = new Date()) {
  const [startYear, startMonth] = start.split("-").map(Number)
  const endYear = end ? Number(end.slice(0, 4)) : now.getFullYear()
  const endMonth = end ? Number(end.slice(5, 7)) : now.getMonth() + 1
  const total = (endYear - startYear!) * 12 + (endMonth - startMonth!) + 1
  const years = Math.floor(total / 12)
  const months = total % 12
  const parts: string[] = []
  if (years === 1) parts.push("1 yr")
  else if (years > 1) parts.push(`${years} yrs`)
  if (months === 1) parts.push("1 mo")
  else if (months > 1) parts.push(`${months} mos`)
  return parts.join(" ") || "1 mo"
}

function useCount(from: number, to: number, run: boolean) {
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (!run) return

    const duration = 850
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(from + (to - from) * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [from, to, run])

  return run ? value : to
}

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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`size-2.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2.25 4.4 6 8.05 9.75 4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  )
}

function ProjectsMenu() {
  const location = useLocation()
  const place = `${location.pathname}${location.hash}`
  const [openPlace, setOpenPlace] = useState<string | null>(null)
  if (openPlace !== null && openPlace !== place) setOpenPlace(null)
  const open = openPlace === place
  const setOpen = (next: boolean) => setOpenPlace(next ? place : null)
  const rootRef = useRef<HTMLLIElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const pendingFocus = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!open || pendingFocus.current === null) return
    const index = pendingFocus.current
    pendingFocus.current = null
    itemRefs.current[index]?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenPlace(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpenPlace(null)
      buttonRef.current?.focus()
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  if (menuProjects.length === 0) return null

  const focusItem = (index: number) => {
    const count = menuProjects.length
    itemRefs.current[(index + count) % count]?.focus()
  }

  return (
    <li
      ref={rootRef}
      className="flex items-center md:relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`${navLinkClass} gap-1.5 data-[open]:text-mark data-[open]:after:scale-x-100`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="projects-menu"
        data-open={open ? "" : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
          event.preventDefault()
          const index = event.key === "ArrowDown" ? 0 : menuProjects.length - 1
          if (open) focusItem(index)
          else {
            pendingFocus.current = index
            setOpen(true)
          }
        }}
      >
        Projects
        <Chevron open={open} />
      </button>
      <ul
        id="projects-menu"
        role="menu"
        aria-label="Projects"
        hidden={!open}
        className="absolute top-[calc(100%+4px)] left-0 z-30 m-0 w-max max-w-[calc(100vw-2rem)] min-w-56 list-none bg-paper p-1.5 text-ink shadow-[0_18px_40px_-18px_rgba(26,24,20,0.45)] max-md:right-4 max-md:left-4 max-md:w-auto max-md:max-w-none max-md:min-w-0"
      >
        {menuProjects.map((project, index) => (
          <li key={project.href} role="none">
            <a
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              role="menuitem"
              tabIndex={-1}
              href={project.href}
              className="flex min-h-11 items-center px-3 text-[0.95rem] text-ink no-underline hover:bg-mark focus-visible:bg-mark focus-visible:outline-pine"
              onClick={() => setOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  focusItem(index + 1)
                } else if (event.key === "ArrowUp") {
                  event.preventDefault()
                  focusItem(index - 1)
                } else if (event.key === "Home") {
                  event.preventDefault()
                  focusItem(0)
                } else if (event.key === "End") {
                  event.preventDefault()
                  focusItem(menuProjects.length - 1)
                } else if (event.key === "Tab") {
                  setOpen(false)
                }
              }}
            >
              {project.name}
            </a>
          </li>
        ))}
      </ul>
    </li>
  )
}

function Header() {
  return (
    <header className="relative z-20 border-b-4 border-mark bg-pine text-paper" id="top">
      <div className={`${frame} flex min-h-[4.75rem] flex-wrap items-center gap-x-6 gap-y-1 max-md:py-3`}>
        <Link
          className="font-[580] tracking-[-0.03em] text-paper no-underline hover:text-mark"
          to="/"
        >
          {site.name}
        </Link>
        <nav aria-label="Sections" className="self-stretch max-md:w-full">
          <ul className="flex h-full list-none flex-wrap items-stretch gap-1 p-0 max-md:-ml-3">
            {sections.map(([label, id]) => (
              <Fragment key={id}>
                <li className="flex items-center">
                  <Link className={navLinkClass} to={{ pathname: "/", hash: `#${id}` }}>
                    {label}
                  </Link>
                </li>
                {id === "work" ? <ProjectsMenu /> : null}
              </Fragment>
            ))}
            <li className="flex items-center">
              <NavLink
                className={({ isActive }) => `${navLinkClass}${isActive ? " text-mark" : ""}`}
                to="/blog"
              >
                Blog
              </NavLink>
            </li>
          </ul>
        </nav>
        <p className="ml-auto font-mono text-[0.78rem] tracking-[0.12em] uppercase tabular-nums whitespace-nowrap max-md:ml-0">
          {site.location}
          <span aria-hidden="true"> · </span>
          <ChicagoClock />
        </p>
      </div>
    </header>
  )
}

function ChicagoClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
  }).format(now)

  return (
    <time dateTime={now.toISOString()} aria-label={`${time} Central Time`}>
      {time}
    </time>
  )
}

function Marks({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      <span className="float-b absolute top-0 left-0 block h-24 w-3 bg-mark" />
      <span className="float-a absolute top-0 left-6 block h-14 w-14 bg-pine" />
      <span className="float-c absolute top-20 left-6 block h-2.5 w-14 bg-ink" />
      <span className="float-c absolute top-25 left-6 block h-2.5 w-9 bg-pine-mid" />
    </div>
  )
}

function SinceYear() {
  const motion = useMotion()
  const year = Number(site.since)
  return useCount(2000, year, motion)
}

function ScrollToPlace() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function Hero() {
  return (
    <section className="grid pt-18 pb-12 xl:grid-cols-[minmax(0,1fr)_13.5rem] xl:gap-8 max-md:pt-11" aria-labelledby="intro-heading">
      <div>
        <div aria-hidden="true" className="relative mb-8 ml-auto h-14 w-32 xl:hidden">
          <span className="float-b absolute bottom-0 left-0 block h-12 w-2.5 bg-mark" />
          <span className="float-a absolute bottom-0 left-5 block h-9 w-9 bg-pine" />
          <span className="float-c absolute bottom-1 left-16 block h-2.5 w-12 bg-ink" />
        </div>
        <p
          className="rise font-mono text-[0.78rem] tracking-[0.14em] text-pine-mid uppercase"
          style={{ animationDelay: "0.04s" }}
        >
          {site.role}
          <span aria-hidden="true"> · </span>
          <span>since {site.since}</span>
        </p>
        <h1
          id="intro-heading"
          className="mt-3 flex flex-col font-serif text-[clamp(5.25rem,16vw,10.5rem)] leading-[0.78] font-[560] tracking-[-0.055em]"
        >
          <span className="rise" style={{ animationDelay: "0.12s" }}>
            Ben
          </span>
          <span
            className="rise relative z-0 self-start text-pine"
            style={{ animationDelay: "0.22s" }}
          >
            Cully
            <span className="mark-swipe" aria-hidden="true" />
          </span>
        </h1>
        <p className="rise mt-7 max-w-xl text-[1.35rem] leading-[1.45]" style={{ animationDelay: "0.38s" }}>
          {site.lede}
        </p>
        <dl
          className="rise mt-9 grid grid-cols-[repeat(3,max-content)] gap-8 border-t border-line pt-5 max-md:grid-cols-1 max-md:gap-4"
          style={{ animationDelay: "0.52s" }}
        >
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
            <dd className="mt-1 text-[1.05rem]">
              <SinceYear />
            </dd>
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
      </div>
      <Marks className="relative mt-16 ml-auto hidden h-36 w-28 self-start xl:block" />
    </section>
  )
}

function Ticker() {
  const motion = useMotion()

  if (!motion) {
    return (
      <div className="border-y border-pine bg-pine text-paper">
        <ul
          className={`${frame} flex list-none flex-wrap gap-x-5 gap-y-2 py-3 font-mono text-[0.72rem] tracking-[0.14em] uppercase`}
        >
          {marks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )
  }

  const loop = [...marks, ...marks]

  return (
    <div className="ticker overflow-hidden border-y border-pine bg-pine text-paper" aria-hidden="true">
      <div className="ticker-track flex w-max items-center gap-6 py-3 font-mono text-[0.72rem] tracking-[0.14em] uppercase">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-6 whitespace-nowrap">
            {item}
            <span className="inline-block size-1.5 shrink-0 bg-mark" />
          </span>
        ))}
      </div>
    </div>
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
  const { ref, shown } = useInView<HTMLDivElement>()

  return (
    <div ref={ref} className={revealClass(shown, "mb-4 flex items-baseline gap-3")}>
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

function ExperienceItem({
  role,
  index,
}: {
  role: (typeof experience)[number]
  index: number
}) {
  const { ref, shown } = useInView<HTMLLIElement>()
  const last = index === experience.length - 1
  const line =
    last
      ? "top-0 h-7"
      : index === 0
        ? "top-7 bottom-0"
        : "inset-y-0"

  return (
    <li ref={ref} className={revealClass(shown, "grid grid-cols-[1.5rem_minmax(0,1fr)]")}>
      <div aria-hidden="true" className="relative">
        <span className={`absolute left-1/2 w-0.5 -translate-x-1/2 bg-pine ${line}`} />
        <span className="absolute top-7 left-1/2 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pine ring-4 ring-paper" />
      </div>
      <article
        className={`role border-b border-b-line border-l-4 py-6 pr-2 pl-3 transition-colors duration-200 hover:bg-[#e5f0ea] motion-reduce:transition-none md:pl-5 ${
          role.end === null ? "border-l-mark" : "border-l-transparent"
        }`}
      >
        <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs tracking-[0.08em] text-pine-mid">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="role-name font-serif text-[1.7rem] leading-none font-[560] tracking-[-0.03em]">
                {role.role}
              </h3>
            </div>
            <p className="mt-2 flex items-center gap-2.5 text-[1.05rem]">
              <img alt="" className="h-8 w-auto max-w-40 shrink-0 object-contain object-left" src={role.icon} />
              <span>
                {role.org}
                {role.employment ? <span className="text-muted"> · {role.employment}</span> : null}
              </span>
            </p>
          </div>
          <p className="font-mono text-[0.75rem] leading-relaxed text-muted md:text-right">
            <time dateTime={role.start}>{formatMonth(role.start)}</time>
            <span aria-hidden="true"> – </span>
            {role.end ? (
              <time dateTime={role.end}>{formatMonth(role.end)}</time>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-mark px-1.5 py-0.5 align-middle text-[0.68rem] tracking-[0.12em] text-ink uppercase">
                <span className="pulse-dot size-1.5 rounded-full bg-ink" aria-hidden="true" />
                Present
              </span>
            )}
            <span className="mt-1 block tracking-normal">
              {formatTenure(role.start, role.end)}
              <span aria-hidden="true"> · </span>
              {role.place}
            </span>
          </p>
        </div>
        {role.summary ? <p className="mt-4 max-w-2xl text-pretty text-muted">{role.summary}</p> : null}
        {role.points.length > 0 ? (
          <ul className="mt-4 flex max-w-2xl list-none flex-col gap-2 p-0">
            {role.points.map((point) => (
              <li key={point} className="grid grid-cols-[0.7rem_minmax(0,1fr)] gap-2">
                <span className="mt-[0.55em] size-1.5 bg-mark" aria-hidden="true" />
                <span className="text-pretty">{point}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {role.skills.length > 0 ? (
          <ul className="mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="Tools">
            {role.skills.map((skill) => (
              <li key={skill}>
                <span className="inline-block border border-line px-2 py-1 font-mono text-[0.72rem] tracking-[0.06em] text-pine-mid uppercase transition duration-200 hover:-translate-y-0.5 hover:rotate-[-2deg] hover:border-ink hover:bg-mark hover:text-ink motion-reduce:transition-none motion-reduce:hover:translate-none motion-reduce:hover:rotate-0">
                  {skill}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </li>
  )
}

function Experience() {
  return (
    <section className="mt-14 scroll-mt-8" id="experience" aria-labelledby="experience-heading">
      <SectionLabel index="01" id="experience-heading">
        Experience
      </SectionLabel>
      <ol className="list-none border-t border-ink p-0">
        {experience.map((role, index) => (
          <ExperienceItem key={role.org} role={role} index={index} />
        ))}
      </ol>
    </section>
  )
}

function ProjectLink({
  project,
  index,
}: {
  project: (typeof projects)[number]
  index: number
}) {
  const { ref, shown } = useInView<HTMLLIElement>()

  const className =
    "group grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-4 border-b border-line px-3 py-5 no-underline hover:bg-[#e5f0ea] focus-visible:bg-[#e5f0ea] max-md:grid-cols-[2.5rem_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-2"
  const body = (
    <>
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
    </>
  )

  return (
    <li ref={ref} className={revealClass(shown)}>
      {project.href.startsWith("/") ? (
        <a className={className} href={project.href}>
          {body}
        </a>
      ) : (
        <ExternalLink className={className} href={project.href}>
          {body}
        </ExternalLink>
      )}
    </li>
  )
}

function Work() {
  return (
    <section className="scroll-mt-8 pt-14" id="work" aria-labelledby="work-heading">
      <SectionLabel index="02" id="work-heading">
        Work
      </SectionLabel>
      <ol className="list-none border-t border-ink p-0">
        {projects.map((project, index) => (
          <ProjectLink key={project.href} project={project} index={index} />
        ))}
      </ol>
    </section>
  )
}

function About() {
  return (
    <section className="scroll-mt-8 pt-14" id="about" aria-labelledby="about-heading">
      <SectionLabel index="03" id="about-heading">
        About
      </SectionLabel>
      <div className="grid items-start gap-6 sm:grid-cols-[10.5rem_minmax(0,36rem)] sm:gap-x-10">
        <Portrait />
        <div className="flex flex-col gap-4">
          {site.about.map((paragraph) => (
            <AboutParagraph key={paragraph}>{paragraph}</AboutParagraph>
          ))}
        </div>
      </div>
    </section>
  )
}

function Portrait() {
  const { ref, shown } = useInView<HTMLElement>()

  return (
    <figure ref={ref} className={revealClass(shown, "relative w-36 sm:w-auto")}>
      <span className="absolute top-2.5 left-2.5 h-full w-full bg-mark" aria-hidden="true" />
      <img
        className="relative aspect-square w-full object-cover"
        src={site.portrait}
        alt="Portrait of Ben Cully"
        width={299}
        height={299}
      />
    </figure>
  )
}

function AboutParagraph({ children }: { children: string }) {
  const { ref, shown } = useInView<HTMLParagraphElement>()

  return (
    <p ref={ref} className={revealClass(shown)}>
      {children}
    </p>
  )
}

function Contact() {
  const { ref, shown } = useInView<HTMLDivElement>()

  return (
    <section className="scroll-mt-8 pt-14" id="contact" aria-labelledby="contact-heading">
      <SectionLabel index="04" id="contact-heading">
        Contact
      </SectionLabel>
      <div
        ref={ref}
        className={revealClass(
          shown,
          "flex max-w-3xl flex-col gap-3 font-serif text-[clamp(1.8rem,4vw,3rem)] leading-tight tracking-[-0.04em]",
        )}
      >
        <p>
          <ExternalLink
            className="link-fill underline decoration-mark decoration-[3px] underline-offset-[0.12em] hover:text-ink"
            href={site.github}
          >
            {site.githubLabel}
          </ExternalLink>
        </p>
        <p>
          <ExternalLink
            className="link-fill underline decoration-mark decoration-[3px] underline-offset-[0.12em] hover:text-ink"
            href={site.linkedin}
          >
            {site.linkedinLabel}
          </ExternalLink>
        </p>
      </div>
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

function HomePage() {
  usePageMeta("Ben Cully — Software developer", "/")

  return (
    <>
      <div className={frame}>
        <Hero />
      </div>
      <Ticker />
      <div className={frame}>
        <Experience />
        <Work />
        <About />
        <Contact />
      </div>
    </>
  )
}

export default function App() {
  const reduced = useReducedMotion()

  useEffect(() => {
    document.documentElement.classList.toggle("motion", !reduced)
  }, [reduced])

  return (
    <MotionContext value={!reduced}>
      <ScrollToPlace />
      <a
        className="absolute top-[-4rem] left-4 z-50 bg-mark px-3.5 py-2.5 text-ink no-underline focus:top-4"
        href="#content"
      >
        Skip to content
      </a>
      <Header />
      <main id="content" className="pb-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </MotionContext>
  )
}
