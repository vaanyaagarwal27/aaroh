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
  const [editing,  setEditing]  = useState(false)
  const [draft,    setDraft]    = useState(null)
  const [reason,   setReason]   = useState('')
  const [editedBy, setEditedBy] = useState('')
  const [errors,   setErrors]   = useState({})

  function startEdit() { setDraft({ ...dir }); setReason(''); setEditedBy(''); setErrors({}); setEditing(true) }

  function cancelEdit() { setDraft(null); setReason(''); setEditedBy(''); setErrors({}); setEditing(false) }

  function saveEdit() {
    const errs = {}
    if (!reason.trim())   errs.reason   = 'Required'
    if (!editedBy.trim()) errs.editedBy = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const now       = new Date()
    const editedAt  = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })

    const changes = []
    if (dir.verbatim_text !== draft.verbatim_text)
      changes.push({ field: 'text', original: dir.verbatim_text, updated: draft.verbatim_text })
    if (dir.category !== draft.category)
      changes.push({ field: 'category', original: dir.category, updated: draft.category })
    if ((dir.responsible_entity ?? '') !== (draft.responsible_entity ?? ''))
      changes.push({ field: 'entity', original: dir.responsible_entity, updated: draft.responsible_entity })
    if ((dir.original_timeline ?? '') !== (draft.original_timeline ?? ''))
      changes.push({ field: 'timeline', original: dir.original_timeline, updated: draft.original_timeline })

    const editRecord = {
      field:          `Direction #${index + 1}`,
      original_value: dir.category,
      new_value:      draft.category,
      changes,
      reason:         reason.trim(),
      edited_by:      editedBy.trim(),
      edited_at:      editedAt,
    }

    onChange(index, draft, editRecord)
    setEditing(false); setDraft(null); setReason(''); setEditedBy(''); setErrors({})
  }

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

      {editing && (
        <div className="vdir-audit">
          <div className="vdir-audit-field">
            <label className="vdir-audit-label">
              Reason for change <span className="vdir-required">*</span>
            </label>
            <input
              className={`vdir-input ${errors.reason ? 'vdir-input--error' : ''}`}
              type="text"
              value={reason}
              onChange={e => { setReason(e.target.value); setErrors(er => ({ ...er, reason: '' })) }}
              placeholder="e.g. This is a mandatory directive, not just commentary"
            />
            {errors.reason && <span className="vdir-error-msg">{errors.reason}</span>}
          </div>
          <div className="vdir-audit-field">
            <label className="vdir-audit-label">
              Your name / designation <span className="vdir-required">*</span>
            </label>
            <input
              className={`vdir-input ${errors.editedBy ? 'vdir-input--error' : ''}`}
              type="text"
              value={editedBy}
              onChange={e => { setEditedBy(e.target.value); setErrors(er => ({ ...er, editedBy: '' })) }}
              placeholder="e.g. Dy. Commissioner Sharma"
            />
            {errors.editedBy && <span className="vdir-error-msg">{errors.editedBy}</span>}
          </div>
        </div>
      )}
    </article>
  )
}

// ── Date utilities ────────────────────────────────────────────────────────────

function parseOrderDate(str) {
  if (!str) return null
  const dmy = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1])
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3])
  const native = new Date(str)
  return isNaN(native) ? null : native
}

function addDays(date, n) {
  if (!date) return null
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function fmtDate(date) {
  if (!date) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

function daysFromNow(date) {
  if (!date) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(date); target.setHours(0,0,0,0)
  return Math.ceil((target - today) / 86400000)
}

const DEPT_OPTIONS = ['Revenue', 'Transport', 'Health', 'Urban Development', 'Forest & Environment', 'Home', 'Other (specify)']

// ── Action Plan component ─────────────────────────────────────────────────────

function ActionPlan({ meta, directions, overallAssessment, assignedDept, onDeptChange, customDept, onCustomDeptChange }) {
  const ai          = overallAssessment   // may be null for old data
  const orderDate   = parseOrderDate(meta.order_date)
  const isFinal     = meta.order_type === 'FINAL_DISPOSAL'
  const isInterim   = meta.order_type === 'INTERIM'
  const hasBinding  = directions.some(d => d.category === 'BINDING_TO_GOVT')

  // ── Priority ──────────────────────────────────────────────────────────────
  const priority = ai?.urgency ?? (() => {
    const compDue = addDays(orderDate, 30)
    const d = daysFromNow(compDue)
    if ((d !== null && d < 15) || isInterim) return 'HIGH'
    if (d !== null && d < 30) return 'MEDIUM'
    return 'LOW'
  })()
  const priorityCls = { HIGH: 'ap-priority--high', MEDIUM: 'ap-priority--medium', LOW: 'ap-priority--low' }[priority] ?? 'ap-priority--low'

  // ── Deadlines ─────────────────────────────────────────────────────────────
  // Use AI deadlines if present, else calculate from order date
  const complianceDateStr = ai?.compliance_deadline ?? fmtDate(addDays(orderDate, 30))
  const appealDateStr     = ai?.appeal_deadline     ?? fmtDate(addDays(orderDate, 90))

  // Days to compliance (parse AI string or computed date)
  const parsedCompliance = ai?.compliance_deadline ? new Date(ai.compliance_deadline) : addDays(orderDate, 30)
  const daysToCompliance = daysFromNow(!parsedCompliance || isNaN(parsedCompliance) ? addDays(orderDate, 30) : parsedCompliance)

  // ── Action steps ──────────────────────────────────────────────────────────
  // Use AI action_plan array if present, else build placeholder list
  const aiSteps = Array.isArray(ai?.action_plan) && ai.action_plan.length > 0 ? ai.action_plan : null
  const fallbackActions = []
  if (isFinal && hasBinding) fallbackActions.push('File compliance report with the court')
  fallbackActions.push('Review appeal options — SLP to Supreme Court available')
  if (isInterim) fallbackActions.push('Interim order: respond within 24–48 hours')

  const actionSteps = aiSteps ?? fallbackActions

  // ── Responsible entities ──────────────────────────────────────────────────
  const dirEntities = [...new Set(
    directions
      .filter(d => d.category === 'BINDING_TO_GOVT' && d.responsible_entity)
      .map(d => d.responsible_entity)
  )]
  // Prepend AI primary dept if not already listed
  const primaryDept = ai?.primary_responsible_department
  const entities = primaryDept && !dirEntities.includes(primaryDept)
    ? [primaryDept, ...dirEntities]
    : dirEntities

  return (
    <section className="action-plan-section" aria-labelledby="ap-heading">
      <div className="ap-card">
        <div className="ap-card-header">
          <div className="ap-card-header-left">
            <span className="ap-icon" aria-hidden="true">📋</span>
            <div>
              <h2 id="ap-heading" className="ap-title">Recommended Action Plan</h2>
              <p className="ap-subtitle">{ai ? 'Generated by AI from judgment analysis' : 'Auto-generated from extracted judgment data'}</p>
            </div>
          </div>
          <span className={`ap-priority ${priorityCls}`}>
            {priority} PRIORITY
          </span>
        </div>

        <div className="ap-body">
          {/* Action steps */}
          <div className="ap-section">
            <p className="ap-section-label">Recommended Actions</p>
            <ol className="ap-actions-list">
              {actionSteps.map((step, i) => (
                <li key={i} className="ap-action ap-action--step">
                  <span className="ap-action-num">{i + 1}</span>
                  <span className="ap-action-label">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Deadlines */}
          <div className="ap-section">
            <p className="ap-section-label">Key Deadlines</p>
            <div className="ap-deadlines">
              <div className={`ap-deadline ${daysToCompliance !== null && daysToCompliance < 15 ? 'ap-deadline--urgent' : ''}`}>
                <span className="ap-deadline-icon">📅</span>
                <div>
                  <p className="ap-deadline-label">Compliance Due</p>
                  <p className="ap-deadline-date">{complianceDateStr}</p>
                  {daysToCompliance !== null && (
                    <p className="ap-deadline-days">
                      {daysToCompliance < 0
                        ? `${Math.abs(daysToCompliance)} days overdue`
                        : daysToCompliance === 0 ? 'Due today'
                        : `${daysToCompliance} days remaining`}
                    </p>
                  )}
                </div>
              </div>
              <div className="ap-deadline">
                <span className="ap-deadline-icon">🏛️</span>
                <div>
                  <p className="ap-deadline-label">Appeal Deadline (SLP)</p>
                  <p className="ap-deadline-date">{appealDateStr}</p>
                  <p className="ap-deadline-note">90 days for SLP to Supreme Court</p>
                </div>
              </div>
            </div>
          </div>

          {/* Responsible entities + department assignment */}
          <div className="ap-section ap-section--bottom">
            {entities.length > 0 && (
              <div>
                <p className="ap-section-label">Responsible Entities</p>
                <ul className="ap-entities">
                  {entities.map((e, i) => <li key={i} className="ap-entity">{e}</li>)}
                </ul>
              </div>
            )}
            <div>
              <label className="ap-section-label" htmlFor="ap-dept">Assign to Department</label>
              <select
                id="ap-dept"
                className="ap-dept-select"
                value={assignedDept}
                onChange={e => onDeptChange(e.target.value)}
              >
                <option value="">— Select Department —</option>
                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {assignedDept === 'Other (specify)' && (
                <input
                  className="ap-dept-custom"
                  type="text"
                  placeholder="Enter department name"
                  value={customDept}
                  onChange={e => onCustomDeptChange(e.target.value)}
                  aria-label="Custom department name"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VerificationPage({ pdfUrl, result, onReject, onApprove }) {
  const rawMeta          = result?.data?.case_metadata    ?? {}
  const rawDirs          = result?.data?.directions       ?? []
  const overallAssessment = result?.data?.overall_assessment ?? null

  const [meta,       setMeta]       = useState({
    case_number: rawMeta.case_number ?? '',
    order_date:  rawMeta.order_date  ?? '',
    court_name:  rawMeta.court_name  ?? '',
    order_type:  rawMeta.order_type  ?? 'INTERIM',
  })
  const [directions,   setDirections]   = useState(rawDirs)
  const [edits,        setEdits]        = useState([])
  const [assignedDept,  setAssignedDept]  = useState('')
  const [customDept,    setCustomDept]    = useState('')
  const [pdfOpen,      setPdfOpen]      = useState(false)
  const [saving,       setSaving]       = useState(false)

  function updateDirection(index, updated, editRecord) {
    setDirections(prev => prev.map((d, i) => i === index ? { ...d, ...updated } : d))
    if (editRecord) setEdits(prev => [...prev, editRecord])
  }

  function handleApprove() {
    setSaving(true)
    const now     = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    // Live summary — recalculated from current (possibly edited) directions
    const liveSummary = {
      total_directions: directions.length,
      binding_to_govt:  directions.filter(d => d.category === 'BINDING_TO_GOVT').length,
      to_petitioner:    directions.filter(d => d.category === 'TO_PETITIONER').length,
      observations:     directions.filter(d => d.category === 'OBSERVATION').length,
    }

    // Use AI deadlines when available, fall back to calculated
    const ai = overallAssessment
    const orderDate = parseOrderDate(meta.order_date)
    const complianceDeadline = ai?.compliance_deadline ?? fmtDate(addDays(orderDate, 30))
    const appealDeadline     = ai?.appeal_deadline     ?? fmtDate(addDays(orderDate, 90))
    const priority = ai?.urgency ?? (() => {
      const d = daysFromNow(addDays(orderDate, 30))
      if ((d !== null && d < 15) || meta.order_type === 'INTERIM') return 'HIGH'
      if (d !== null && d < 30) return 'MEDIUM'
      return 'LOW'
    })()

    const record = {
      id:                 `case_${Date.now()}`,
      verified_at:        now.toISOString(),
      verified_by:        'Deputy Commissioner',
      verification_stamp: `Verified by Deputy Commissioner on ${dateStr} at ${timeStr}`,
      case_metadata:      meta,
      directions,
      summary:            liveSummary,
      status:             'Pending',
      edits,
      overall_assessment: ai,
      action_plan: {
        compliance_deadline: complianceDeadline,
        appeal_deadline:     appealDeadline,
        assigned_department: assignedDept === 'Other (specify)' ? (customDept.trim() || 'Other') : assignedDept,
        priority,
      },
    }

    try {
      const existing = JSON.parse(localStorage.getItem('approved_cases') ?? '[]')
      existing.push(record)
      localStorage.setItem('approved_cases', JSON.stringify(existing))
    } catch { /* storage unavailable */ }

    setSaving(false)
    onApprove()
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
          <div className="verify-subheader-right"></div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="verify-content">

          {/* Action Plan */}
          <ActionPlan
            meta={meta}
            directions={directions}
            overallAssessment={overallAssessment}
            assignedDept={assignedDept}
            onDeptChange={setAssignedDept}
            customDept={customDept}
            onCustomDeptChange={setCustomDept}
          />

          {/* Case metadata — editable */}
          <section className="vmeta-section">
            <div className="vsection-header">
              <h2 className="vsection-title">Case Metadata</h2>
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
