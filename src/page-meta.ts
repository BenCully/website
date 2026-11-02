import { useEffect } from "react"
import { site } from "./content.ts"

const defaultTitle = "Ben Cully — Software developer"

export function usePageMeta(title: string, path: string) {
  useEffect(() => {
    document.title = title
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const previous = canonical?.getAttribute("href")
    if (canonical) canonical.href = new URL(path, site.url).href

    return () => {
      document.title = defaultTitle
      if (canonical && previous) canonical.href = previous
    }
  }, [title, path])
}
