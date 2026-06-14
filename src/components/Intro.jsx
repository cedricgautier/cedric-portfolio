import { motion } from "framer-motion"
import { BflyMark } from "./Scatter.jsx"

const TITLE = ["Cédric", "Gautier"]

// Faint topographic lines — the same mountain grounding the page uses.
const INTRO_CONTOURS = [
  "M0,140 C220,90 430,200 640,145 S1010,80 1200,145",
  "M0,300 C240,245 440,355 660,300 S1030,240 1200,305",
  "M0,460 C220,405 450,515 660,460 S1040,400 1200,465",
]

export default function Intro({ entering, onSkip }) {
  return (
    <motion.div
      className="intro"
      role="button"
      tabIndex={0}
      onClick={onSkip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSkip()
        }
      }}
      aria-label="Skip the intro"
      initial={{ opacity: 1 }}
      animate={{ opacity: entering ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut", delay: entering ? 0.7 : 0 }}
    >
      <svg className="intro-contours" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
        {INTRO_CONTOURS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
      <BflyMark className="intro-bfly" />

      {/* The wow: a staggered, masked title reveal with a light sweep. */}
      <motion.div
        className="intro-title"
        animate={entering ? { opacity: 0, scale: 1.06, filter: "blur(6px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: entering ? 0.5 : 0.4, ease: "easeOut" }}
      >
        <motion.p className="intro-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          Security Engineer · Curator · Builder
        </motion.p>

        <h1 className="intro-name">
          {TITLE.map((word, wi) => (
            <span className={"intro-line" + (wi === 1 ? " it" : "")} key={word}>
              <motion.span
                className="intro-line-inner"
                initial={{ y: "115%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.35 + wi * 0.16, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p className="intro-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15, duration: 0.7 }}>
          a life, scored · things that last
        </motion.p>
      </motion.div>

      {/* Green burst — blooms from the centre of the screen and fills the page. */}
      <motion.div
        className="intro-flash"
        aria-hidden="true"
        initial={{ scale: 0 }}
        animate={entering ? { scale: 4.6 } : { scale: 0 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
      />

      <motion.span className="intro-skip" initial={{ opacity: 0 }} animate={{ opacity: entering ? 0 : 0.6 }} transition={{ delay: 1.7, duration: 0.6 }}>
        skip ↵
      </motion.span>
    </motion.div>
  )
}
