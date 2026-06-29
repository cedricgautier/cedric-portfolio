import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useDragControls } from "framer-motion"
import { DISCO_EVENT } from "./DiscoMode.jsx"

// A hidden security-flavored terminal — the kind a security engineer would hide
// on their own site. Open it with the backtick key (`) or the launcher chip.
const PROMPT = "cedric@paris:~$"
const TOGGLE_KEY = "`"

// Each command returns a result object: { lines } to print, plus optional
// directives — `clear` wipes the log, `close` hides the terminal, `fire`
// dispatches a window event (that's how `disco` reaches DiscoMode).
const COMMANDS = {
  help: () => ({
    lines: [
      "available commands:",
      "  whoami     who you’re talking to",
      "  skills     the craft (Side A credits)",
      "  stack      what I build with",
      "  scan       run a posture check",
      "  music      what’s on the decks",
      "  contact    how to reach me",
      "  social     find me elsewhere",
      "  disco      ▲▲▼▼◄►◄► b a",
      "  clear      wipe the screen",
      "  exit       close the terminal",
    ],
  }),
  whoami: () => ({
    lines: [
      "cédric gautier — security engineer · ai-first builder",
      "yellow team: the builder’s side of the wheel.",
      "green = yellow + blue = build + defend.",
      "paris · french & filipino · always mid-project.",
    ],
  }),
  skills: () => ({
    lines: [
      "A1  identity & access     sso/scim · saml/oidc · least-privilege",
      "A2  security automation   turn manual toil into code",
      "A3  software & tooling    internal tools people actually use",
      "A4  ai security           guardrails for llms · agents · mcp",
      "A5  detection & response  clean signal · honest logs",
      "A6  internal security     harden the everyday",
    ],
  }),
  stack: () => ({
    lines: [
      "go (daily driver) · typescript · python · bash",
      "terraform · aws · azure · docker · kubernetes · helm · argocd · grafana",
      "the tool serves the problem — mainly go, never tied to one stack.",
    ],
  }),
  scan: () => ({
    lines: [
      "running posture scan…",
      "[ ok ]  identity      least-privilege enforced",
      "[ ok ]  mfa           enabled everywhere",
      "[ ok ]  secrets       none in source",
      "[ ok ]  endpoints     compliant baseline",
      "[ ok ]  logs          clean signal, no pii",
      "[ ok ]  soundtrack    immaculate ♪",
      "posture: secure by design ✓ — the secure path, made the default.",
    ],
  }),
  music: () => ({
    lines: ["on the decks: pioneer ddj-flx4 · techno → folk.", "curating the “when we…” series — a life, scored.", "now spinning lives down on Side B ↓"],
  }),
  contact: () => ({
    lines: ["email   cedricgautier07@gmail.com", "chat    calendar.app.google/Ms5TShbKUfKJw7yt5", "→ let’s build something that lasts."],
  }),
  social: () => ({
    lines: ["linkedin   /in/cedricgautier", "github     /cedricgautier", "spotify    /user/cedric.gautier", "all links  linktr.ee/cedricgautier"],
  }),
  disco: () => ({ lines: ["cuing the lights… 🪩"], fire: DISCO_EVENT }),
  sudo: () => ({ lines: ["nice try. you already have least privilege. 😉"] }),
  ls: () => ({ lines: ["intro/  hero/  side-a.craft/  side-b.human/  contact/"] }),
  clear: () => ({ clear: true }),
  exit: () => ({ close: true }),
}

const WELCOME = [`${PROMPT} welcome — type 'help' to look around. (backtick toggles me)`]

const unknownCommand = (name) => ({ lines: [`command not found: ${name} — try 'help'`] })

const Terminal = () => {
  const [open, setOpen] = useState(false)
  // Window mode, mac-style: "normal" | "max" (fullscreen). Green toggles max.
  const [mode, setMode] = useState("normal")
  const [value, setValue] = useState("")
  const [log, setLog] = useState(WELCOME)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  // Drag the window by its title bar only — so the body still scrolls and the
  // input still selects text normally.
  const dragControls = useDragControls()

  // Backtick toggles the terminal; Escape closes it (only when open, so we don't
  // swallow Escape page-wide). Match the physical Backquote key too, so the
  // shortcut works on layouts (e.g. AZERTY) where backtick is a dead key. While
  // typing inside the terminal, backtick is just a character — don't steal it.
  useEffect(() => {
    const onKey = (event) => {
      const typingHere = event.target === inputRef.current
      const isToggle = (event.key === TOGGLE_KEY || event.code === "Backquote") && !typingHere
      const isEscapeWhileOpen = event.key === "Escape" && open
      if (!isToggle && !isEscapeWhileOpen) return
      event.preventDefault()
      setOpen((prev) => (isEscapeWhileOpen ? false : !prev))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Focus the input on open, and always reopen at a clean normal size.
  useEffect(() => {
    if (!open) return
    setMode("normal")
    inputRef.current?.focus()
  }, [open])
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [log, open])

  const runCommand = (raw) => {
    const input = raw.trim()
    if (!input) return
    const name = input.toLowerCase().split(/\s+/)[0]
    // Own-property lookup only — otherwise inherited names like `__proto__`
    // resolve to Object.prototype and crash when we try to call them.
    const handler = Object.hasOwn(COMMANDS, name) ? COMMANDS[name] : null
    const result = handler ? handler() : unknownCommand(name)
    if (result.clear) {
      setLog([])
      return
    }
    const echoed = [`${PROMPT} ${input}`, ...(result.lines || [])]
    setLog((prev) => [...prev, ...echoed])
    if (result.fire) window.dispatchEvent(new Event(result.fire))
    if (result.close) setOpen(false)
  }

  const onSubmit = (event) => {
    event.preventDefault()
    runCommand(value)
    setValue("")
  }

  return (
    <>
      <button className="term-launcher" onClick={() => setOpen((prev) => !prev)} aria-label="Open terminal" title="open terminal (`)">
        <span>›_</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={`term term-${mode}`}
            role="dialog"
            aria-label="Security terminal"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.08}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <div className="term-bar" onPointerDown={(event) => dragControls.start(event)}>
              <span className="term-dots">
                <button
                  className="term-dot red"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    setLog([])
                    setOpen(false)
                  }}
                  aria-label="Clear and hide terminal"
                  title="clear & hide"
                />
                <button
                  className="term-dot yellow"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setOpen(false)}
                  aria-label="Hide terminal"
                  title="hide"
                />
                <button
                  className="term-dot green"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setMode((prev) => (prev === "max" ? "normal" : "max"))}
                  aria-label="Fullscreen terminal"
                  title="fullscreen"
                />
              </span>
              <span className="term-title">{PROMPT.replace("$", "")} — secure shell</span>
            </div>
            <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
              {log.map((line, index) => (
                <p key={index} className="term-line">
                  {line}
                </p>
              ))}
              <form className="term-input-row" onSubmit={onSubmit}>
                <span className="term-prompt">{PROMPT}</span>
                <input
                  ref={inputRef}
                  className="term-input"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  spellCheck="false"
                  autoComplete="off"
                  aria-label="Terminal input"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Terminal
