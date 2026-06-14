import { expect, test } from "@playwright/test"

// Resource-load failures (a missing favicon, external fonts, the Spotify iframe,
// the stats.fm poll) are environmental and flaky in CI — they are not app
// crashes. We only care about uncaught exceptions and genuine app console errors,
// which is exactly the class of bug that once blanked the whole page (a component
// rendering an un-imported `AnimatePresence`).
const isResourceNoise = (text) => text.includes("Failed to load resource")

test("home page loads with no console errors or uncaught exceptions", async ({ page }) => {
  const errors = []

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))
  page.on("console", (message) => {
    const isAppError = message.type() === "error" && !isResourceNoise(message.text())
    if (isAppError) errors.push(`console.error: ${message.text()}`)
  })

  await page.goto("/")

  // The intro auto-dissolves into the hero. Waiting for the hero headline proves
  // the full tree mounted — including the deep sections that crashed before.
  await expect(page.locator("h1.name")).toBeVisible({ timeout: 15_000 })

  // Let deferred effects (framer-motion mounts, the now-playing poll) settle.
  await page.waitForTimeout(1_000)

  expect(errors, `Unexpected page errors:\n${errors.join("\n")}`).toEqual([])
})
