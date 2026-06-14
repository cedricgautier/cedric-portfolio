import { motion } from "framer-motion"

// Shared line-art butterfly — used both as a draggable object and as a large
// faint watermark (echoing Cédric's "when we…" playlist cover).
const BUTTERFLY_PATHS = (
  <>
    <path d="M16 8v15" />
    <path d="M16 10C13 3 3 4 4 11c1 6 9 6 12 1" />
    <path d="M16 10c3-7 13-6 12 1-1 6-9 6-12 1" />
    <path d="M16 16c-2 1-7 2-6 6 1 4 5 2 6-2" />
    <path d="M16 16c2 1 7 2 6 6-1 4-5 2-6-2" />
    <path d="M16 8l-3-3M16 8l3-3" />
  </>
)

const SVGS = {
  headphones: (
    <svg viewBox="0 0 32 32">
      <path d="M6 18v-2a10 10 0 0 1 20 0v2" />
      <rect x="3.5" y="17.5" width="5.5" height="9" rx="2.2" />
      <rect x="23" y="17.5" width="5.5" height="9" rx="2.2" />
    </svg>
  ),
  mountain: (
    <svg viewBox="0 0 32 32">
      <path d="M3 26 12 10l6 10 4-6 7 12z" />
      <path d="M9.5 15l2.5-5 2.5 4" />
    </svg>
  ),
  note: (
    <svg viewBox="0 0 32 32">
      <path d="M12 22V7l12-3v15" />
      <circle cx="9" cy="22" r="3.2" />
      <circle cx="21" cy="19" r="3.2" />
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 32 32">
      <path d="M7 13h16v5a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" />
      <path d="M23 14a4 4 0 0 1 0 8" />
      <path d="M11 6v3M16 5v4M21 6v3" />
    </svg>
  ),
  pick: (
    <svg viewBox="0 0 32 32">
      <path d="M16 5c8 0 11 6 8 14-2 6-6 9-8 9s-6-3-8-9C5 11 8 5 16 5z" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="6" />
      <path d="M16 3v3M16 26v3M3 16h3M26 16h3M7 7l2 2M23 23l2 2M25 7l-2 2M9 23l-2 2" />
    </svg>
  ),
  surf: (
    <svg viewBox="0 0 32 32">
      <path d="M8 24C2 14 14 2 24 8c6 10-6 22-16 16z" />
      <path d="M11 21 21 11" />
    </svg>
  ),
  martini: (
    <svg viewBox="0 0 32 32">
      <path d="M7 9h18L16 20zM16 20v6M11 26h10" />
      <circle cx="13.5" cy="13" r="1.3" />
    </svg>
  ),
  wine: (
    <svg viewBox="0 0 32 32">
      <path d="M10 5h12c0 7-3 11-6 11s-6-4-6-11z" />
      <path d="M16 16v9M12 25h8" />
    </svg>
  ),
  pineapple: (
    <svg viewBox="0 0 32 32">
      <path d="M16 11c-5 0-7 4-7 9s3 8 7 8 7-3 7-8-2-9-7-9z" />
      <path d="M16 11V5M16 7l-4-3M16 7l4-3M11 17l10 5M21 17l-10 5" />
    </svg>
  ),
  vinyl: (
    <svg viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="13" />
      <circle cx="16" cy="16" r="4" />
      <circle cx="16" cy="16" r="1" />
    </svg>
  ),
  butterfly: <svg viewBox="0 0 32 32">{BUTTERFLY_PATHS}</svg>,
}

export function Obj({ icon, am, style, delay = 0, rot = 0 }) {
  return (
    <motion.div
      className={"obj" + (am ? " am" : "")}
      style={style}
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.12, cursor: "grabbing" }}
      initial={{ rotate: rot }}
      animate={{ y: [0, -14, 0], rotate: [rot, rot + 4, rot] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {SVGS[icon]}
    </motion.div>
  )
}

// Large, static, non-interactive butterfly watermark.
export function BflyMark({ className = "", style }) {
  return (
    <svg className={"bfly-mark " + className} style={style} viewBox="0 0 32 32" aria-hidden="true">
      {BUTTERFLY_PATHS}
    </svg>
  )
}
