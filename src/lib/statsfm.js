// stats.fm client — called straight from the browser (the API sends
// `Access-Control-Allow-Origin: *`), so the site needs no backend, no secrets,
// and there's no endpoint of ours to rate-limit or pay for. stats.fm reads
// Cédric's Spotify and exposes it publicly per his profile privacy settings.

const BASE_URL = "https://api.stats.fm/api/v1"
const STATSFM_USER = import.meta.env.VITE_STATSFM_USER || "cedric.gautier"

const getUserJson = async (path) => {
  const response = await fetch(`${BASE_URL}/users/${STATSFM_USER}${path}`)
  if (!response.ok) throw new Error(`stats.fm ${path} failed: ${response.status}`)
  return response.json()
}

// Defensive: stats.fm is third-party data. A Spotify id is always alphanumeric,
// so reject anything else rather than interpolate it into a URL. The scheme is
// hard-coded https, so a malicious scheme can never reach the href.
const toSpotifyTrackUrl = (track) => {
  const spotifyId = track?.externalIds?.spotify?.[0]
  return typeof spotifyId === "string" && /^[A-Za-z0-9]+$/.test(spotifyId) ? `https://open.spotify.com/track/${spotifyId}` : undefined
}

// Only trust https image URLs (album art is rendered as <img src>).
const toHttpsImage = (url) => (typeof url === "string" && url.startsWith("https://") ? url : "")

const toTrack = (item) => {
  const track = item?.track
  if (!track) return null
  return {
    isPlaying: item.isPlaying === true,
    title: track.name,
    artist: (track.artists ?? []).map((artist) => artist.name).join(", "),
    albumImageUrl: toHttpsImage(track.albums?.[0]?.image),
    songUrl: toSpotifyTrackUrl(track),
  }
}

// What Cédric is playing right now — or null if nothing is currently playing.
export const fetchCurrentTrack = async () => {
  const data = await getUserJson("/streams/current")
  const currentTrack = toTrack(data.item)
  return currentTrack && currentTrack.isPlaying ? currentTrack : null
}

// Top artist names for a range: "weeks" | "months" | "lifetime".
export const fetchTopArtists = async (range, limit = 5) => {
  const data = await getUserJson(`/top/artists?range=${range}&limit=${limit}`)
  return (data.items ?? []).map((entry) => entry.artist?.name).filter(Boolean)
}
