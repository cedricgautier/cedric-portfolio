import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // Custom domain (haluhalo.fr) serves from the root, so assets live at "/".
  // (Was "/cedric-portfolio/" for the github.io project-page URL.)
  base: "/",
  plugins: [react(), tailwindcss()],
})
