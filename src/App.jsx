import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useScroll } from "framer-motion"
import Vinyl3D from "./components/Vinyl3D.jsx"
import Intro from "./components/Intro.jsx"
import { Obj, BflyMark } from "./components/Scatter.jsx"
import NowPlaying from "./components/NowPlaying.jsx"
import Playlists from "./components/Playlists.jsx"
import Timeline from "./components/Timeline.jsx"
import { useTopArtists } from "./hooks/useTopArtists.js"

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
}

const CREDITS = [
  [
    "A1",
    "Identity & Access",
    "Designing and automating who can reach what — SSO, least-privilege, lifecycle and access reviews — so access stays correct without anyone thinking about it.",
  ],
  [
    "A2",
    "Security Automation",
    "Turning manual security toil into code. I treat repetitive work as a bug and build the tooling that makes the safe path the default path.",
  ],
  [
    "A3",
    "Software & Tooling",
    "A developer first. I build internal tools in TypeScript that other people actually want to use — small, sharp, and made to last.",
  ],
  ["A4", "AI Security", "Guardrails for how a company builds and uses AI, plus the awareness work to bring everyone else along with it."],
  ["A5", "Detection & Response", "Making threats visible and incidents fast — clean signal, honest logs, and runbooks that hold up when it counts."],
  ["A6", "Internal Security", "Hardening the everyday — workspace, devices, the human layer — so the foundation a company stands on is quietly solid."],
]

const PRINCIPLES = [
  [
    "01 · Plan mode first",
    "Spec before code",
    "Every build opens in plan mode with an LLM — I turn the problem into a clear, written spec before a single line gets written.",
  ],
  [
    "02 · Problem-oriented",
    "Start from why",
    "Context and value lead. I build from the problem and what an automation actually adds — not from the tool or the trend.",
  ],
  ["03 · Principles hold", "Standards, by design", "Clear coding standards, security by design, and a clean separation of concerns. Pragmatic, never sloppy."],
  ["04 · Always learning", "Sharpen the craft", "Always on the hunt for a better way to work — practicing and modernizing as I go."],
]

// The road so far — told as life steps, not a feature list. Each point is a
// chapter (a job, a move); the things built fold in as that chapter's
// highlights. Tomorro copy is deliberately generalized — no internal
// architecture, dates, or vendor specifics; Qonto copy is from the public CV.
const MILESTONES = [
  {
    id: "qonto-it",
    step: "01",
    year: "2020",
    org: "Qonto",
    role: "IT Technician",
    period: "2020 — 2022",
    note: "Joined at 18",
    title: "Where it started",
    blurb:
      "Walked into an early-stage Qonto at eighteen and helped build the workplace itself — identity, devices, the day-one experience. The job that turned me into a builder.",
    highlights: [
      "Automated on/offboarding so systems were ready for 20–40 new hires every two weeks",
      "Rolled out MDM baselines, SSO and group-based access",
      "Wrote the self-service docs and incident playbooks — and mentored the next joiners",
    ],
    education: [
      { school: "Lycée Richelieu", degree: "Bac STI2D · SIN", years: "2018 — 2020" },
      { school: "H3 Hitema", degree: "BTS SIO · Software Solutions & Apps", years: "2020 — 2022" },
    ],
    // NOTE: best-guess from known taste — replace with Cédric's real 2020–2022 picks.
    soundtrack: ["ABBA, always", "Electro & house", "Festival pop", "Late-night radio"],
  },
  {
    id: "qonto-sec",
    step: "02",
    year: "2022",
    org: "Qonto",
    role: "Security Engineer",
    period: "2022 — 2026",
    note: "The pivot",
    title: "Stepped into security",
    blurb:
      "Moved from IT into security engineering — and found the craft I wanted to go deep on. Four years strengthening the posture across cloud, access, the SDLC, and endpoints.",
    highlights: [
      "Governed access for 1,000+ suppliers via OneLogin SSO; SAML/SCIM into internal tools",
      "Secured CI/CD on GitHub & GitLab and migrated VPNs to a ZTNA architecture",
      "Built certificate-lifecycle tooling, cleaned up log hygiene, audited SaaS exposure",
    ],
    tags: ["Go", "Terraform", "Python", "AWS", "Kubernetes"],
    education: [
      { school: "Sup de Vinci", degree: "BSc · Computer Software Engineering", years: "2022 — 2024" },
      { school: "Sup de Vinci", degree: "MSc · Software Engineering, DevOps & Cloud", years: "2024 — 2026" },
    ],
    // NOTE: best-guess from known taste — replace with Cédric's real 2022–2026 picks.
    soundtrack: ["Techno, deeper", "ABBA", "Folk turns", "The “when we…” sets"],
  },
  {
    id: "tomorro",
    step: "03",
    year: "2026",
    org: "Tomorro",
    role: "IT & Security",
    period: "Feb 2026 — now",
    note: "Founding · now",
    title: "Building from zero",
    blurb:
      "Joined Tomorro to found the IT & Security function — the team, the systems, the standards. The biggest step yet: this time the whole thing is mine to build.",
    highlights: [
      "Stood up the department from zero — helpdesk, runbooks, a repeatable delivery cadence",
      "IAM as code, and device standards that keep the fleet compliant by default",
      "Drove SOC 2 Type II and ISO 27001, with guardrails for safe internal AI",
    ],
    education: [{ school: "Sup de Vinci", degree: "MSc · final year, graduating", years: "→ Oct 2026" }],
    // Real, from stats.fm — `soundtrack` = last ~6 months, `constants` = all-time.
    soundtrack: ["Fred again..", "Chance Peña", "Harry Styles", "nimino", "ODESZA"],
    constants: ["Montell Fish", "Fred again..", "Burna Boy", "The 1975", "Brent Faiyaz"],
  },
]

const TRACKS = [
  "when we're on the edge of tomorrow",
  "when I became myself",
  "when we reach the stars",
  "when we adventure one day",
  "when we see flowers bloom",
  "when we dream at night",
  "when we start a new beginning",
  "when we fly",
  "when we energize in euphoric addiction",
]

const REST = [
  ["In motion", ["The mountains", "Trail days", "Climbing", "Running", "Surf", "Skate & bike", "Snow", "Survival camping"]],
  [
    "At the table",
    ["Wine, always", "Cocktails I make", "Mixology", "Apéro · gin · rhum", "Coffee, properly", "Good bread & pastries", "Japanese & Korean", "Filipino adobo"],
  ],
  ["On repeat", ["Phil Odd", "Techno", "ABBA, unironically", "DJ sets", "Live shows", "The next playlist"]],
  ["Always dreaming of", ["Côte d’Azur", "Marbella", "Greece", "A small yacht", "City life & beach life", "The next trip"]],
]

const TICKER = ["Build things that last", "Plan first", "Problem-oriented", "Security by design", "Stay grounded", "Curate the sound", "Keep learning"]

// Spotify (static embeds, no backend — live data comes from stats.fm).
// SPOTIFY_PROFILE: the full profile URL (open.spotify.com/user/<id>).
// PLAYLISTS[].id: the part after /playlist/ in a playlist's share URL.
// Empty values render nothing (no broken players / dead links).
const SPOTIFY_PROFILE = "https://open.spotify.com/user/cedric.gautier"
const PLAYLISTS = [
  { title: "when we're on the edge of tomorrow", id: "" },
  { title: "when I became myself", id: "" },
  { title: "when we reach the stars", id: "" },
]

const HERO_CONTOURS = [
  "M0,90 C220,40 430,150 640,95 S1010,30 1200,95",
  "M0,170 C240,115 440,225 660,170 S1030,110 1200,175",
  "M0,255 C220,200 450,310 660,255 S1040,195 1200,260",
  "M0,345 C240,290 430,400 650,345 S1020,285 1200,350",
  "M0,435 C220,380 450,495 660,440 S1040,380 1200,445",
  "M0,525 C240,470 430,585 650,530 S1020,470 1200,535",
]

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [entering, setEntering] = useState(false)
  const [clock, setClock] = useState("--:--")
  const { scrollYProgress } = useScroll()
  const topArtists = useTopArtists()

  useEffect(() => {
    document.body.classList.toggle("locked", showIntro)
  }, [showIntro])

  // The intro plays itself — a short title sequence, then it dissolves into the
  // page. No button, no music (browser autoplay policy blocks sound without a
  // gesture anyway; music starts only when the visitor hits play).
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShowIntro(false)
      return
    }
    const toExit = setTimeout(() => setEntering(true), 2600)
    const toDone = setTimeout(() => setShowIntro(false), 3900)
    return () => {
      clearTimeout(toExit)
      clearTimeout(toDone)
    }
  }, [])

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }))
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  // Let an impatient visitor skip the title sequence.
  const skipIntro = () => {
    if (entering) return
    setEntering(true)
    setTimeout(() => setShowIntro(false), 700)
  }

  return (
    <>
      <div className="grain" />
      <motion.div className="progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />

      <a className="chip-chat" href="https://calendar.app.google/Ms5TShbKUfKJw7yt5" target="_blank" rel="noopener noreferrer">
        Let’s chat
      </a>
      <AnimatePresence>{showIntro && <Intro entering={entering} onSkip={skipIntro} />}</AnimatePresence>

      {/* HERO */}
      <header className="hero">
        <svg className="contours" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
          {HERO_CONTOURS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
        <Obj icon="headphones" style={{ top: "15%", left: "3%" }} rot={-8} delay={0.2} />
        <Obj icon="mountain" style={{ bottom: "14%", left: "6%" }} rot={6} delay={0.6} />
        <Obj icon="note" am style={{ bottom: "10%", right: "5%" }} rot={10} delay={1.1} />
        <Obj icon="butterfly" style={{ top: "20%", right: "8%" }} rot={-6} delay={0.4} />
        <div className="wrap">
          <div className="hero-meta">
            <span>Cat. № CG—07</span>
            <span>Paris · {clock}</span>
            <span>33⅓ rpm</span>
          </div>
          <div className="hero-grid">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.15 }}>
              <p className="eyebrow">Security Engineer · AI-first Builder · Curator</p>
              <h1 className="name">
                Cédric
                <br />
                <em>Gautier</em>
              </h1>
              <p className="tagline">
                I build and create things meant to <b>last</b> — secure systems by day, and the soundtrack to go with them.
              </p>
              <div className="scrollcue">
                <span className="ln" /> Now playing
              </div>
            </motion.div>
            <Vinyl3D playing />
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div className="ticker" aria-hidden="true">
        <motion.div className="row" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </motion.div>
      </div>

      {/* THESIS */}
      <section className="thesis">
        <Obj icon="coffee" am style={{ top: "8%", right: "6%" }} rot={-10} delay={0.4} />
        <Obj icon="pick" style={{ bottom: "6%", left: "2%" }} rot={8} delay={1.3} />
        <div className="wrap">
          <div className="thesis-grid">
            <div className="thesis-copy">
              <motion.p {...reveal} transition={{ duration: 0.8 }}>
                I’m a builder at heart — happiest with a project in progress, music in my ears, and a mountain on the horizon. I love making
                things and improving them so they last — durable, intentional, and worth keeping.
              </motion.p>
              <motion.p className="sig" {...reveal} transition={{ duration: 0.8, delay: 0.1 }}>
                — Paris · French &amp; Filipino · always mid-project
              </motion.p>
            </div>
            <motion.figure className="thesis-photo" {...reveal} transition={{ duration: 0.8, delay: 0.15 }}>
              <img
                src={`${import.meta.env.BASE_URL}cedric-coast.jpg`}
                alt="Cédric on a coastal walk, green mountains rising behind — a mountain on the horizon."
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.parentElement.style.display = "none"
                }}
              />
            </motion.figure>
          </div>
        </div>
      </section>

      {/* SIDE A */}
      <section className="pad">
        <div className="wrap">
          <motion.div className="sidetag" {...reveal} transition={{ duration: 0.7 }}>
            <span className="k">Side A — The Craft</span>
            <span className="bar" />
          </motion.div>
          <motion.p className="lead" {...reveal} transition={{ duration: 0.7 }}>
            What I know how to do, and <em>do</em> well.
          </motion.p>

          <div className="credits">
            {CREDITS.map(([no, h, p], i) => (
              <motion.div className="credit" key={no} {...reveal} transition={{ duration: 0.6, delay: (i % 2) * 0.08 }}>
                <span className="no">{no}</span>
                <div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="method">
            <div className="method-head">
              <div>
                <motion.p className="eyebrow" {...reveal} transition={{ duration: 0.7 }}>
                  Ways of working
                </motion.p>
                <motion.p className="lead" {...reveal} transition={{ duration: 0.7 }}>
                  AI-first — but <em>plan-first</em>.
                </motion.p>
              </div>
              <motion.p className="intro-p" {...reveal} transition={{ duration: 0.7 }}>
                I’ve rebuilt how I work around AI, and I keep modernizing it — but the engineering discipline underneath hasn’t moved.{" "}
                <b>Every build still starts with a plan.</b>
              </motion.p>
            </div>
            <div className="principles">
              {PRINCIPLES.map(([pl, h, p], i) => (
                <motion.div className="principle" key={pl} {...reveal} transition={{ duration: 0.6, delay: (i % 2) * 0.08 }}>
                  <span className="pl">{pl}</span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <Timeline milestones={MILESTONES} initialId="tomorro" live={topArtists} />

          <motion.div className="ethos" {...reveal} transition={{ duration: 0.8 }}>
            <p>“If it’s worth building, it’s worth building to outlast me.”</p>
          </motion.div>
        </div>
      </section>

      {/* SIDE B */}
      <section className="pad dark">
        <BflyMark className="bfly-watermark" style={{ top: "4%", right: "-6%", width: "min(540px,58vw)", color: "var(--amber)", opacity: 0.08 }} />
        <Obj icon="butterfly" am style={{ top: "12%", left: "5%" }} rot={8} delay={0.5} />
        <Obj icon="sun" style={{ top: "6%", right: "5%" }} rot={-6} delay={0.3} />
        <Obj icon="surf" style={{ top: "40%", left: "2%" }} rot={10} delay={1} />
        <Obj icon="martini" am style={{ top: "64%", left: "3%" }} rot={-6} delay={1.9} />
        <Obj icon="wine" am style={{ bottom: "9%", right: "6%" }} rot={-8} delay={0.7} />
        <Obj icon="pineapple" style={{ bottom: "20%", left: "4%" }} rot={6} delay={1.6} />
        <div className="wrap">
          <motion.div className="sidetag" {...reveal} transition={{ duration: 0.7 }}>
            <span className="k">Side B — The Human</span>
            <span className="bar" />
          </motion.div>
          <motion.p className="lead" {...reveal} transition={{ duration: 0.7 }}>
            And who I am when the <em>laptop closes</em>.
          </motion.p>

          <div className="music">
            <motion.div {...reveal} transition={{ duration: 0.7 }}>
              <p className="blocklabel">In the studio</p>
              <ul className="gear">
                <li>
                  <span className="g">Pioneer DDJ-FLX4</span>
                  <span className="t">decks</span>
                </li>
                <li>
                  <span className="g">Acoustic guitar</span>
                  <span className="t">six strings</span>
                </li>
                <li>
                  <span className="g">Techno → folk</span>
                  <span className="t">range</span>
                </li>
              </ul>
              <p className="blocklabel" style={{ marginTop: 42 }}>
                Recently, live
              </p>
              <ul className="shows">
                <li>
                  <span>01</span>Tom Odell
                </li>
                <li>
                  <span>02</span>Chance Peña
                </li>
                <li>
                  <span>03</span>Miguel
                </li>
                <li>
                  <span>04</span>Sammy Virji
                </li>
              </ul>
            </motion.div>

            <motion.div className="tracklist" {...reveal} transition={{ duration: 0.7 }}>
              <p className="th">Curated — the “when we…” series</p>
              <p className="sub">A long-running set of playlists I write like chapters. A life, scored.</p>
              {TRACKS.map((t, i) => (
                <div className="track" key={i}>
                  <span className="tn">{String(i + 1).padStart(2, "0")}</span>
                  <span className="nm">{t}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <Playlists items={PLAYLISTS} reveal={{ ...reveal, transition: { duration: 0.7 } }} />

          <motion.div className="nowspin" {...reveal} transition={{ duration: 0.7 }}>
            <p className="np">Now spinning — on repeat lately</p>
            <NowPlaying />
            <div id="spotify-embed" />
            {SPOTIFY_PROFILE && (
              <a className="spotify-follow" href={SPOTIFY_PROFILE} target="_blank" rel="noopener noreferrer">
                Follow on Spotify ↗
              </a>
            )}
          </motion.div>

          <div className="rest">
            {REST.map(([h, items], i) => (
              <motion.div key={h} {...reveal} transition={{ duration: 0.6, delay: i * 0.08 }}>
                <h4>{h}</h4>
                <ul>
                  {items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.p className="roots" {...reveal} transition={{ duration: 0.8 }}>
            French and Filipino — equally at home over a Paris <b>apéro</b>, a plate of <b>adobo</b>, or behind the bar mixing a <b>cocktail</b> of my own. A
            few years deep into mixology, and a bit of everywhere — building somewhere.
          </motion.p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <svg className="contours" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,80 C240,40 440,130 660,85 S1030,35 1200,90" />
          <path d="M0,170 C220,120 450,215 660,170 S1040,115 1200,175" />
          <path d="M0,260 C240,210 430,310 650,260 S1020,205 1200,265" />
          <path d="M0,350 C220,300 450,400 660,350 S1040,300 1200,355" />
        </svg>
        <Obj icon="vinyl" style={{ top: "14%", left: "4%" }} rot={8} delay={0.5} />
        <Obj icon="butterfly" am style={{ top: "46%", right: "9%" }} rot={-8} delay={1.5} />
        <Obj icon="pineapple" am style={{ bottom: "22%", right: "5%" }} rot={-10} delay={1.2} />
        <div className="wrap">
          <motion.p className="eyebrow" {...reveal} transition={{ duration: 0.7 }}>
            Find me
          </motion.p>
          <motion.h2 className="big" {...reveal} transition={{ duration: 0.7 }}>
            Let’s build something that <em>lasts</em>.
          </motion.h2>
          <motion.div className="cta-row" {...reveal} transition={{ duration: 0.7 }}>
            <a className="cta-primary" href="https://calendar.app.google/Ms5TShbKUfKJw7yt5" target="_blank" rel="noopener noreferrer">
              Let’s chat ↗
            </a>
            <span className="cta-or">or</span>
            <a className="cta-email" href="mailto:cedricgautier07@gmail.com">
              email me
            </a>
          </motion.div>
          <motion.p className="status" {...reveal} transition={{ duration: 0.7 }}>
            <span className="dot" /> Based in Paris · open to building
          </motion.p>
          <motion.div className="links" {...reveal} transition={{ duration: 0.7 }}>
            <a href="https://www.linkedin.com/in/cedricgautier" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://www.instagram.com/cedricgautier/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://linktr.ee/cedricgautier" target="_blank" rel="noopener noreferrer">
              Spotify
            </a>
            <a href="https://linktr.ee/cedricgautier" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://www.youtube.com/playlist?list=PL22iEbtV9pVIURt20I1lA5DrZt9bhyKv9" target="_blank" rel="noopener noreferrer">
              My gems · live music
            </a>
            <a href="https://linktr.ee/cedricgautier" target="_blank" rel="noopener noreferrer">
              All links
            </a>
          </motion.div>
          <div className="colophon">
            <span>© {new Date().getFullYear()} Cédric Gautier</span>
            <span>Built to last · Paris</span>
          </div>
        </div>
      </footer>
    </>
  )
}
