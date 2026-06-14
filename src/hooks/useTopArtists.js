import { useEffect, useState } from "react"
import { fetchTopArtists } from "../lib/statsfm.js"

const EMPTY = { now: [], allTime: [] }

// Cédric's top artists from stats.fm (browser-direct, no backend): `now` (last
// ~months) and `allTime` (lifetime — the constants). Returns empty arrays until
// the API answers, so the timeline keeps its static fallback and a network
// hiccup never breaks the page.
export const useTopArtists = () => {
  const [topArtists, setTopArtists] = useState(EMPTY)

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        const [now, allTime] = await Promise.all([fetchTopArtists("months"), fetchTopArtists("lifetime")])
        if (isActive) setTopArtists({ now, allTime })
      } catch {
        // Fail soft: keep the static per-era soundtrack already on the page.
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [])

  return topArtists
}
