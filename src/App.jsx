import { lazy, Suspense, useEffect, useState } from "react"
import { motion, AnimatePresence, useScroll } from "framer-motion"
// Lazy-loaded: three.js is the heaviest dependency, so defer it off the critical
// path for a faster first paint (better LCP / Core Web Vitals → better SEO).
const Vinyl3D = lazy(() => import("./components/Vinyl3D.jsx"))
import Intro from "./components/Intro.jsx"
import { Obj, BflyMark } from "./components/Scatter.jsx"
import NowPlaying from "./components/NowPlaying.jsx"
import Playlists from "./components/Playlists.jsx"
import Timeline from "./components/Timeline.jsx"
import Passions from "./components/Passions.jsx"
import RisingBubbles from "./components/RisingBubbles.jsx"
import ToolboxPills from "./components/ToolboxPills.jsx"
import DiscoMode, { DISCO_EVENT } from "./components/DiscoMode.jsx"
import Terminal from "./components/Terminal.jsx"
import CVSheet from "./components/CVSheet.jsx"
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
    "Designing and automating who can reach what — SSO and SCIM lifecycles, SAML/OIDC/OAuth2, least-privilege and access reviews — so access stays correct without anyone thinking about it.",
  ],
  [
    "A2",
    "Engineering & Automation",
    "A developer first. I turn manual security toil into code and build internal tools people actually want to use — small, sharp, made to last, and made so the safe path is the default path.",
  ],
  [
    "A3",
    "Platform, Pipeline & Cloud",
    "DevSecOps in practice — security built into delivery, not bolted on. I harden CI/CD pipelines and the supply chain behind them, shape release gates that let safe code ship fast, and design and run deployments across AWS and Azure with infrastructure as code and GitOps.",
  ],
  [
    "A4",
    "AI Security",
    "Guardrails for how a company builds and uses AI — governance for LLMs, AI agents and MCP integrations, plus the awareness work to bring everyone else along with it.",
  ],
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

// The toolbox — kept deliberately separate from the expertise above. The tools
// serve the problem, they aren't the point: multilingual by habit, mainly Go.
// `primary` marks the language I reach for first.
const STACK = [
  ["Go", true],
  ["TypeScript", false],
  ["Python", false],
  ["Bash", false],
  ["Terraform", false],
  ["AWS", false],
  ["Azure", false],
  ["Docker", false],
  ["Kubernetes", false],
  ["Helm", false],
  ["ArgoCD", false],
  ["kubectl", false],
  ["Grafana", false],
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
      "Automated on/offboarding into a scalable, hands-off flow — systems ready for 20–40 new hires every two weeks",
      "Ran joiner/mover/leaver and day-one readiness; scripted workflows and runbooks cut provisioning lead time and errors",
      "Administered SSO and group-based access across core apps — tightening least-privilege with periodic reviews",
      "Rolled out MDM baseline configurations, raising endpoint compliance and reducing drift",
      "Built self-service docs (how-tos, FAQs) that cut ticket volume and MTTR on recurring issues",
      "Wrote incident-response playbooks for workspace tools — triage, comms, RCA — for faster, more consistent recovery",
      "Became the go-to for IT Ops: led onboarding sessions, built training, and mentored new joiners to autonomy",
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
    highlightGroups: [
      {
        group: "IAM",
        items: [
          "Automated the user lifecycle (on/offboarding) — cutting provisioning lead time and configuration drift",
          "Built an in-house IAM platform governing 1,000+ external users (auditors, external support/ops providers) — a no-code internal front end backed by a custom IdP-linked job applying RBAC to provision the right access across every app",
          "Wired SAML/SCIM into internal tools to centralize access through SSO",
        ],
      },
      {
        group: "Endpoint security",
        items: [
          "Migrated traditional VPNs to a ZTNA architecture",
          "Ran endpoint detection & response (EDR) across the fleet — alerting, triage and remediation",
          "Raised endpoint compliance with refreshed baselines aligned to corporate standards and CIS Benchmarks",
        ],
      },
      {
        group: "Platform security",
        items: [
          "Secured CI/CD across our source-control platforms with policy checks, branch protection and safer release gates",
          "Drove company-wide commit signing — migrating every developer to signed commits as a verified default",
          "Hardened the GitHub Actions supply chain — pinning and allow-listing actions to block unvetted, unspecified versions",
          "Built an internal tool that inventories the company's SSL/TLS certificates and alerts ahead of expiry — a polished dashboard giving full visibility so a certificate never lapses unnoticed",
          "Hardened observability hygiene — detecting and remediating sensitive fields in logs",
          "Migrated internal security-app alerting to a centralized error-tracking platform for faster, more consistent response",
          "Added a config-validation test suite to the SDLC for safer log-pipeline deployments",
          "Helped migrate Kubernetes apps onto Helm charts",
        ],
      },
      {
        group: "Security compliance",
        items: [
          "Audited sensitive-content exposure across SaaS, internal AI and collaboration tools and tightened controls",
          "Automated access-management security controls to improve detection and speed up investigations",
        ],
      },
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
    highlightGroups: [
      {
        group: "Foundations",
        items: [
          "Launched the IT/Security function from zero — an internal workspace, runbooks and a how-to knowledge base",
          "Stood up a ticketing culture for IT support, with standard intake and tracking",
          "Reworked delivery into a Scrumban cadence",
        ],
      },
      {
        group: "Security automation & tooling",
        items: [
          "Built the access-control checks that verify access across the most critical company-wide tools, and owned the access-review process that keeps us compliant with our security certifications",
          "Automated the employee lifecycle — an HRIS-driven sync to a single source-of-truth employee database, tracking joiner/mover/leaver transitions and field changes",
        ],
      },
      {
        group: "Workplace & fleet",
        items: [
          "Standardized the laptop fleet — a baseline configuration shipped and enforced through MDM",
          "Ran endpoint detection & response (EDR) across the macOS-first fleet",
          "Automated device inventory — syncing the device-enrollment source into our asset database with warranty and assignment data",
          "Set up a vendor partnership for IT-equipment purchasing",
        ],
      },
    ],
    tags: ["TypeScript", "Python", "Terraform", "Google Workspace", "MDM/EDR"],
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
  ["In motion", ["The mountains", "Trail days", "Climbing", "Running", "Surf", "Skate & bike", "Snow", "Lake days", "The next trip"]],
  [
    "At the table",
    [
      "Wine, always",
      "Cocktails & mixology",
      "Apéro · gin · rhum",
      "Coffee, properly",
      "Good bread & pastries",
      "Japanese & Korean",
      "Filipino adobo",
      "Wine bars",
      "Dinners with friends & family",
    ],
  ],
  [
    "Tuned in",
    ["Phil Odd", "Techno", "ABBA, unironically", "DJ sets", "Live shows", "The next playlist", "Discovering new tech", "Markets & IPOs", "Finance & investing"],
  ],
]

const TICKER = [
  "Make the secure path the default",
  "Build things that last",
  "Plan first",
  "Problem-oriented",
  "Security by design",
  "Stay grounded",
  "Curate the sound",
  "Keep learning",
]

// Spotify (no backend — live listening data comes from stats.fm).
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
      <DiscoMode />
      <Terminal />
      <CVSheet credits={CREDITS} milestones={MILESTONES} stack={STACK} />

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
            <span className="rpm-secret" onClick={() => window.dispatchEvent(new Event(DISCO_EVENT))} title="▲▲▼▼◄►◄► b a">
              33⅓ rpm
            </span>
          </div>
          <div className="hero-grid">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.15 }}>
              <p className="eyebrow">Security Engineer · DevSecOps · AI-first Builder · Curator</p>
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
            <Suspense fallback={null}>
              <Vinyl3D playing />
            </Suspense>
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
            <motion.figure className="thesis-photo" {...reveal} transition={{ duration: 0.8, delay: 0.15 }}>
              <img
                src={`${import.meta.env.BASE_URL}me-and-the-mountain.jpeg`}
                alt="Cédric outdoors with green mountains rising behind — a mountain on the horizon."
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.parentElement.style.display = "none"
                }}
              />
            </motion.figure>
            <div className="thesis-copy">
              <motion.p {...reveal} transition={{ duration: 0.8 }}>
                I’m a builder at heart — happiest with a project in progress, music in my ears, and a mountain on the horizon. I love making things and
                improving them so they last — durable, intentional, and worth keeping.
              </motion.p>
              <motion.p className="sig" {...reveal} transition={{ duration: 0.8, delay: 0.1 }}>
                — Paris · French &amp; Filipino · always mid-project
              </motion.p>
            </div>
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
            I don’t break security — I <em>build</em> it.
          </motion.p>
          <motion.p className="craft-note" {...reveal} transition={{ duration: 0.7 }}>
            <span className="y">Yellow team</span>, by the security color wheel — the builder’s side of the craft. The green isn’t just for the mountains:{" "}
            <b>yellow + blue</b> (build + defend) is the wheel’s green — <b>DevSecOps</b>. The secure path, made the default path.
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

          <motion.aside className="sleeve" {...reveal} transition={{ duration: 0.6 }}>
            <div className="sleeve-head">
              <span className="sleeve-tag">Toolbox</span>
              <span className="sleeve-bar" />
              <span className="sleeve-sub">what I build with</span>
            </div>
            <p className="sleeve-quote">
              Go was my daily driver at Qonto — but I&rsquo;ve <em>never been tied to one stack</em>. I move across languages by design, and with AI in the loop
              I ramp into whatever a problem calls for.
            </p>
            <ToolboxPills items={STACK} />
          </motion.aside>

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
        <RisingBubbles />
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
              <figure className="studio-photo">
                <img
                  src={`${import.meta.env.BASE_URL}me-dj.jpeg`}
                  alt="Cédric behind the decks, mid-set."
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.parentElement.style.display = "none"
                  }}
                />
              </figure>
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
            <p className="np">Now spinning — lately</p>
            <NowPlaying />
            {SPOTIFY_PROFILE && (
              <a className="spotify-follow" href={SPOTIFY_PROFILE} target="_blank" rel="noopener noreferrer">
                Follow on Spotify ↗
              </a>
            )}
          </motion.div>

          <Passions groups={REST} />

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
            <span className="cta-or">or</span>
            <button className="cta-cv" onClick={() => window.print()} title="Save as PDF from the print dialog">
              download CV ↓
            </button>
          </motion.div>
          <motion.p className="status" {...reveal} transition={{ duration: 0.7 }}>
            <span className="dot" /> Based in Paris · open to building
          </motion.p>
          <motion.div className="links" {...reveal} transition={{ duration: 0.7 }}>
            <a href="https://www.linkedin.com/in/cedricgautier" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://www.instagram.com/gautier.cedric/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={SPOTIFY_PROFILE} target="_blank" rel="noopener noreferrer">
              Spotify
            </a>
            <a href="https://github.com/cedricgautier" target="_blank" rel="noopener noreferrer">
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
