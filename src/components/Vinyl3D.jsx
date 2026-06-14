import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import CanvasErrorBoundary from "./CanvasErrorBoundary.jsx"

const RECORD_RADIUS = 2.05
const SPIN_SPEED = 0.85
const IDLE_SPIN = 0.14 // gentle drift so the hero record never looks dead

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Draws text along a circular arc — top arc reads left-to-right upright, bottom
// arc reads upright too (letters flipped so they're not upside down).
const drawArcText = (ctx, text, cx, cy, radius, { align = "top", font, fillStyle, letterSpacing = 0 }) => {
  ctx.save()
  ctx.font = font
  ctx.fillStyle = fillStyle
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const chars = [...text]
  const angles = chars.map((ch) => (ctx.measureText(ch).width + letterSpacing) / radius)
  const total = angles.reduce((sum, a) => sum + a, 0)
  const dir = align === "bottom" ? -1 : 1
  const centerAngle = align === "bottom" ? Math.PI / 2 : -Math.PI / 2
  let angle = centerAngle - (dir * total) / 2
  chars.forEach((ch, i) => {
    angle += (dir * angles[i]) / 2
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.rotate(angle + (dir * Math.PI) / 2)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
    angle += (dir * angles[i]) / 2
  })
  ctx.restore()
}

// Paints the record face on a high-resolution 2D canvas: crisp grooves, a soft
// reflection sweep, and the green centre label with the name drawn upright.
const makeRecordTexture = () => {
  const size = 2048
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")
  const center = size / 2

  ctx.fillStyle = "#0a0a0c"
  ctx.fillRect(0, 0, size, size)

  // Grooves — tightly spaced concentric rings that catch the light.
  for (let radius = size * 0.19; radius < size * 0.49; radius += 4) {
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255,255,255,${0.018 + Math.random() * 0.03})`
    ctx.lineWidth = 1.4
    ctx.stroke()
  }

  // A faint diagonal sheen so the disc reads as glossy vinyl, not flat black.
  const sheen = ctx.createLinearGradient(0, 0, size, size)
  sheen.addColorStop(0, "rgba(255,255,255,0.07)")
  sheen.addColorStop(0.5, "rgba(255,255,255,0)")
  sheen.addColorStop(1, "rgba(255,255,255,0.05)")
  ctx.beginPath()
  ctx.arc(center, center, size * 0.49, 0, Math.PI * 2)
  ctx.fillStyle = sheen
  ctx.fill()

  // Green label.
  const labelR = size * 0.185
  const label = ctx.createRadialGradient(center, center * 0.94, 30, center, center, labelR)
  label.addColorStop(0, "#3f7551")
  label.addColorStop(1, "#1c4730")
  ctx.beginPath()
  ctx.arc(center, center, labelR, 0, Math.PI * 2)
  ctx.fillStyle = label
  ctx.fill()

  // Two thin rims around the label for a finished, pressed-record look.
  ctx.strokeStyle = "rgba(241,234,217,0.22)"
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(center, center, labelR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = "rgba(224,168,54,0.30)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(center, center, labelR * 0.9, 0, Math.PI * 2)
  ctx.stroke()

  // Curved keyword rings — minimalist, like a pressed record label.
  const ringR = labelR * 0.82
  drawArcText(ctx, "SECURITY · CURATOR · BUILDER", center, center, ringR, {
    align: "top",
    font: "700 30px 'Space Mono', monospace",
    fillStyle: "#e8e0d0",
    letterSpacing: 6,
  })
  drawArcText(ctx, "THINGS THAT LAST · PARIS", center, center, ringR, {
    align: "bottom",
    font: "700 30px 'Space Mono', monospace",
    fillStyle: "rgba(224,168,54,0.92)",
    letterSpacing: 6,
  })

  // Centre — small and quiet, with the spindle hole left clear in the middle.
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "#e0a836"
  ctx.font = "400 34px 'Space Mono', monospace"
  ctx.fillText("✦", center, center - 116)

  ctx.fillStyle = "#f1ead9"
  ctx.font = "600 50px Georgia, serif"
  ctx.fillText("CÉDRIC GAUTIER", center, center - 60)

  // Short divider, below the spindle.
  ctx.strokeStyle = "rgba(241,234,217,0.4)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(center - 70, center + 28)
  ctx.lineTo(center + 70, center + 28)
  ctx.stroke()

  ctx.fillStyle = "#e0a836"
  ctx.font = "400 26px 'Space Mono', monospace"
  ctx.fillText("PARIS · EST. 2026", center, center + 66)

  // Spindle hole.
  ctx.beginPath()
  ctx.arc(center, center, 14, 0, Math.PI * 2)
  ctx.fillStyle = "#070605"
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 16
  texture.center.set(0.5, 0.5)
  return texture
}

const Record = ({ playing }) => {
  const spinner = useRef()
  const [texture, setTexture] = useState(makeRecordTexture)

  // Re-bake the label once webfonts (Space Mono) are ready so the curved text
  // isn't stuck with a fallback font from the first synchronous paint.
  useEffect(() => {
    if (!document.fonts?.ready) return
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) setTexture(makeRecordTexture())
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Free the previous/last GPU texture on swap and on unmount.
  useEffect(() => () => texture.dispose(), [texture])

  useFrame((_, delta) => {
    if (spinner.current) spinner.current.rotation.z -= delta * (playing ? SPIN_SPEED : IDLE_SPIN)
  })

  return (
    <group rotation={[-0.42, 0, 0]}>
      <group ref={spinner}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[RECORD_RADIUS, RECORD_RADIUS, 0.12, 256]} />
          <meshPhysicalMaterial color="#0b0b0d" roughness={0.22} metalness={0} clearcoat={1} clearcoatRoughness={0.18} reflectivity={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.062]}>
          <circleGeometry args={[RECORD_RADIUS, 256]} />
          <meshPhysicalMaterial map={texture} roughness={0.34} metalness={0.05} clearcoat={0.6} clearcoatRoughness={0.25} />
        </mesh>
        {/* Crisp outer rim to define the disc edge. */}
        <mesh position={[0, 0, 0.001]}>
          <torusGeometry args={[RECORD_RADIUS - 0.012, 0.022, 24, 220]} />
          <meshStandardMaterial color="#050506" roughness={0.35} metalness={0.1} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.12, 32]} />
        <meshStandardMaterial color="#e8e0d0" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// Static record shown when motion is reduced or WebGL is unavailable.
const VinylFallback = () => (
  <div className="vinyl-fallback" aria-hidden="true">
    <div className="vinyl-fallback-label">
      <span>CÉDRIC</span>
      <span>GAUTIER</span>
    </div>
  </div>
)

const Vinyl3D = ({ playing = true, onClick }) => {
  const isInteractive = Boolean(onClick)

  const handleKeyDown = (event) => {
    if (isInteractive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className="stage3d"
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={isInteractive ? "Pause or play the record" : undefined}
    >
      {prefersReducedMotion() ? (
        <VinylFallback />
      ) : (
        <CanvasErrorBoundary fallback={<VinylFallback />}>
          <Canvas
            camera={{ position: [0, 0, 7.6], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.08
              gl.outputColorSpace = THREE.SRGBColorSpace
            }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 6, 5]} intensity={1.5} />
            <directionalLight position={[-5, 2, 3]} intensity={0.55} color="#356845" />
            <pointLight position={[3, -3, 4]} intensity={0.8} color="#e0a836" />
            {/* Tight rim light for a sharp specular edge on the disc. */}
            <spotLight position={[-2, 4, 6]} angle={0.6} penumbra={0.8} intensity={1.1} color="#f3ecdb" />
            <Record playing={playing} />
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  )
}

export default Vinyl3D
