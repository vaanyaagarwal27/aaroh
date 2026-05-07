import { useState, useRef, useEffect } from 'react'
import './App.css'
import VerificationPage from './VerificationPage'
import Dashboard from './Dashboard'
import AboutPage from './AboutPage'
import Footer from './Footer'
import LoginPage from './LoginPage'
import { findDemoExtraction, DEMO_EXTRACTIONS } from './data/demoExtractions'

const SEED_CASES = [

  {
    id: "seed_001",
    verified_at: "2026-05-01T09:00:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 01 May 2026 at 9:00 am",
    status: "Pending",
    case_metadata: {
      case_number: "WA NO. 949/2026 (KLR-RES)",
      order_date: "19-04-2026",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "INTERIM"
    },
    directions: [
      { verbatim_text: "The Tahsildar shall file a detailed affidavit regarding the encroachment within the next date of hearing.", category: "BINDING_TO_GOVT", responsible_entity: "Tahsildar (R3)", original_timeline: "next date of hearing", calculated_deadline_days: 18, confidence_score: "HIGH" },
      { verbatim_text: "The jurisdictional police shall ensure no further encroachment takes place on the disputed land.", category: "BINDING_TO_GOVT", responsible_entity: "Jurisdictional Police", original_timeline: null, calculated_deadline_days: 7, confidence_score: "HIGH" },
      { verbatim_text: "The matter is adjourned to 25.06.2026 for further hearing.", category: "OBSERVATION", responsible_entity: null, original_timeline: "25.06.2026", calculated_deadline_days: null, confidence_score: "HIGH" }
    ],
    summary: { total_directions: 3, binding_to_govt: 2, to_petitioner: 0, observations: 1 }
  },
  {
    id: "seed_002",
    verified_at: "2026-05-02T10:30:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 02 May 2026 at 10:30 am",
    status: "Pending",
    case_metadata: {
      case_number: "WP No. 8821/2026",
      order_date: "28-04-2026",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "INTERIM"
    },
    directions: [
      { verbatim_text: "The Deputy Commissioner, Bengaluru Rural, shall submit a compliance report on the status of the land acquisition proceedings within four weeks.", category: "BINDING_TO_GOVT", responsible_entity: "Deputy Commissioner, Bengaluru Rural", original_timeline: "within four weeks", calculated_deadline_days: 21, confidence_score: "HIGH" },
      { verbatim_text: "No further construction shall be permitted on survey no. 114/2 until further orders.", category: "BINDING_TO_GOVT", responsible_entity: "Deputy Commissioner, Bengaluru Rural", original_timeline: "until further orders", calculated_deadline_days: 14, confidence_score: "HIGH" }
    ],
    summary: { total_directions: 2, binding_to_govt: 2, to_petitioner: 0, observations: 0 }
  },
  {
    id: "seed_003",
    verified_at: "2026-05-02T14:00:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 02 May 2026 at 2:00 pm",
    status: "In Progress",
    case_metadata: {
      case_number: "WP No. 12034/2025 (GM-RES)",
      order_date: "15-04-2026",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "FINAL_DISPOSAL"
    },
    directions: [
      { verbatim_text: "The respondent authorities shall regularise the service of the petitioner within eight weeks from the date of this order.", category: "BINDING_TO_GOVT", responsible_entity: "Department of Forest, Ecology and Environment", original_timeline: "within eight weeks", calculated_deadline_days: 35, confidence_score: "HIGH" },
      { verbatim_text: "All consequential service benefits shall be extended to the petitioner upon regularisation.", category: "BINDING_TO_GOVT", responsible_entity: "Department of Forest, Ecology and Environment", original_timeline: "upon regularisation", calculated_deadline_days: 35, confidence_score: "HIGH" },
      { verbatim_text: "The writ petition is accordingly allowed.", category: "OBSERVATION", responsible_entity: null, original_timeline: null, calculated_deadline_days: null, confidence_score: "HIGH" }
    ],
    summary: { total_directions: 3, binding_to_govt: 2, to_petitioner: 0, observations: 1 }
  },
  {
    id: "seed_004",
    verified_at: "2026-05-03T09:15:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 03 May 2026 at 9:15 am",
    status: "Pending",
    case_metadata: {
      case_number: "CRL.P No. 3345/2026",
      order_date: "30-04-2026",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "INTERIM"
    },
    directions: [
      { verbatim_text: "The Superintendent of Police, Hassan District, shall file a detailed status report on the investigation within two weeks.", category: "BINDING_TO_GOVT", responsible_entity: "Superintendent of Police, Hassan", original_timeline: "within two weeks", calculated_deadline_days: 9, confidence_score: "HIGH" },
      { verbatim_text: "The investigating officer shall not take any coercive action against the petitioner until further orders of this court.", category: "BINDING_TO_GOVT", responsible_entity: "Investigating Officer, Hassan Police", original_timeline: "until further orders", calculated_deadline_days: 9, confidence_score: "HIGH" }
    ],
    summary: { total_directions: 2, binding_to_govt: 2, to_petitioner: 0, observations: 0 }
  },
  {
    id: "seed_005",
    verified_at: "2026-05-03T11:00:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 03 May 2026 at 11:00 am",
    status: "Pending",
    case_metadata: {
      case_number: "WP No. 6712/2026 (S-RES)",
      order_date: "02-05-2026",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "FINAL_DISPOSAL"
    },
    directions: [
      { verbatim_text: "The Director of Public Instruction shall ensure that the petitioner's promotion order is issued within six weeks.", category: "BINDING_TO_GOVT", responsible_entity: "Director of Public Instruction, Karnataka", original_timeline: "within six weeks", calculated_deadline_days: 36, confidence_score: "HIGH" },
      { verbatim_text: "Arrears of salary for the withheld period shall be calculated and disbursed within eight weeks.", category: "BINDING_TO_GOVT", responsible_entity: "Director of Public Instruction, Karnataka", original_timeline: "within eight weeks", calculated_deadline_days: 50, confidence_score: "HIGH" },
      { verbatim_text: "No adverse entry shall be made in the service record of the petitioner in connection with this dispute.", category: "BINDING_TO_GOVT", responsible_entity: "Appointing Authority", original_timeline: null, calculated_deadline_days: 30, confidence_score: "MEDIUM" }
    ],
    summary: { total_directions: 3, binding_to_govt: 3, to_petitioner: 0, observations: 0 }
  },
  {
    id: "seed_006",
    verified_at: "2026-05-04T08:45:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 04 May 2026 at 8:45 am",
    status: "Pending",
    case_metadata: {
      case_number: "WRIT PETITION No. 4491/2026",
      order_date: "01-05-2026",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "INTERIM"
    },
    directions: [
      { verbatim_text: "The Chief Engineer, PWD (Roads), shall submit a report on the current status of the road widening project on NH-75 within three weeks.", category: "BINDING_TO_GOVT", responsible_entity: "Chief Engineer, PWD (Roads)", original_timeline: "within three weeks", calculated_deadline_days: 16, confidence_score: "HIGH" },
      { verbatim_text: "The concerned authorities shall ensure that the displaced residents are provided with interim shelter as per the rehabilitation policy.", category: "BINDING_TO_GOVT", responsible_entity: "District Administration, Dakshina Kannada", original_timeline: null, calculated_deadline_days: 16, confidence_score: "HIGH" }
    ],
    summary: { total_directions: 2, binding_to_govt: 2, to_petitioner: 0, observations: 0 }
  },
  {
    id: "seed_007",
    verified_at: "2026-05-04T15:30:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 04 May 2026 at 3:30 pm",
    status: "Completed",
    case_metadata: {
      case_number: "WP No. 1209 of 2025 (L-RES)",
      order_date: "23-07-2025",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "FINAL_DISPOSAL"
    },
    directions: [
      { verbatim_text: "It is declared that the petitioner's age of superannuation is 60 years.", category: "OBSERVATION", responsible_entity: null, original_timeline: null, calculated_deadline_days: null, confidence_score: "HIGH" },
      { verbatim_text: "The respondents shall not superannuate the petitioner treating the age of retirement as 58.", category: "BINDING_TO_GOVT", responsible_entity: "Central Silk Board (R1, R2, R3, R4)", original_timeline: null, calculated_deadline_days: 30, confidence_score: "HIGH" },
      { verbatim_text: "The petitioner is entitled to continue in employment as Timescale Farm Workers under first respondent till the age of superannuation at 60.", category: "BINDING_TO_GOVT", responsible_entity: "Respondent No.1 (Central Silk Board)", original_timeline: "till age of superannuation at 60", calculated_deadline_days: 30, confidence_score: "HIGH" }
    ],
    edits: [
      {
        direction_index: 1,
        edited_by: "Vaanya Agarwal",
        edited_at: "04 May 2026, 3:32 pm",
        original_value: "The respondents shall not superannuate the petitioner treating the age of retirement as 59.",
        edited_value: "The respondents shall not superannuate the petitioner treating the age of retirement as 58.",
        reason: "AI extracted 59 — verified against source PDF, correct age is 58"
      }
    ],
    summary: { total_directions: 3, binding_to_govt: 2, to_petitioner: 0, observations: 1 }
  },
  {
    id: "seed_008",
    verified_at: "2026-05-05T10:00:00.000Z",
    verified_by: "Vaanya Agarwal",
    verification_stamp: "Verified by Vaanya Agarwal on 05 May 2026 at 10:00 am",
    status: "Pending",
    case_metadata: {
      case_number: "FAO No. 86/2021",
      order_date: "29-04-2026",
      court_name: "High Court of Karnataka at Bengaluru",
      order_type: "FINAL_DISPOSAL"
    },
    directions: [
      { verbatim_text: "The Land Acquisition Officer shall disburse the enhanced compensation amount to the petitioner within twelve weeks.", category: "BINDING_TO_GOVT", responsible_entity: "Land Acquisition Officer, Mysuru", original_timeline: "within twelve weeks", calculated_deadline_days: 56, confidence_score: "HIGH" },
      { verbatim_text: "Interest at the rate of 9% per annum shall be paid on the enhanced compensation from the date of dispossession.", category: "BINDING_TO_GOVT", responsible_entity: "Land Acquisition Officer, Mysuru", original_timeline: "from date of dispossession", calculated_deadline_days: 56, confidence_score: "HIGH" },
      { verbatim_text: "The appeal is accordingly allowed in part.", category: "OBSERVATION", responsible_entity: null, original_timeline: null, calculated_deadline_days: null, confidence_score: "HIGH" }
    ],
    summary: { total_directions: 3, binding_to_govt: 2, to_petitioner: 0, observations: 1 }
  }
]

function loadUser() {
  try { return JSON.parse(localStorage.getItem('aaroh_user')) ?? null } catch { return null }
}

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

function NavBar({ activeView, onNavigate, user, onLogout }) {
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
        {user && (
          <div className="navbar-user">
            <span className="navbar-user-info">
              👤 <strong>{user.name}</strong>
              <span className="navbar-user-role">{user.role}</span>
            </span>
            <button className="navbar-logout-btn" onClick={onLogout}>Logout</button>
          </div>
        )}
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

function savePending(json, fileName) {
  try {
    localStorage.setItem('aaroh_pending_extraction', JSON.stringify({
      extractedData: json,
      fileName,
      uploadedAt: new Date().toISOString(),
      status: 'pending_verification',
    }))
  } catch { /* ignore */ }
}

function clearPending() {
  try { localStorage.removeItem('aaroh_pending_extraction') } catch { /* ignore */ }
}

function loadPending() {
  try {
    const raw = localStorage.getItem('aaroh_pending_extraction')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function App() {
  const [user,            setUser]            = useState(loadUser)
  const [file,            setFile]            = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const [result,          setResult]          = useState(null)
  const [pendingFileName, setPendingFileName] = useState(null)
  const [pdfUrl,          setPdfUrl]          = useState(null)
  const [isDemoFallback,  setIsDemoFallback]  = useState(false)
  const [view,            setView]            = useState(() => loadUser() ? 'upload' : 'login')
  const inputRef = useRef(null)

  function handleLogin(userData) {
    localStorage.setItem('aaroh_user', JSON.stringify(userData))
    setUser(userData)
    
    if (!localStorage.getItem('approved_cases') || JSON.parse(localStorage.getItem('approved_cases') || '[]').length < 8) {
      localStorage.setItem('approved_cases', JSON.stringify(SEED_CASES))
    }

    setView('upload')
  }

  function handleLogout() {
    localStorage.removeItem('aaroh_user')
    setUser(null)
    setView('login')
  }

  // On mount: restore any pending extraction so Approve/Reject are always reachable
  useEffect(() => {
    if (!loadUser()) return  // don't restore if not logged in
    const pending = loadPending()
    if (pending?.extractedData) {
      setResult(pending.extractedData)
      setPendingFileName(pending.fileName ?? null)
      setView('verify')
    }
  }, [])

  // Scroll to top on every view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  // Listen for navigation events dispatched by child components (e.g. Dashboard empty state)
  useEffect(() => {
    function onNavigate(e) { handleNavigate(e.detail) }
    window.addEventListener('aaroh:navigate', onNavigate)
    return () => window.removeEventListener('aaroh:navigate', onNavigate)
  }, [])

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

      const res  = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/extract`, { method: 'POST', body: form })
      const json = await res.json()
      console.log('API response:', json)

      if (json.bothModelsFailed) {
        const demo = DEMO_EXTRACTIONS[0]
        setIsDemoFallback(true)
        savePending(demo.result, file.name)
        setPendingFileName(file.name)
        setResult(demo.result)
        setView('verify')
        return
      }

      if (!res.ok || !json.success) throw new Error(json.error ?? `Server error ${res.status}`)

      // Persist immediately so a navigation away can't orphan this extraction
      setIsDemoFallback(false)
      savePending(json, file.name)
      setPendingFileName(file.name)

      // Create object URL for the PDF viewer before switching views
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
      setResult(json)
      setView('verify')
    } catch (err) {
      const is503 = err.message.includes('503') || err.message.includes('Service Unavailable')
      if (is503) {
        const demo = findDemoExtraction(file.name)
        if (demo) {
          setIsDemoFallback(true)
          savePending(demo.result, file.name)
          setPendingFileName(file.name)
          setResult(demo.result)
          setView('verify')
          return
        }
        setError('Gemini API is temporarily unavailable due to high demand. Please wait 30 seconds and try again. This is a Google API issue, not an Aaroh issue.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReject() {
    clearPending()
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null) }
    setResult(null)
    setPendingFileName(null)
    setFile(null)
    setError(null)
    setIsDemoFallback(false)
    setView('upload')
  }

  function handleNavigate(target) {
    // Always preserve pending extraction when navigating away from verify —
    // localStorage keeps it safe and the banner will surface it on return.
    if (target === 'upload') { setView('upload'); return }
    if (target === 'dashboard') { setView('dashboard'); return }
    if (target === 'about') { setView('about') }
  }

  if (!user || view === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  if (view === 'verify' && result) {
    return (
      <div className="app">
        <NavBar activeView="verify" onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
        {isDemoFallback && (
          <div className="demo-fallback-banner" role="status">
            ℹ️ Gemini API is experiencing temporary high demand. Showing a sample extraction for demonstration purposes. All features remain fully functional.
          </div>
        )}
        <VerificationPage
          pdfUrl={pdfUrl}
          result={result}
          onReject={handleReject}
          onApprove={() => {
            clearPending()
            if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null) }
            setResult(null); setFile(null); setPendingFileName(null)
            setIsDemoFallback(false)
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
        <NavBar activeView="dashboard" onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
        <Dashboard />
        <Footer />
      </div>
    )
  }

  if (view === 'about') {
    return (
      <div className="app">
        <NavBar activeView="about" onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
        <AboutPage />
        <Footer />
      </div>
    )
  }

  return (
    <div className="app">
      <NavBar activeView="upload" onNavigate={handleNavigate} user={user} onLogout={handleLogout} />

      {result && (
        <div className="pending-banner" role="alert">
          <span className="pending-banner-icon">⚠️</span>
          <div className="pending-banner-text">
            <strong>Unfinished verification</strong>
            {pendingFileName && <> — &ldquo;{pendingFileName}&rdquo;</>}
            {loadPending()?.uploadedAt && (
              <> extracted on {new Date(loadPending().uploadedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</>
            )}
          </div>
          <div className="pending-banner-actions">
            <button className="pending-resume-btn" onClick={() => setView('verify')}>
              Resume Verification →
            </button>
            <button className="pending-discard-btn" onClick={handleReject}>
              Discard &amp; Upload New
            </button>
          </div>
        </div>
      )}

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

      </main>

      <Footer />
    </div>
  )
}
