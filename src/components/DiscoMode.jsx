import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

// The secret handshake. Classic Konami code → disco mode.
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]
// How long the party lasts before it dissolves on its own.
const PARTY_MS = 5200
// Anything on the page can throw this to start the party (the hidden rpm tap,
// the terminal's `disco` command…), so the trigger isn't tied to a keyboard.
export const DISCO_EVENT = "cg:disco"

// A purely-visual disco overlay — no audio (browser autoplay + copyright rules),
// and no ABBA lyrics, just the lights. Reduced-motion gets a calm, non-strobing
// version via CSS. Opt-in only: it never fires without a deliberate gesture.
const DiscoMode = () => {
  const [live, setLive] = useState(false)

  const start = useCallback(() => setLive(true), [])
  const stop = useCallback(() => setLive(false), [])

  // Listen for the Konami sequence and the manual trigger event.
  useEffect(() => {
    let progress = 0
    const onKey = (event) => {
      const pressed = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const matches = pressed === KONAMI[progress]
      progress = matches ? progress + 1 : pressed === KONAMI[0] ? 1 : 0
      if (progress === KONAMI.length) {
        progress = 0
        start()
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener(DISCO_EVENT, start)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(DISCO_EVENT, start)
    }
  }, [start])

  // Auto-dismiss after the party runs its course.
  useEffect(() => {
    if (!live) return undefined
    const id = setTimeout(stop, PARTY_MS)
    return () => clearTimeout(id)
  }, [live, stop])

  return (
    <AnimatePresence>
      {live && (
        <motion.div
          className="disco"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={stop}
        >
          <div className="disco-beams" />
          <div className="disco-lights" />
          <motion.div
            className="disco-ball"
            initial={{ y: -60, scale: 0.5, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 9 }}
          >
            🪩
          </motion.div>
          <motion.p
            className="disco-text"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 150, damping: 12 }}
          >
            Disco mode
          </motion.p>
          <p className="disco-sub">the floor is yours · tap to exit</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DiscoMode
