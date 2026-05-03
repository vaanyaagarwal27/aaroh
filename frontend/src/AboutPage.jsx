export default function AboutPage() {
  return (
    <main className="about-page">

      <div className="about-hero">
        <h1 className="about-hero-title">About Aaroh</h1>
        <p className="about-hero-sub">
          Court Judgment Intelligence Platform for Government Compliance
        </p>
      </div>

      <div className="about-body">

        <section className="about-section">
          <p className="about-lead">
            Court judgments arrive in CCMS as 30–50 page PDF documents. Officers must manually
            identify actionable directions, calculate deadlines, and track compliance — or face
            contempt of court for missed deadlines.
          </p>
          <p className="about-lead">
            Aaroh automates extraction while maintaining accountability through mandatory human
            verification.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">How It Works</h2>
          <ol className="about-steps">
            <li className="about-step">
              <div className="about-step-num">1</div>
              <div>
                <p className="about-step-label">Upload</p>
                <p className="about-step-desc">Court judgment PDFs are uploaded to the system</p>
              </div>
            </li>
            <li className="about-step">
              <div className="about-step-num">2</div>
              <div>
                <p className="about-step-label">Extract</p>
                <p className="about-step-desc">
                  AI identifies and classifies directions —{' '}
                  <span className="about-cat about-cat--red">Binding to Govt</span>{' '}
                  <span className="about-cat about-cat--blue">To Petitioner</span>{' '}
                  <span className="about-cat about-cat--gray">Observations</span>
                </p>
              </div>
            </li>
            <li className="about-step">
              <div className="about-step-num">3</div>
              <div>
                <p className="about-step-label">Verify</p>
                <p className="about-step-desc">
                  Officers review, correct, and approve extractions with full edit tracking
                </p>
              </div>
            </li>
            <li className="about-step">
              <div className="about-step-num">4</div>
              <div>
                <p className="about-step-label">Track</p>
                <p className="about-step-desc">
                  Dashboard shows urgency, deadlines, and action status
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Key Features</h2>
          <ul className="about-features">
            <li className="about-feature">
              <span className="about-feature-dot" />
              Three-category classification of court directions
            </li>
            <li className="about-feature">
              <span className="about-feature-dot" />
              Mandatory human verification with audit trail
            </li>
            <li className="about-feature">
              <span className="about-feature-dot" />
              Automatic deadline calculation and urgency tracking
            </li>
            <li className="about-feature">
              <span className="about-feature-dot" />
              Interim order detection for 24–48 hr response requirements
            </li>
          </ul>
        </section>

        <section className="about-etymology">
          <p>
            Named after the ascending note in Indian classical music,{' '}
            <em>Aaroh</em> represents the escalation from document to accountability.
          </p>
        </section>

      </div>
    </main>
  )
}
