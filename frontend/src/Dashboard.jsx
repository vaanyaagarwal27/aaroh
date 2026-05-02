import { useState, useMemo } from 'react'
import './Dashboard.css'

// ── Sample data ───────────────────────────────────────────────────────────────

const now = Date.now()
const daysAgo = d => new Date(now - d * 86400000).toISOString()

const SAMPLE_CASES = [
  {
    id: 'sample_1',
    verified_at: daysAgo(2),
    verification_stamp: 'Verified by Deputy Commissioner on 01 May 2026 at 10:30 AM',
    case_metadata: {
      case_number: 'WP/8234/2024',
      court_name:  'High Court of Karnataka',
      order_date:  '28 Apr 2026',
      order_type:  'INTERIM',
    },
    directions: [
      { verbatim_text: 'The State Government shall constitute an expert committee to review the environmental clearance granted for the project within the stipulated period.', category: 'BINDING_TO_GOVT', responsible_entity: 'State of Karnataka', original_timeline: '4 weeks', confidence_score: 'HIGH' },
      { verbatim_text: 'The Principal Secretary, Department of Forest and Environment shall file a compliance report before this Court.', category: 'BINDING_TO_GOVT', responsible_entity: 'Principal Secretary, Dept. of Forest & Environment', original_timeline: '6 weeks', confidence_score: 'HIGH' },
      { verbatim_text: 'The Karnataka State Pollution Control Board shall conduct an independent site inspection and submit findings.', category: 'BINDING_TO_GOVT', responsible_entity: 'Karnataka State Pollution Control Board', original_timeline: '8 weeks', confidence_score: 'MEDIUM' },
      { verbatim_text: 'The petitioner shall file detailed objections with supporting documents within the prescribed period.', category: 'TO_PETITIONER', responsible_entity: 'Petitioner', original_timeline: '2 weeks', confidence_score: 'HIGH' },
      { verbatim_text: 'The Court observes that environmental concerns raised by the petitioner merit serious consideration by the authorities.', category: 'OBSERVATION', responsible_entity: null, original_timeline: null, confidence_score: 'MEDIUM' },
    ],
    summary: { total_directions: 5, binding_to_govt: 3, to_petitioner: 1, observations: 1 },
    _default_status: 'Pending',
  },
  {
    id: 'sample_2',
    verified_at: daysAgo(5),
    verification_stamp: 'Verified by Deputy Commissioner on 28 Apr 2026 at 03:15 PM',
    case_metadata: {
      case_number: 'WP/9871/2024',
      court_name:  'High Court of Karnataka',
      order_date:  '25 Apr 2026',
      order_type:  'FINAL_DISPOSAL',
    },
    directions: [
      { verbatim_text: 'The Revenue Department shall process and disburse the pending compensation amounts to the affected landowners.', category: 'BINDING_TO_GOVT', responsible_entity: 'Revenue Department, Government of Karnataka', original_timeline: '3 months', confidence_score: 'HIGH' },
      { verbatim_text: 'The District Collector shall submit a compliance report detailing disbursement status to this Court.', category: 'BINDING_TO_GOVT', responsible_entity: 'District Collector, Bengaluru Rural', original_timeline: '4 months', confidence_score: 'HIGH' },
      { verbatim_text: 'Petitioners shall provide updated bank account details to the Revenue Department within two weeks.', category: 'TO_PETITIONER', responsible_entity: 'Petitioners', original_timeline: '2 weeks', confidence_score: 'HIGH' },
      { verbatim_text: 'The Court notes the undue delay in compensation disbursement and expects strict compliance.', category: 'OBSERVATION', responsible_entity: null, original_timeline: null, confidence_score: 'HIGH' },
    ],
    summary: { total_directions: 4, binding_to_govt: 2, to_petitioner: 1, observations: 1 },
    _default_status: 'In Progress',
  },
  {
    id: 'sample_3',
    verified_at: daysAgo(7),
    verification_stamp: 'Verified by Deputy Commissioner on 26 Apr 2026 at 11:00 AM',
    case_metadata: {
      case_number: 'CRL.P/4521/2024',
      court_name:  'High Court of Karnataka',
      order_date:  '24 Apr 2026',
      order_type:  'INTERIM',
    },
    directions: [
      { verbatim_text: 'The State shall file its counter-affidavit responding to the allegations made in the writ petition.', category: 'BINDING_TO_GOVT', responsible_entity: 'Government of Karnataka', original_timeline: '3 weeks', confidence_score: 'HIGH' },
      { verbatim_text: 'The petitioner shall serve a copy of the petition on all respondents and file proof of service.', category: 'TO_PETITIONER', responsible_entity: 'Petitioner', original_timeline: '1 week', confidence_score: 'HIGH' },
      { verbatim_text: 'This Court observes that the matter involves substantial questions of law requiring detailed consideration.', category: 'OBSERVATION', responsible_entity: null, original_timeline: null, confidence_score: 'MEDIUM' },
    ],
    summary: { total_directions: 3, binding_to_govt: 1, to_petitioner: 1, observations: 1 },
    _default_status: 'Completed',
  },
  {
    id: 'sample_4',
    verified_at: daysAgo(1),
    verification_stamp: 'Verified by Deputy Commissioner on 02 May 2026 at 09:45 AM',
    case_metadata: {
      case_number: 'WP/12456/2024',
      court_name:  'High Court of Karnataka',
      order_date:  '01 May 2026',
      order_type:  'INTERIM',
    },
    directions: [
      { verbatim_text: 'The Urban Development Authority shall halt all construction activity at the disputed site with immediate effect.', category: 'BINDING_TO_GOVT', responsible_entity: 'Bruhat Bengaluru Mahanagara Palike', original_timeline: 'Immediate', confidence_score: 'HIGH' },
      { verbatim_text: 'The Principal Secretary, Urban Development Department shall personally appear before this Court at the next hearing.', category: 'BINDING_TO_GOVT', responsible_entity: 'Principal Secretary, Urban Development', original_timeline: 'Next hearing date', confidence_score: 'HIGH' },
      { verbatim_text: 'The Commissioner, BBMP shall file an action-taken report on encroachments identified in the survey.', category: 'BINDING_TO_GOVT', responsible_entity: 'Commissioner, BBMP', original_timeline: '6 weeks', confidence_score: 'HIGH' },
      { verbatim_text: 'The Disaster Management Authority shall assess structural safety of the adjacent buildings.', category: 'BINDING_TO_GOVT', responsible_entity: 'Karnataka State Disaster Management Authority', original_timeline: '4 weeks', confidence_score: 'MEDIUM' },
      { verbatim_text: 'The petitioner shall submit a detailed survey map of the disputed land certified by a licensed surveyor.', category: 'TO_PETITIONER', responsible_entity: 'Petitioner', original_timeline: '3 weeks', confidence_score: 'HIGH' },
      { verbatim_text: 'The Court expresses serious concern over unauthorized constructions and expects immediate corrective action.', category: 'OBSERVATION', responsible_entity: null, original_timeline: null, confidence_score: 'HIGH' },
    ],
    summary: { total_directions: 6, binding_to_govt: 4, to_petitioner: 1, observations: 1 },
    _default_status: 'Pending',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed']

const STATUS_CLS = {
  'Pending':     'status--pending',
  'In Progress': 'status--progress',
  'Completed':   'status--done',
}

const CATEGORY_CLS = {
  BINDING_TO_GOVT: 'cat--red',
  TO_PETITIONER:   'cat--blue',
  OBSERVATION:     'cat--gray',
}
const CATEGORY_LABEL = {
  BINDING_TO_GOVT: 'Binding to Govt',
  TO_PETITIONER:   'To Petitioner',
  OBSERVATION:     'Observation',
}
const CONF_CLS = { HIGH: 'conf--high', MEDIUM: 'conf--medium', LOW: 'conf--low' }

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function loadStatuses() {
  try { return JSON.parse(localStorage.getItem('aaroh_statuses') ?? '{}') } catch { return {} }
}

function saveStatus(id, status) {
  try {
    const s = loadStatuses()
    s[id] = status
    localStorage.setItem('aaroh_statuses', JSON.stringify(s))
  } catch { /* ignore */ }
}

function loadAllCases() {
  let real = []
  try { real = JSON.parse(localStorage.getItem('aaroh_cases') ?? '[]') } catch { /* ignore */ }
  const statuses = loadStatuses()
  return [...SAMPLE_CASES, ...real].map(c => ({
    ...c,
    status: statuses[c.id] ?? c._default_status ?? c.status ?? 'Pending',
  }))
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ cas, onClose }) {
  const meta    = cas.case_metadata ?? {}
  const dirs    = cas.directions    ?? []
  const summary = cas.summary       ?? {}

  return (
    <div
      className="detail-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Case details"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="detail-modal">
        <div className="detail-modal-header">
          <div>
            <p className="detail-modal-label">Case Details</p>
            <p className="detail-modal-case">{meta.case_number ?? '—'}</p>
          </div>
          <button className="detail-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="detail-modal-body">
          {/* Metadata grid */}
          <div className="detail-meta-grid">
            {meta.court_name  && <div><span className="detail-meta-label">Court</span><span className="detail-meta-val">{meta.court_name}</span></div>}
            {meta.order_date  && <div><span className="detail-meta-label">Date of Order</span><span className="detail-meta-val">{meta.order_date}</span></div>}
            {meta.order_type  && <div><span className="detail-meta-label">Order Type</span><span className={`order-badge order-badge--${meta.order_type === 'FINAL_DISPOSAL' ? 'final' : 'interim'}`}>{meta.order_type.replace(/_/g, ' ')}</span></div>}
            {cas.verified_at  && <div><span className="detail-meta-label">Verified On</span><span className="detail-meta-val">{formatDate(cas.verified_at)}</span></div>}
          </div>

          {/* Stats row */}
          <div className="detail-stats">
            <div className="detail-stat"><span className="detail-stat-num">{summary.total_directions ?? dirs.length}</span><span className="detail-stat-label">Total</span></div>
            <div className="detail-stat detail-stat--red"><span className="detail-stat-num">{summary.binding_to_govt ?? 0}</span><span className="detail-stat-label">Binding to Govt</span></div>
            <div className="detail-stat detail-stat--blue"><span className="detail-stat-num">{summary.to_petitioner ?? 0}</span><span className="detail-stat-label">To Petitioner</span></div>
            <div className="detail-stat detail-stat--gray"><span className="detail-stat-num">{summary.observations ?? 0}</span><span className="detail-stat-label">Observations</span></div>
          </div>

          {/* Verification stamp */}
          {cas.verification_stamp && (
            <p className="detail-stamp">{cas.verification_stamp}</p>
          )}

          {/* Directions */}
          {dirs.length > 0 && (
            <div className="detail-dirs">
              <h3 className="detail-dirs-heading">Extracted Directions</h3>
              {dirs.map((d, i) => {
                const catCls  = CATEGORY_CLS[d.category]  ?? 'cat--gray'
                const catLbl  = CATEGORY_LABEL[d.category] ?? d.category
                const confCls = CONF_CLS[String(d.confidence_score).toUpperCase()] ?? 'conf--low'
                const confLbl = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }[String(d.confidence_score).toUpperCase()] ?? 'Low'
                return (
                  <div key={i} className={`detail-dir-card ${catCls}`}>
                    <div className="detail-dir-header">
                      <span className="detail-dir-num">#{i + 1}</span>
                      <span className={`cat-badge ${catCls}`}>{catLbl}</span>
                      <span className={`conf-badge ${confCls}`}>{confLbl}</span>
                    </div>
                    <p className="detail-dir-text">{d.verbatim_text}</p>
                    {(d.responsible_entity || d.original_timeline) && (
                      <div className="detail-dir-meta">
                        {d.responsible_entity && <span><strong>Entity:</strong> {d.responsible_entity}</span>}
                        {d.original_timeline  && <span><strong>Timeline:</strong> {d.original_timeline}</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [cases,      setCases]      = useState(loadAllCases)
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [detailCase, setDetailCase] = useState(null)

  function handleStatusChange(id, newStatus) {
    saveStatus(id, newStatus)
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
  }

  const filtered = useMemo(() => {
    return cases.filter(c => {
      const num = c.case_metadata?.case_number ?? ''
      const matchSearch = num.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [cases, search, statusFilter])

  return (
    <>
      {detailCase && <DetailModal cas={detailCase} onClose={() => setDetailCase(null)} />}

      <div className="dashboard">
        {/* Page header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Case Dashboard</h1>
            <p className="dash-subtitle">Approved judgments verified by your office</p>
          </div>
          <div className="dash-header-stats">
            <span className="dash-stat-chip">{cases.length} Total Cases</span>
            <span className="dash-stat-chip dash-stat-chip--pending">
              {cases.filter(c => c.status === 'Pending').length} Pending
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="dash-filters">
          <div className="dash-search-wrap">
            <svg className="dash-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="dash-search"
              type="search"
              placeholder="Search by case number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search cases"
            />
          </div>
          <select
            className="dash-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="dash-table-wrap">
          <table className="dash-table" aria-label="Approved cases">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Order Date</th>
                <th>Court</th>
                <th>Order Type</th>
                <th className="col-num">Binding Dirs</th>
                <th>Status</th>
                <th>Verified On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="dash-empty">
                    No cases match your filters
                  </td>
                </tr>
              ) : filtered.map(cas => {
                const meta   = cas.case_metadata ?? {}
                const isFinal = meta.order_type === 'FINAL_DISPOSAL'
                return (
                  <tr key={cas.id} className="dash-row">
                    <td>
                      <button
                        className="case-num-btn"
                        onClick={() => setDetailCase(cas)}
                      >
                        {meta.case_number ?? '—'}
                      </button>
                    </td>
                    <td className="col-date">{meta.order_date ?? '—'}</td>
                    <td className="col-court">{meta.court_name ?? '—'}</td>
                    <td>
                      <span className={`order-badge order-badge--${isFinal ? 'final' : 'interim'}`}>
                        {isFinal ? 'Final Disposal' : 'Interim'}
                      </span>
                    </td>
                    <td className="col-num">
                      <span className="binding-count">
                        {cas.summary?.binding_to_govt ?? cas.directions?.filter(d => d.category === 'BINDING_TO_GOVT').length ?? 0}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`status-select ${STATUS_CLS[cas.status] ?? ''}`}
                        value={cas.status}
                        onChange={e => handleStatusChange(cas.id, e.target.value)}
                        aria-label={`Status for ${meta.case_number}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="col-date">{formatDate(cas.verified_at)}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setDetailCase(cas)}
                        aria-label={`View details for ${meta.case_number}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="dash-footer-note">
          Showing {filtered.length} of {cases.length} cases
        </p>
      </div>
    </>
  )
}
