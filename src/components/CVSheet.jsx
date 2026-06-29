// A print-only résumé. Hidden on screen; the @media print block in styles.css
// hides the live site and shows just this, reflowed onto A4. It's built from the
// same CREDITS / MILESTONES / STACK arrays as the page, so the CV never drifts
// out of sync with the site. Trigger it with the "download CV" button (print).

// Highlights come in two shapes across milestones — a flat `highlights` list or
// grouped `highlightGroups`. Flatten both to a single bullet list for the CV.
const flattenBullets = (milestone) => {
  const fromGroups = (milestone.highlightGroups ?? []).flatMap((group) => group.items)
  return milestone.highlights ?? fromGroups
}

const CVSheet = ({ credits, milestones, stack }) => {
  const jobsNewestFirst = milestones.slice().reverse()
  // Higher education first, with the baccalauréat (the foundational diploma) last.
  const education = jobsNewestFirst.flatMap((milestone) => milestone.education ?? [])
  const higherEducation = education.filter((entry) => !entry.degree.startsWith("Bac"))
  const baccalaureate = education.filter((entry) => entry.degree.startsWith("Bac"))
  const orderedEducation = [...higherEducation, ...baccalaureate]
  const tools = stack.map(([name]) => name).join(" · ")

  return (
    <section className="cv-sheet" aria-hidden="true">
      <header className="cv-head">
        <h1>Cédric Gautier</h1>
        <p className="cv-role">Security Engineer · DevSecOps · AI-first Builder</p>
        <p className="cv-contact">Paris, France · cedricgautier07@gmail.com · linkedin.com/in/cedricgautier · github.com/cedricgautier</p>
      </header>

      <p className="cv-summary">
        French &amp; Filipino security engineer — strongest in identity &amp; access, security automation, and DevSecOps. I build secure systems and the tooling
        that makes the safe path the default path.
      </p>

      <h2>Expertise</h2>
      <ul className="cv-skills">
        {credits.map(([no, title, desc]) => (
          <li key={no}>
            <b>{title}</b> — {desc}
          </li>
        ))}
      </ul>

      <h2>Experience</h2>
      {jobsNewestFirst.map((milestone) => (
        <div className="cv-job" key={milestone.id}>
          <p className="cv-job-head">
            <b>{milestone.role}</b> · {milestone.org}
            <span className="cv-period">{milestone.period}</span>
          </p>
          <p className="cv-blurb">{milestone.blurb}</p>
          <ul>
            {flattenBullets(milestone).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2>Education</h2>
      <ul className="cv-edu">
        {orderedEducation.map((entry, index) => (
          <li key={index}>
            <b>{entry.degree}</b> — {entry.school}
            <span className="cv-period">{entry.years}</span>
          </li>
        ))}
      </ul>

      <h2>Toolbox</h2>
      <p className="cv-tools">{tools}</p>
    </section>
  )
}

export default CVSheet
