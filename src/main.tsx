import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import "@fontsource-variable/fraunces"
import "@fontsource-variable/outfit"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "@fontsource/ibm-plex-mono/latin-500.css"
import "./index.css"
import App from "./App.tsx"

document.documentElement.classList.toggle(
  "motion",
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
