// stats.fm client — called straight from the browser (the API sends
// `Access-Control-Allow-Origin: *`), so the site needs no backend, no secrets,
// and there's no endpoint of ours to rate-limit or pay for. stats.fm reads
// Cédric's Spotify and exposes it publicly per his profile privacy settings.

const BASE_URL = "https://api.stats.fm/api/v1"
const STATSFM_USER = import.meta.env.VITE_STATSFM_USER || "cedric.gautier"

const getJson = async (path) => {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) throw new Error(`stats.fm ${path} failed: ${response.status}`)
  return response.json()
}

const getUserJson = (path) => getJson(`/users/${STATSFM_USER}${path}`)

// Defensive: stats.fm is third-party data. A Spotify id is always alphanumeric,
// so reject anything else rather than interpolate it into a URL/embed. Returns
// undefined for anything that isn't a clean id.
const toSpotifyTrackId = (track) => {
  const spotifyId = track?.externalIds?.spotify?.[0]
  return typeof spotifyId === "string" && /^[A-Za-z0-9]+$/.test(spotifyId) ? spotifyId : undefined
}

// Only trust https image URLs (album art is rendered as <img src>).
const toHttpsImage = (url) => (typeof url === "string" && url.startsWith("https://") ? url : "")

const toTrack = (item) => {
  const track = item?.track
  if (!track) return null
  const spotifyId = toSpotifyTrackId(track)
  return {
    isPlaying: item.isPlaying === true,
    title: track.name,
    artist: (track.artists ?? []).map((artist) => artist.name).join(", "),
    durationMs: typeof track.durationMs === "number" ? track.durationMs : undefined,
    albumImageUrl: toHttpsImage(track.albums?.[0]?.image),
    spotifyId,
    songUrl: spotifyId ? `https://open.spotify.com/track/${spotifyId}` : undefined,
  }
}

const RECENT_LIMIT = 3

// Cédric's listening state: whether something is playing right now, plus his
// last few tracks. When live, the current track leads the list (de-duped); when
// idle, it's just the recent history — so the widget always shows real data.
export const fetchListening = async () => {
  const current = toTrack((await getUserJson("/streams/current")).item)
  const recent = await getUserJson(`/streams/recent?limit=${RECENT_LIMIT}`)
  const recentTracks = (recent.items ?? []).map(toTrack).filter(Boolean)
  const isLive = current?.isPlaying === true
  const ordered = isLive ? [current, ...recentTracks.filter((track) => track.spotifyId !== current.spotifyId)] : recentTracks
  return { isLive, tracks: ordered.slice(0, RECENT_LIMIT) }
}

// Top artist names for a range: "weeks" | "months" | "lifetime".
export const fetchTopArtists = async (range, limit = 5) => {
  const data = await getUserJson(`/top/artists?range=${range}&limit=${limit}`)
  return (data.items ?? []).map((entry) => entry.artist?.name).filter(Boolean)
}
