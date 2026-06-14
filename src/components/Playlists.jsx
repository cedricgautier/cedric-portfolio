import { motion } from "framer-motion"

// Official Spotify playlist embeds. Each item: { id, title }.
// `id` is the part after /playlist/ in a Spotify URL, e.g.
//   https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M  ->  37i9dQZF1DXcBWIGoYBM5M
// Renders nothing until at least one real id is provided, so it never shows a
// broken player.
const Playlists = ({ items = [], reveal }) => {
  const playable = items.filter((p) => p.id)
  if (playable.length === 0) return null

  return (
    <motion.div className="playlists" {...reveal}>
      <p className="np">Press play — a few of the chapters</p>
      <div className="playlist-grid">
        {playable.map((p) => (
          <iframe
            key={p.id}
            className="playlist-embed"
            src={`https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator&theme=0`}
            title={p.title || "Spotify playlist"}
            width="100%"
            height="152"
            frameBorder="0"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ))}
      </div>
    </motion.div>
  )
}

export default Playlists
