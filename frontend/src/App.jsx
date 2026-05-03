import { useState, useRef, useEffect } from 'react'
import './App.css'
import VerificationPage from './VerificationPage'
import Dashboard from './Dashboard'
import AboutPage from './AboutPage'
import Footer from './Footer'

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  BINDING_TO_GOVT: { label: 'Binding to Govt',  colorClass: 'cat--red'  },
  TO_PETITIONER:   { label: 'To Petitioner',     colorClass: 'cat--blue' },
  OBSERVATION:     { label: 'Observation',        colorClass: 'cat--gray' },
}

function confidenceTier(score) {
  const s = String(score).toUpperCase()
  if (s === 'HIGH')   return { label: 'High',   cls: 'conf--high'   }
  if (s === 'MEDIUM') return { label: 'Medium', cls: 'conf--medium' }
  return                     { label: 'Low',    cls: 'conf--low'    }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ScaleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <rect x="15" y="4" width="2" height="24" fill="currentColor" rx="1"/>
      <rect x="6" y="28" width="20" height="2" fill="currentColor" rx="1"/>
      <path d="M8 12 L16 6 L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <ellipse cx="9" cy="18" rx="5" ry="2.5" fill="currentColor" opacity="0.7"/>
      <ellipse cx="23" cy="18" rx="5" ry="2.5" fill="currentColor" opacity="0.7"/>
      <line x1="8" y1="12" x2="9" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="12" x2="23" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function NavBar({ activeView, onNavigate }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <div className="brand" role="button" tabIndex={0} onClick={() => onNavigate('upload')} onKeyDown={e => (e.key === 'Enter') && onNavigate('upload')} style={{ cursor: 'pointer' }}>
          <span className="brand-icon"><ScaleIcon /></span>
          <div className="brand-text">
            <span className="brand-name">AAROH</span>
            <span className="brand-sub">Court Judgment Intelligence Platform</span>
          </div>
        </div>
        <ul className="nav-links" role="list">
          <li>
            <button
              className={`nav-link ${activeView === 'upload' || activeView === 'verify' ? 'nav-link--active' : ''}`}
              onClick={() => onNavigate('upload')}
            >
              Upload
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activeView === 'dashboard' ? 'nav-link--active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activeView === 'about' ? 'nav-link--active' : ''}`}
              onClick={() => onNavigate('about')}
            >
              About
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

function UploadSection({ file, loading, onFileChange, onSubmit, inputRef }) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') onFileChange(dropped)
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="upload-card card">
        <form onSubmit={onSubmit}>
          <div
            className={`dropzone ${dragging ? 'dropzone--drag' : ''} ${file ? 'dropzone--ready' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Click or drag to upload PDF"
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={e => onFileChange(e.target.files[0] ?? null)}
              aria-hidden="true"
            />
            <div className="dropzone-content">
              {file ? (
                <>
                  <span className="dropzone-icon dropzone-icon--ready" aria-hidden="true">✓</span>
                  <span className="dropzone-filename">{file.name}</span>
                  <span className="dropzone-change">Click to change file</span>
                </>
              ) : (
                <>
                  <span className="dropzone-icon" aria-hidden="true">↑</span>
                  <span className="dropzone-primary">Drag & drop your PDF here</span>
                  <span className="dropzone-secondary">or click to browse files</span>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={!file || loading}
            aria-busy={loading}
          >
            {loading ? (
              <><span className="btn-spinner" aria-hidden="true" /> Processing Judgment…</>
            ) : (
              'Extract Directions'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

function LoadingState() {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card card">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-title">Processing Judgment…</p>
        <p className="loading-sub">
          Gemini is analyzing the legal document.<br />This typically takes 10–15 seconds.
        </p>
        <div className="loading-steps" aria-hidden="true">
          <span className="step step--done">Uploading PDF</span>
          <span className="step-arrow">›</span>
          <span className="step step--active">AI Extraction</span>
          <span className="step-arrow">›</span>
          <span className="step">Structuring Data</span>
        </div>
      </div>
    </div>
  )
}

function MetadataBanner({ meta }) {
  if (!meta) return null

  const orderTypeCls = meta.order_type === 'FINAL_DISPOSAL' ? 'order-badge--final' : 'order-badge--interim'

  const partiesStr = !meta.parties
    ? null
    : typeof meta.parties === 'string'
      ? (meta.parties.length > 150 ? meta.parties.slice(0, 150).trimEnd() + '…' : meta.parties)
      : [meta.parties?.petitioner, meta.parties?.respondent].filter(Boolean).join(' vs ') || null

  return (
    <div className="metadata-banner">
      <div className="metadata-banner-top">
        <div>
          <p className="metadata-label">Case Number</p>
          <p className="metadata-case-number">{meta.case_number ?? '—'}</p>
        </div>
        {meta.order_type && (
          <span className={`order-badge ${orderTypeCls}`}>{meta.order_type.replace(/_/g, ' ')}</span>
        )}
      </div>
      <div className="metadata-grid">
        {meta.court_name && (
          <div className="metadata-cell">
            <span className="metadata-cell-label">Court</span>
            <span className="metadata-cell-value">{meta.court_name}</span>
          </div>
        )}
        {meta.order_date && (
          <div className="metadata-cell">
            <span className="metadata-cell-label">Date of Order</span>
            <span className="metadata-cell-value">{meta.order_date}</span>
          </div>
        )}
        {partiesStr && (
          <div className="metadata-cell metadata-cell--wide">
            <span className="metadata-cell-label">Parties</span>
            <span className="metadata-cell-value">{partiesStr}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsGrid({ summary }) {
  if (!summary) return null
  return (
    <div className="stats-grid" role="region" aria-label="Summary statistics">
      <div className="stat-card">
        <span className="stat-num">{summary.total_directions ?? 0}</span>
        <span className="stat-label">Total Directions</span>
      </div>
      <div className="stat-card stat-card--red">
        <span className="stat-num">{summary.binding_to_govt ?? 0}</span>
        <span className="stat-label">Binding to Govt</span>
      </div>
      <div className="stat-card stat-card--blue">
        <span className="stat-num">{summary.to_petitioner ?? 0}</span>
        <span className="stat-label">To Petitioner</span>
      </div>
      <div className="stat-card stat-card--gray">
        <span className="stat-num">{summary.observations ?? 0}</span>
        <span className="stat-label">Observations</span>
      </div>
    </div>
  )
}

function DirectionCard({ direction, index }) {
  const { verbatim_text, category, responsible_entity, original_timeline, confidence_score } = direction
  const tier  = confidenceTier(confidence_score ?? '')
  const meta  = CATEGORY_META[category] ?? { label: category, colorClass: 'cat--gray' }

  return (
    <article className={`direction-card ${meta.colorClass}`} aria-label={`Direction ${index + 1}`}>
      <div className="dir-card-header">
        <span className="dir-index">#{index + 1}</span>
        <span className={`cat-badge ${meta.colorClass}`}>{meta.label}</span>
        <span className={`conf-badge ${tier.cls}`}>{tier.label}</span>
      </div>
      <p className="dir-text">{verbatim_text}</p>
      {(responsible_entity || original_timeline) && (
        <div className="dir-footer">
          {responsible_entity && (
            <span className="dir-meta-item">
              <span className="dir-meta-label">Entity</span>
              {responsible_entity}
            </span>
          )}
          {original_timeline && (
            <span className="dir-meta-item">
              <span className="dir-meta-label">Timeline</span>
              {original_timeline}
            </span>
          )}
        </div>
      )}
    </article>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [result, setResult]   = useState(null)
  const [pdfUrl, setPdfUrl]   = useState(null)
  const [view,   setView]     = useState('upload')   // 'upload' | 'verify'
  const inputRef              = useRef(null)
  const resultsRef            = useRef(null)

  // Scroll to top on every view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  // Revoke object URL when leaving verify view to free memory
  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl) }
  }, [pdfUrl])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append('pdf', file)

      const res  = await fetch('http://localhost:3000/api/extract', { method: 'POST', body: form })
      const json = await res.json()
      console.log('API response:', json)

      if (!res.ok || !json.success) throw new Error(json.error ?? `Server error ${res.status}`)

      // Create object URL for the PDF viewer before switching views
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
      setResult(json)
      setView('verify')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleReject() {
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null) }
    setResult(null)
    setFile(null)
    setError(null)
    setView('upload')
  }

  function handleNavigate(target) {
    if (target === 'upload' && view === 'verify') { handleReject(); return }
    if (target === 'upload') { setView('upload'); return }
    if (target === 'dashboard') { setView('dashboard'); return }
    if (target === 'about') { setView('about') }
  }

  const meta       = result?.data?.case_metadata
  const directions = result?.data?.directions ?? []
  const summary    = result?.summary

  if (view === 'verify' && result) {
    return (
      <div className="app">
        <NavBar activeView="verify" onNavigate={handleNavigate} />
        <VerificationPage
          pdfUrl={pdfUrl}
          result={result}
          onReject={handleReject}
          onApprove={() => {
            if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null) }
            setResult(null); setFile(null)
            setView('dashboard')
          }}
        />
        <Footer />
      </div>
    )
  }

  if (view === 'dashboard') {
    return (
      <div className="app">
        <NavBar activeView="dashboard" onNavigate={handleNavigate} />
        <Dashboard />
        <Footer />
      </div>
    )
  }

  if (view === 'about') {
    return (
      <div className="app">
        <NavBar activeView="about" onNavigate={handleNavigate} />
        <AboutPage />
        <Footer />
      </div>
    )
  }

  return (
    <div className="app">
      <NavBar activeView="upload" onNavigate={handleNavigate} />

      <div className="upload-hero">
        <h1 className="upload-hero-title">Court Judgment Intelligence Platform</h1>
        <p className="upload-hero-sub">Transform 50-page judgments into verified action plans in minutes</p>
        <ul className="upload-hero-points">
          <li>AI-powered extraction with human verification</li>
          <li>Automatic urgency tracking and deadline calculation</li>
          <li>Complete audit trail for accountability</li>
        </ul>
      </div>

      <main className="app-main">
        <UploadSection
          file={file}
          loading={loading}
          onFileChange={setFile}
          onSubmit={handleSubmit}
          inputRef={inputRef}
        />

        {loading && <LoadingState />}

        {error && (
          <div className="error-banner" role="alert">
            <span className="error-icon" aria-hidden="true">⚠</span>
            <div>
              <strong>Extraction Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="results" ref={resultsRef}>
            <MetadataBanner meta={meta} />
            <StatsGrid summary={summary} />

            {directions.length > 0 && (
              <section aria-labelledby="directions-heading">
                <div className="directions-header">
                  <h2 id="directions-heading" className="section-heading">
                    Extracted Directions
                  </h2>
                  <span className="directions-count">{directions.length} directions found</span>
                </div>
                <div className="directions-list">
                  {directions.map((d, i) => (
                    <DirectionCard key={i} direction={d} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
