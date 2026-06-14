import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

// The passions, told as bubbles: a row of category bubbles; tap one and its tags
// bloom in as a cluster of smaller bubbles below. One category open at a time so
// the section stays calm and readable.
const Passions = ({ groups }) => {
  const reducedMotion = prefersReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeTitle, activeItems] = groups[activeIndex] ?? ["", []]

  return (
    <div className="bubbles">
      <div className="bubble-cats" role="tablist" aria-label="Things I love">
        {groups.map(([title], index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={title}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`bubble-cat${isActive ? " on" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              {title}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={activeTitle}
          className="bubble-items"
          aria-live="polite"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeItems.map((item, index) => (
            <motion.li
              key={item}
              className="bubble-item"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 20, delay: reducedMotion ? 0 : index * 0.04 }}
            >
              {item}
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  )
}

export default Passions
