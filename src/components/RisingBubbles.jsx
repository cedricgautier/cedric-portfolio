// Decorative soda-glass bubbles rising up the dark Side B background — like a
// glass of coke. Pure CSS animation (no JS loop): each bubble varies in lane,
// size, speed and start delay so the stream feels organic. The field is built
// once from a seeded sequence so it never reshuffles between renders, and the
// whole layer is hidden under prefers-reduced-motion (see styles.css).
const BUBBLE_COUNT = 22

// Deterministic pseudo-random in [0, 1) from an integer seed — stable across
// renders without Math.random.
const seeded = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const BUBBLES = Array.from({ length: BUBBLE_COUNT }, (_, index) => ({
  left: seeded(index + 1) * 100,
  size: 5 + seeded(index + 2) * 20,
  duration: 9 + seeded(index + 3) * 13,
  delay: -seeded(index + 4) * 22,
  drift: (seeded(index + 5) - 0.5) * 70,
}))

const RisingBubbles = () => (
  <div className="soda" aria-hidden="true">
    {BUBBLES.map((bubble, index) => (
      <span
        key={index}
        className="soda-b"
        style={{
          left: `${bubble.left}%`,
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          "--dur": `${bubble.duration}s`,
          "--delay": `${bubble.delay}s`,
          "--drift": `${bubble.drift}px`,
        }}
      />
    ))}
  </div>
)

export default RisingBubbles
