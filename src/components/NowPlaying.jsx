import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { fetchListening } from "../lib/statsfm.js"

const POLL_INTERVAL_MS = 60000

// ms → "m:ss" (track length, as Spotify shows it).
const formatDuration = (ms) => {
  if (typeof ms !== "number") return ""
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

// Live "now playing" from Cédric's Spotify (via stats.fm, browser-direct). Shows
// a status (listening now vs idle) and his last few tracks. When live, the first
// row is the current track with an animated equalizer.
const NowPlaying = () => {
  const [state, setState] = useState({ isLive: false, tracks: [] })

  useEffect(() => {
    let isActive = true
    let pollId = null

    const refresh = async () => {
      try {
        const next = await fetchListening()
        if (isActive) setState(next)
      } catch {
        // Background poll: a network hiccup must never break the page, so we
        // intentionally keep the last known state rather than propagating.
      }
    }

    // Only poll while the tab is visible — a backgrounded tab must not keep
    // hitting the API. Resume (and refresh once) when it returns.
    const startPolling = () => {
      if (pollId) return
      refresh()
      pollId = setInterval(refresh, POLL_INTERVAL_MS)
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

  const { isLive, tracks } = state
  if (!tracks.length) return null

  return (
    <div className="np-live">
      <p className={`np-status${isLive ? " on" : ""}`}>
        {isLive ? (
          <span className="lp-eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <span className="np-dot" aria-hidden="true" />
        )}
        {isLive ? "Listening right now" : "Not listening right now"}
      </p>

      <ul className="np-list">
        <AnimatePresence initial={false}>
          {tracks.map((track, index) => (
            <motion.li
              key={`${track.spotifyId || track.title}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <a className="np-row" href={track.songUrl || undefined} target="_blank" rel="noopener noreferrer">
                {track.albumImageUrl && <img src={track.albumImageUrl} alt="" className="np-art" />}
                <span className="np-meta">
                  <span className="np-title">{track.title}</span>
                  <span className="np-sub">
                    <span className="np-artist">{track.artist}</span>
                    {track.durationMs != null && <span className="np-duration">{formatDuration(track.durationMs)}</span>}
                  </span>
                </span>
                {isLive && index === 0 && <span className="np-tag">now</span>}
              </a>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

export default NowPlaying
