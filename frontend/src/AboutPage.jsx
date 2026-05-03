export default function AboutPage() {
  return (
    <main className="about-page">

      {/* ── 1. Hero ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-stat">45 min → 5 min</div>
          <p className="about-hero-stat-label">Time to process one court judgment</p>
          <p className="about-hero-body">
            Every year, thousands of court orders go untracked. Officers face contempt
            charges not for negligence — but because no tool existed to help them.
            Aaroh changes that.
          </p>
        </div>
      </section>

      {/* ── 2. How It Works ── */}
      <section className="about-section about-section--white">
        <div className="about-container">
          <h2 className="about-section-title">How It Works</h2>
          <div className="about-steps-grid">
            <div className="about-step-card">
              <div className="about-step-num">1</div>
              <p className="about-step-label">Upload</p>
              <p className="about-step-desc">Court judgment PDFs are uploaded to the system</p>
            </div>
            <div className="about-step-card">
              <div className="about-step-num">2</div>
              <p className="about-step-label">Extract</p>
              <p className="about-step-desc">
                AI identifies and classifies directions —{' '}
                <span className="about-cat about-cat--red">Binding to Govt</span>{' '}
                <span className="about-cat about-cat--blue">To Petitioner</span>{' '}
                <span className="about-cat about-cat--gray">Observations</span>
              </p>
            </div>
            <div className="about-step-card">
              <div className="about-step-num">3</div>
              <p className="about-step-label">Verify</p>
              <p className="about-step-desc">Officers review, correct, and approve extractions with full edit tracking</p>
            </div>
            <div className="about-step-card">
              <div className="about-step-num">4</div>
              <p className="about-step-label">Track</p>
              <p className="about-step-desc">Dashboard shows urgency, deadlines, and action status</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Key Features ── */}
      <section className="about-section about-section--blue">
        <div className="about-container">
          <h2 className="about-section-title">Key Features</h2>
          <div className="about-features-grid">
            <div className="about-feature-card">
              <span className="about-feature-icon">🏛️</span>
              <p className="about-feature-title">Three-Category Classification</p>
              <p className="about-feature-desc">Binding to Govt, To Petitioner, and Observations — structured automatically</p>
            </div>
            <div className="about-feature-card">
              <span className="about-feature-icon">✅</span>
              <p className="about-feature-title">Mandatory Human Verification</p>
              <p className="about-feature-desc">Every extraction is reviewed and approved by an officer before saving</p>
            </div>
            <div className="about-feature-card">
              <span className="about-feature-icon">⏱️</span>
              <p className="about-feature-title">Deadline &amp; Urgency Tracking</p>
              <p className="about-feature-desc">Automatic compliance deadlines and colour-coded urgency across all cases</p>
            </div>
            <div className="about-feature-card">
              <span className="about-feature-icon">⚡</span>
              <p className="about-feature-title">Interim Order Detection</p>
              <p className="about-feature-desc">Interim orders are flagged immediately for 24–48 hr response</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. The Name ── */}
      <section className="about-name-section">
        <div className="about-container">
          <blockquote className="about-name-quote">
            <em>Aaroh (आरोह)</em> — the ascending scale in Indian classical music.
            From document to accountability, every step upward.
          </blockquote>
        </div>
      </section>

    </main>
  )
}
