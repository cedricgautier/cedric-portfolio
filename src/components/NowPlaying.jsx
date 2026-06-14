import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { fetchCurrentTrack } from "../lib/statsfm.js"

const POLL_INTERVAL_MS = 60000

// Live "now playing" from Cédric's Spotify (via stats.fm, browser-direct).
// Renders nothing until something is actually playing, so it never shows a
// broken or empty state — the embedded player below stays the fallback.
const NowPlaying = () => {
  const [currentTrack, setCurrentTrack] = useState(null)

  useEffect(() => {
    let isActive = true
    let pollId = null

    const refreshCurrentTrack = async () => {
      try {
        const track = await fetchCurrentTrack()
        if (isActive) setCurrentTrack(track)
      } catch {
        // Background poll: a network hiccup must never break the page, so we
        // intentionally keep the last known track rather than propagating.
      }
    }

    // Only poll while the tab is visible — a backgrounded/forgotten tab must not
    // keep hitting the Edge Function. Resume (and refresh once) when it returns.
    const startPolling = () => {
      if (pollId) return
      refreshCurrentTrack()
      pollId = setInterval(refreshCurrentTrack, POLL_INTERVAL_MS)
    }
    const stopPolling = () => {
      if (pollId) {
        clearInterval(pollId)
        pollId = null
      }
    }
    const onVisibility = () => (document.hidden ? stopPolling() : startPolling())

    if (!document.hidden) startPolling()
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      isActive = false
      stopPolling()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.a
          className="liveplaying"
          href={currentTrack.songUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          {currentTrack.albumImageUrl && <img src={currentTrack.albumImageUrl} alt="" className="lp-art" />}
          <span className="lp-text">
            <span className="lp-eq" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="lp-now">Live on Spotify now</span>
            <span className="lp-title">{currentTrack.title}</span>
            <span className="lp-artist">{currentTrack.artist}</span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

export default NowPlaying
