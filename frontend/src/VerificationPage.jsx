import { useState } from 'react'
import './VerificationPage.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'BINDING_TO_GOVT', label: 'Binding to Govt' },
  { value: 'TO_PETITIONER',   label: 'To Petitioner'   },
  { value: 'OBSERVATION',     label: 'Observation'     },
]

const ORDER_TYPE_OPTIONS = [
  { value: 'INTERIM',        label: 'Interim'        },
  { value: 'FINAL_DISPOSAL', label: 'Final Disposal' },
]

const CATEGORY_CLS = {
  BINDING_TO_GOVT: 'cat--red',
  TO_PETITIONER:   'cat--blue',
  OBSERVATION:     'cat--gray',
}

function confidenceTier(score) {
  const s = String(score).toUpperCase()
  if (s === 'HIGH')   return { label: 'High',   cls: 'conf--high'   }
  if (s === 'MEDIUM') return { label: 'Medium', cls: 'conf--medium' }
  return                     { label: 'Low',    cls: 'conf--low'    }
}

// ── PDF Modal ─────────────────────────────────────────────────────────────────

function PdfModal({ pdfUrl, onClose }) {
  return (
    <div
      className="pdf-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Source PDF"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="pdf-modal">
        <div className="pdf-modal-header">
          <span className="pdf-modal-title">Source Document</span>
          <button className="pdf-modal-close" onClick={onClose} aria-label="Close PDF viewer">
            ✕
          </button>
        </div>
        <div className="pdf-modal-body">
          <iframe
            src={pdfUrl}
            title="Judgment PDF"
            className="pdf-modal-iframe"
            aria-label="Uploaded PDF judgment"
          />
        </div>
      </div>
    </div>
  )
}

// ── "View in PDF" button ──────────────────────────────────────────────────────

function PdfBtn({ onClick }) {
  return (
    <button
      className="pdf-source-btn"
      onClick={onClick}
      title="View source PDF"
      aria-label="View source in PDF"
      type="button"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
      View in PDF
    </button>
  )
}

// ── Editable direction card ───────────────────────────────────────────────────

function DirectionCard({ dir, index, onChange, onViewPdf }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(null)

  function startEdit() { setDraft({ ...dir }); setEditing(true) }
  function cancelEdit() { setDraft(null); setEditing(false) }
  function saveEdit()  { onChange(index, draft); setEditing(false); setDraft(null) }

  const current  = editing ? draft : dir
  const tier     = confidenceTier(current.confidence_score ?? '')
  const catCls   = CATEGORY_CLS[current.category] ?? 'cat--gray'
  const catLabel = CATEGORY_OPTIONS.find(o => o.value === current.category)?.label ?? current.category

  return (
    <article className={`vdir-card ${catCls} ${editing ? 'vdir-card--editing' : ''}`}>
      <div className="vdir-header">
        <span className="vdir-index">#{index + 1}</span>

        {editing ? (
          <select
            className="vdir-cat-select"
            value={draft.category}
            onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
            aria-label="Category"
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <span className={`cat-badge ${catCls}`}>{catLabel}</span>
        )}

        <span className={`conf-badge ${tier.cls}`}>{tier.label}</span>

        <div className="vdir-actions">
          <PdfBtn onClick={onViewPdf} />
          {editing ? (
            <>
              <button className="vdir-btn vdir-btn--save"   onClick={saveEdit}>Save</button>
              <button className="vdir-btn vdir-btn--cancel" onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <button className="vdir-btn vdir-btn--edit" onClick={startEdit}>Edit</button>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          className="vdir-textarea"
          value={draft.verbatim_text}
          onChange={e => setDraft(d => ({ ...d, verbatim_text: e.target.value }))}
          rows={5}
          autoFocus
          aria-label="Direction text"
        />
      ) : (
        <p className="vdir-text">{current.verbatim_text}</p>
      )}

      {(editing || current.responsible_entity || current.original_timeline) && (
        <div className="vdir-footer">
          <div className="vdir-field">
            <span className="vdir-field-label">Responsible Entity</span>
            {editing ? (
              <input
                className="vdir-input"
                type="text"
                value={draft.responsible_entity ?? ''}
                onChange={e => setDraft(d => ({ ...d, responsible_entity: e.target.value }))}
                placeholder="e.g. State of Maharashtra"
              />
            ) : (
              <span className="vdir-field-value">{current.responsible_entity || '—'}</span>
            )}
          </div>
          <div className="vdir-field">
            <span className="vdir-field-label">Timeline</span>
            {editing ? (
              <input
                className="vdir-input"
                type="text"
                value={draft.original_timeline ?? ''}
                onChange={e => setDraft(d => ({ ...d, original_timeline: e.target.value }))}
                placeholder="e.g. 4 weeks, 3 months"
              />
            ) : (
              <span className="vdir-field-value">{current.original_timeline || '—'}</span>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VerificationPage({ pdfUrl, result, onReject }) {
  const rawMeta = result?.data?.case_metadata ?? {}
  const rawDirs = result?.data?.directions    ?? []
  const summary = result?.summary

  const [meta,       setMeta]       = useState({
    case_number: rawMeta.case_number ?? '',
    order_date:  rawMeta.order_date  ?? '',
    court_name:  rawMeta.court_name  ?? '',
    order_type:  rawMeta.order_type  ?? 'INTERIM',
  })
  const [directions, setDirections] = useState(rawDirs)
  const [pdfOpen,    setPdfOpen]    = useState(false)
  const [approved,   setApproved]   = useState(false)
  const [saving,     setSaving]     = useState(false)

  function updateDirection(index, updated) {
    setDirections(prev => prev.map((d, i) => i === index ? { ...d, ...updated } : d))
  }

  function handleApprove() {
    setSaving(true)
    const now     = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    const record = {
      id:                 `case_${Date.now()}`,
      verified_at:        now.toISOString(),
      verification_stamp: `Verified by Deputy Commissioner on ${dateStr} at ${timeStr}`,
      case_metadata:      meta,
      directions,
      summary,
    }

    try {
      const existing = JSON.parse(localStorage.getItem('aaroh_cases') ?? '[]')
      existing.push(record)
      localStorage.setItem('aaroh_cases', JSON.stringify(existing))
    } catch { /* storage unavailable */ }

    setSaving(false)
    setApproved(true)
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (approved) {
    const now     = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    return (
      <div className="verify-success">
        <div className="verify-success-card">
          <div className="success-icon">✓</div>
          <h2>Case Approved &amp; Saved</h2>
          <p className="success-stamp">
            Verified by Deputy Commissioner<br />
            <strong>{dateStr}</strong> at <strong>{timeStr}</strong>
          </p>
          <p className="success-case">{meta.case_number || 'Case'} has been recorded in the system.</p>
          <button className="success-back-btn" onClick={onReject}>
            Upload Another Judgment
          </button>
        </div>
      </div>
    )
  }

  const orderTypeCls = meta.order_type === 'FINAL_DISPOSAL' ? 'order-badge--final' : 'order-badge--interim'
  const orderTypeLabel = ORDER_TYPE_OPTIONS.find(o => o.value === meta.order_type)?.label ?? meta.order_type

  return (
    <>
      {pdfOpen && pdfUrl && <PdfModal pdfUrl={pdfUrl} onClose={() => setPdfOpen(false)} />}

      <div className="verify-page">
        {/* ── Sub-header ── */}
        <div className="verify-subheader">
          <div className="verify-subheader-left">
            <button className="back-btn" onClick={onReject}>← Back to Upload</button>
            <span className="verify-title">Review &amp; Verify Extraction</span>
          </div>
          <div className="verify-subheader-right">
            {pdfUrl && (
              <button className="view-pdf-main-btn" onClick={() => setPdfOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                View Source PDF
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="verify-content">

          {/* Case metadata — editable */}
          <section className="vmeta-section">
            <div className="vsection-header">
              <h2 className="vsection-title">Case Metadata</h2>
              <PdfBtn onClick={() => setPdfOpen(true)} />
            </div>

            <div className="vmeta-banner">
              <div className="vmeta-banner-top">
                <div className="vmeta-field vmeta-field--case-num">
                  <label className="vmeta-label" htmlFor="case_number">Case Number</label>
                  <input
                    id="case_number"
                    className="vmeta-input vmeta-input--large"
                    type="text"
                    value={meta.case_number}
                    onChange={e => setMeta(m => ({ ...m, case_number: e.target.value }))}
                  />
                </div>
                <div className="vmeta-field">
                  <label className="vmeta-label" htmlFor="order_type">Order Type</label>
                  <select
                    id="order_type"
                    className={`order-type-select order-type-select--${meta.order_type === 'FINAL_DISPOSAL' ? 'final' : 'interim'}`}
                    value={meta.order_type}
                    onChange={e => setMeta(m => ({ ...m, order_type: e.target.value }))}
                  >
                    {ORDER_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="vmeta-grid">
                <div className="vmeta-field">
                  <label className="vmeta-label" htmlFor="court_name">Court Name</label>
                  <input
                    id="court_name"
                    className="vmeta-input"
                    type="text"
                    value={meta.court_name}
                    onChange={e => setMeta(m => ({ ...m, court_name: e.target.value }))}
                  />
                </div>
                <div className="vmeta-field">
                  <label className="vmeta-label" htmlFor="order_date">Date of Order</label>
                  <input
                    id="order_date"
                    className="vmeta-input"
                    type="text"
                    value={meta.order_date}
                    onChange={e => setMeta(m => ({ ...m, order_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          {summary && (
            <div className="vstats-grid">
              <div className="vstat-card">
                <span className="vstat-num">{summary.total_directions ?? 0}</span>
                <span className="vstat-label">Total Directions</span>
              </div>
              <div className="vstat-card vstat-card--red">
                <span className="vstat-num">{summary.binding_to_govt ?? 0}</span>
                <span className="vstat-label">Binding to Govt</span>
              </div>
              <div className="vstat-card vstat-card--blue">
                <span className="vstat-num">{summary.to_petitioner ?? 0}</span>
                <span className="vstat-label">To Petitioner</span>
              </div>
              <div className="vstat-card vstat-card--gray">
                <span className="vstat-num">{summary.observations ?? 0}</span>
                <span className="vstat-label">Observations</span>
              </div>
            </div>
          )}

          {/* Directions */}
          {directions.length > 0 && (
            <section>
              <div className="vsection-header">
                <h2 className="vsection-title">Extracted Directions</h2>
                <span className="vdirs-count">{directions.length} directions found</span>
              </div>
              <div className="vdirs-list">
                {directions.map((d, i) => (
                  <DirectionCard
                    key={i}
                    dir={d}
                    index={i}
                    onChange={updateDirection}
                    onViewPdf={() => setPdfOpen(true)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        <div className="verify-actions">
          <button className="action-btn action-btn--reject" onClick={onReject} disabled={saving}>
            Reject &amp; Re-upload
          </button>
          <button className="action-btn action-btn--approve" onClick={handleApprove} disabled={saving} aria-busy={saving}>
            {saving ? 'Saving…' : '✓  Approve & Save'}
          </button>
        </div>
      </div>
    </>
  )
}
