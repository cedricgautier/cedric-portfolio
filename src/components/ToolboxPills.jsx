import { useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

// agar.io-style cursor repulsion: pills within REPEL_RADIUS of the cursor drift
// away — strongest at the centre, easing to zero at the edge — then spring back.
const REPEL_RADIUS = 120
const REPEL_STRENGTH = 30
const ZERO = { x: 0, y: 0 }

const SPRING = { type: "spring", stiffness: 200, damping: 13, mass: 0.5 }

// Base centre measured from layout (offsetLeft/Top), so it ignores the live
// transform — reading the rendered rect would feed the offset back into itself.
const repelOffset = (el, container, cursorX, cursorY) => {
  const baseX = container.left + el.offsetLeft + el.offsetWidth / 2
  const baseY = container.top + el.offsetTop + el.offsetHeight / 2
  const dx = baseX - cursorX
  const dy = baseY - cursorY
  const dist = Math.hypot(dx, dy) || 1
  if (dist >= REPEL_RADIUS) return ZERO

  const push = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH
  return { x: (dx / dist) * push, y: (dy / dist) * push }
}

const ToolboxPills = ({ items }) => {
  const containerRef = useRef(null)
  const pillRefs = useRef([])
  const [offsets, setOffsets] = useState(() => items.map(() => ZERO))
  const prefersReducedMotion = useReducedMotion()

  const handleMove = (event) => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const next = items.map((_, i) => {
      const el = pillRefs.current[i]
      if (!el) return ZERO
      return repelOffset(el, containerRect, event.clientX, event.clientY)
    })
    setOffsets(next)
  }

  const handleLeave = () => setOffsets(items.map(() => ZERO))

  const interaction = prefersReducedMotion ? {} : { onMouseMove: handleMove, onMouseLeave: handleLeave }

  return (
    <div className="stack-pills" ref={containerRef} {...interaction}>
      {items.map(([name, primary], i) => (
        <motion.span
          key={name}
          ref={(el) => {
            pillRefs.current[i] = el
          }}
          className={primary ? "is-primary" : ""}
          animate={offsets[i]}
          transition={SPRING}
        >
          {name}
        </motion.span>
      ))}
    </div>
  )
}

export default ToolboxPills
