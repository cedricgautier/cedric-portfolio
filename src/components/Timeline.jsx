import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

// A faint contour wave behind the rail — same topographic motif as the rest of
// the site, purely decorative.
const RAIL_WAVE = "M0,28 C150,8 300,48 450,28 S750,8 900,28 S1150,48 1200,28"

// The road so far — the big steps, told as a timeline you can walk through.
// Each point is a chapter; picking one tells the story of that move and what
// got built along the way. Newest sits on the right.
const Timeline = ({ milestones, initialId, live = {} }) => {
  const reducedMotion = prefersReducedMotion()
  const [selectedId, setSelectedId] = useState(initialId ?? milestones[milestones.length - 1]?.id)

  const selectedIndex = Math.max(
    0,
    milestones.findIndex((milestone) => milestone.id === selectedId),
  )
  const selected = milestones[selectedIndex]

  // The last step is "now": prefer live Spotify data there, fall back to the
  // static list. `allTime` ("the constants") only shows on the now step.
  const isNowStep = selected.id === milestones[milestones.length - 1]?.id
  const onRepeat = isNowStep && live.now?.length ? live.now : selected.soundtrack
  const constants = isNowStep ? (live.allTime?.length ? live.allTime : selected.constants) : null

  return (
    <motion.div
      className="tlg"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7 }}
    >
      <div className="tl-headrow">
        <p className="eyebrow">The road so far</p>
        <span className="tl-axis">2020 → now · tap a step</span>
      </div>

      <div className="tlg-plot">
        <svg className="tlg-wave" viewBox="0 0 1200 56" preserveAspectRatio="none" aria-hidden="true">
          <path d={RAIL_WAVE} />
        </svg>

        <div className="tlg-rail" role="group" aria-label="Career timeline — pick a step">
          <span className="tlg-line" aria-hidden="true" />
          {milestones.map((milestone, index) => {
            const isSelected = milestone.id === selectedId
            const isNow = index === milestones.length - 1
            return (
              <button
                key={milestone.id}
                type="button"
                className={`tlg-node${isSelected ? " on" : ""}${isNow ? " now" : ""}`}
                aria-pressed={isSelected}
                aria-label={`Step ${milestone.step} — ${milestone.year}, ${milestone.org} · ${milestone.role}: ${milestone.title}`}
                onClick={() => setSelectedId(milestone.id)}
              >
                <span className="tlg-dot" aria-hidden="true" />
                <span className="tlg-label">
                  <span className="tlg-year">{milestone.year}</span>
                  <span className="tlg-sub">{milestone.org}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          className="tlg-card"
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reducedMotion ? 0 : 0.32 }}
        >
          <p className="tlg-meta">
            <span className="tlg-step">Step {selected.step}</span>
            <span className="tlg-where">
              {selected.org} · {selected.role}
            </span>
            <span className="tlg-when">{selected.period ?? selected.year}</span>
            {selected.note && <em className="tlg-note">{selected.note}</em>}
          </p>
          <h3 className="tlg-title">{selected.title}</h3>
          <p className="tlg-blurb">{selected.blurb}</p>
          {selected.highlights && (
            <ul className="tlg-highlights">
              {selected.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}
          {selected.highlightGroups && (
            <div className="tlg-hlgroups">
              {selected.highlightGroups.map((group) => (
                <div className="tlg-hlgroup" key={group.group}>
                  <p className="tlg-hlgroup-label">{group.group}</p>
                  <ul className="tlg-highlights">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {selected.tags && (
            <div className="tlg-tags">
              {selected.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          {(selected.education || onRepeat) && (
            <div className="tlg-foot">
              {selected.education && (
                <div className="tlg-foot-col">
                  <p className="tlg-foot-label">Studying then</p>
                  <ul className="tlg-study">
                    {selected.education.map((entry) => (
                      <li key={entry.school + entry.years}>
                        <span className="s">{entry.school}</span>
                        <span className="d">{entry.degree}</span>
                        <span className="y">{entry.years}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {onRepeat && (
                <div className="tlg-foot-col">
                  <p className="tlg-foot-label">{isNowStep ? "On repeat now ♪" : "On repeat then ♪"}</p>
                  <div className="tlg-sound">
                    {onRepeat.map((artist) => (
                      <span key={artist}>{artist}</span>
                    ))}
                  </div>
                  {constants && (
                    <>
                      <p className="tlg-foot-label" style={{ marginTop: 18 }}>
                        The constants ♪
                      </p>
                      <div className="tlg-sound">
                        {constants.map((artist) => (
                          <span key={artist}>{artist}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default Timeline
