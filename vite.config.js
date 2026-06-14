import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // Project-page deploy: served from https://cedricgautier.github.io/cedric-portfolio/
  base: "/cedric-portfolio/",
  plugins: [react(), tailwindcss()],
})
