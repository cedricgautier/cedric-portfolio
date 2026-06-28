import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// CSP in a meta tag (GitHub Pages can't set headers), build-only — a strict
// script-src would block Vite's inline dev preamble (blank page in Safari).
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.stats.fm",
  "frame-src https://open.spotify.com",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

const cspMetaPlugin = {
  name: "csp-meta",
  apply: "build",
  transformIndexHtml: () => [
    {
      tag: "meta",
      attrs: { "http-equiv": "Content-Security-Policy", content: CONTENT_SECURITY_POLICY },
      injectTo: "head-prepend",
    },
  ],
}

export default defineConfig({
  // Custom domain (haluhalo.fr) serves from the root, so assets live at "/".
  // (Was "/cedric-portfolio/" for the github.io project-page URL.)
  base: "/",
  plugins: [react(), tailwindcss(), cspMetaPlugin],
})
