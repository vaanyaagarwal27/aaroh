import { useState, useMemo, useEffect, useRef } from 'react'
import './Dashboard.css'

// ── Sample data ───────────────────────────────────────────────────────────────

const now = Date.now()
const daysAgo = d => new Date(now - d * 86400000).toISOString()

const SAMPLE_CASES = [
  {
    id: 'sample_1',
    verified_at: daysAgo(2),
    verification_stamp: 'Verified by System (Pre-login data) on 01 May 2026 at 10:30 AM',
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
    verification_stamp: 'Verified by System (Pre-login data) on 28 Apr 2026 at 03:15 PM',
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
    verification_stamp: 'Verified by System (Pre-login data) on 26 Apr 2026 at 11:00 AM',
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
    verification_stamp: 'Verified by System (Pre-login data) on 02 May 2026 at 09:45 AM',
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

function parseOrderDate(str) {
  if (!str) return null

  // DD-MM-YYYY (primary format from extraction, e.g. "01-05-2026")
  const dmy = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1])

  // YYYY-MM-DD (ISO, e.g. "2026-05-01")
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3])

  // "28 Apr 2026" — safe for native parse (unambiguous month name)
  const native = new Date(str)
  return isNaN(native) ? null : native
}

function calcDaysRemaining(cas) {
  // Prefer saved compliance_deadline (set at approval time from AI or calculated)
  const deadlineStr = cas?.action_plan?.compliance_deadline
  if (deadlineStr) {
    const parsed = new Date(deadlineStr)
    if (!isNaN(parsed)) {
      const today = new Date(); today.setHours(0,0,0,0)
      parsed.setHours(0,0,0,0)
      return Math.ceil((parsed - today) / 86400000)
    }
  }
  // Fall back: order_date + 30
  const orderDate = parseOrderDate(cas?.case_metadata?.order_date)
  if (!orderDate) return null
  const deadline = new Date(orderDate)
  deadline.setDate(deadline.getDate() + 30)
  deadline.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((deadline - today) / 86400000)
}

function urgencyClass(days) {
  if (days === null) return 'urgency--none'
  if (days < 0)      return 'urgency--overdue'
  if (days < 15)     return 'urgency--critical'
  if (days < 30)     return 'urgency--warning'
  return                    'urgency--safe'
}

function urgencyLabel(days) {
  if (days === null) return '—'
  if (days < 0)      return `${Math.abs(days)}d overdue`
  if (days === 0)    return 'Due today'
  return `${days}d`
}

const STATUS_CLS = {
  'Pending':     'status--pending',
  'In Progress': 'status--progress',
  'Completed':   'status--done',
}

const CATEGORY_OPTIONS = [
  { value: 'BINDING_TO_GOVT', label: 'Binding to Govt' },
  { value: 'TO_PETITIONER',   label: 'To Petitioner'   },
  { value: 'OBSERVATION',     label: 'Observation'     },
]
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

function loadRealCases() {
  try { return JSON.parse(localStorage.getItem('approved_cases') ?? '[]') } catch { return [] }
}

function saveStatusForReal(id, status) {
  try {
    const cases = loadRealCases()
    const updated = cases.map(c => c.id === id ? { ...c, status } : c)
    localStorage.setItem('approved_cases', JSON.stringify(updated))
  } catch { /* ignore */ }
}

// Sample cases use a lightweight sidecar so we don't bloat the sample array
function loadSampleStatuses() {
  try { return JSON.parse(localStorage.getItem('aaroh_sample_statuses') ?? '{}') } catch { return {} }
}
function saveSampleStatus(id, status) {
  try {
    const s = loadSampleStatuses()
    s[id] = status
    localStorage.setItem('aaroh_sample_statuses', JSON.stringify(s))
  } catch { /* ignore */ }
}

function loadDeletedSamples() {
  try { return new Set(JSON.parse(localStorage.getItem('aaroh_deleted_samples') ?? '[]')) } catch { return new Set() }
}
function markSampleDeleted(id) {
  try {
    const deleted = loadDeletedSamples()
    deleted.add(id)
    localStorage.setItem('aaroh_deleted_samples', JSON.stringify([...deleted]))
  } catch { /* ignore */ }
}

function deleteRealCase(id) {
  try {
    const cases = loadRealCases()
    localStorage.setItem('approved_cases', JSON.stringify(cases.filter(c => c.id !== id)))
  } catch { /* ignore */ }
}

function loadAllCases() {
  const real           = loadRealCases()
  const sampleStatuses = loadSampleStatuses()
  const deletedSamples = loadDeletedSamples()
  const samples = SAMPLE_CASES
    .filter(c => !deletedSamples.has(c.id))
    .map(c => ({
      ...c,
      status: sampleStatuses[c.id] ?? c._default_status ?? 'Pending',
      _isSample: true,
    }))
  return [...samples, ...real]
}

// ── Detail modal helpers ──────────────────────────────────────────────────────

function dmParseDate(str) {
  if (!str) return null
  const dmy = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1])
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3])
  const n = new Date(str); return isNaN(n) ? null : n
}

function dmAddDays(date, n) {
  if (!date) return null; const d = new Date(date); d.setDate(d.getDate() + n); return d
}

function dmFmt(date) {
  if (!date) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

function dmDaysFrom(date) {
  if (!date) return null
  const t = new Date(date); t.setHours(0,0,0,0)
  const today = new Date(); today.setHours(0,0,0,0)
  return Math.ceil((t - today) / 86400000)
}

const NEXT_STEPS = [
  'Assign to responsible department',
  'Draft compliance report',
  'Schedule review meeting',
  'File status update with court',
]

const MODAL_STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed', 'Awaiting Review']

// ── Steps persistence ─────────────────────────────────────────────────────────

function stepsKey(id) { return `aaroh_steps_${id}` }

function loadSteps(id) {
  try { return JSON.parse(localStorage.getItem(stepsKey(id)) ?? 'null') ?? { checked: {}, updatedAt: null } }
  catch { return { checked: {}, updatedAt: null } }
}

function saveSteps(id, checked) {
  const updatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  try { localStorage.setItem(stepsKey(id), JSON.stringify({ checked, updatedAt })) }
  catch { /* ignore */ }
  return updatedAt
}

// ── Edit Direction Card ───────────────────────────────────────────────────────

function EditDirectionCard({ dir, index, onChange }) {
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

    const editedAt = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
    const changes = []
    if (dir.verbatim_text !== draft.verbatim_text)
      changes.push({ field: 'text',     original: dir.verbatim_text,    updated: draft.verbatim_text })
    if (dir.category !== draft.category)
      changes.push({ field: 'category', original: dir.category,         updated: draft.category })
    if ((dir.responsible_entity ?? '') !== (draft.responsible_entity ?? ''))
      changes.push({ field: 'entity',   original: dir.responsible_entity, updated: draft.responsible_entity })
    if ((dir.original_timeline ?? '') !== (draft.original_timeline ?? ''))
      changes.push({ field: 'timeline', original: dir.original_timeline,  updated: draft.original_timeline })

    onChange(index, draft, {
      field:     `Direction #${index + 1}`,
      changes,
      reason:    reason.trim(),
      edited_by: editedBy.trim(),
      edited_at: editedAt,
    })
    setEditing(false); setDraft(null); setReason(''); setEditedBy(''); setErrors({})
  }

  const current = editing ? draft : dir
  const catCls  = CATEGORY_CLS[current.category]  ?? 'cat--gray'
  const catConf = CONF_CLS[String(current.confidence_score ?? '').toUpperCase()] ?? 'conf--low'

  return (
    <div className={`edc-card ${catCls} ${editing ? 'edc-card--editing' : ''}`}>
      <div className="edc-header">
        <span className="edc-index">#{index + 1}</span>
        {editing ? (
          <select
            className="edc-cat-select"
            value={draft.category}
            onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
          >
            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <span className={`cat-badge ${catCls}`}>{CATEGORY_LABEL[current.category] ?? current.category}</span>
        )}
        <span className={`conf-badge ${catConf}`}>{String(current.confidence_score ?? 'Low')}</span>
        <div className="edc-btns">
          {editing ? (
            <>
              <button className="edc-btn edc-btn--save"   onClick={saveEdit}>Save</button>
              <button className="edc-btn edc-btn--cancel" onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <button className="edc-btn edc-btn--edit" onClick={startEdit}>Edit</button>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          className="edc-textarea"
          value={draft.verbatim_text}
          onChange={e => setDraft(d => ({ ...d, verbatim_text: e.target.value }))}
          rows={4}
          autoFocus
        />
      ) : (
        <p className="edc-text">{current.verbatim_text}</p>
      )}

      <div className="edc-footer">
        <div className="edc-field">
          <span className="edc-field-label">Entity</span>
          {editing ? (
            <input className="edc-input" type="text" value={draft.responsible_entity ?? ''} onChange={e => setDraft(d => ({ ...d, responsible_entity: e.target.value }))} placeholder="Responsible entity" />
          ) : (
            <span className="edc-field-value">{current.responsible_entity || '—'}</span>
          )}
        </div>
        <div className="edc-field">
          <span className="edc-field-label">Timeline</span>
          {editing ? (
            <input className="edc-input" type="text" value={draft.original_timeline ?? ''} onChange={e => setDraft(d => ({ ...d, original_timeline: e.target.value }))} placeholder="e.g. 4 weeks" />
          ) : (
            <span className="edc-field-value">{current.original_timeline || '—'}</span>
          )}
        </div>
      </div>

      {editing && (
        <div className="edc-audit">
          <div className="edc-audit-field">
            <label className="edc-audit-label">Reason for change <span className="edc-required">*</span></label>
            <input
              className={`edc-input ${errors.reason ? 'edc-input--error' : ''}`}
              type="text"
              value={reason}
              onChange={e => { setReason(e.target.value); setErrors(er => ({ ...er, reason: '' })) }}
              placeholder="Why are you making this change?"
            />
            {errors.reason && <span className="edc-error">{errors.reason}</span>}
          </div>
          <div className="edc-audit-field">
            <label className="edc-audit-label">Your name / designation <span className="edc-required">*</span></label>
            <input
              className={`edc-input ${errors.editedBy ? 'edc-input--error' : ''}`}
              type="text"
              value={editedBy}
              onChange={e => { setEditedBy(e.target.value); setErrors(er => ({ ...er, editedBy: '' })) }}
              placeholder="e.g. Dy. Commissioner Sharma"
            />
            {errors.editedBy && <span className="edc-error">{errors.editedBy}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Edit Case Modal ───────────────────────────────────────────────────────────

function EditCaseModal({ cas, onClose, onSave }) {
  const meta = cas.case_metadata ?? {}
  const [localDirs,  setLocalDirs]  = useState(cas.directions ?? [])
  const [localEdits, setLocalEdits] = useState(cas.edits ?? [])
  const bodyRef = useRef(null)
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }) }, [])

  function handleDirChange(index, updated, editRecord) {
    setLocalDirs(prev => prev.map((d, i) => i === index ? { ...d, ...updated } : d))
    if (editRecord) setLocalEdits(prev => [...prev, editRecord])
  }

  function handleSave() {
    const liveSummary = {
      total_directions: localDirs.length,
      binding_to_govt:  localDirs.filter(d => d.category === 'BINDING_TO_GOVT').length,
      to_petitioner:    localDirs.filter(d => d.category === 'TO_PETITIONER').length,
      observations:     localDirs.filter(d => d.category === 'OBSERVATION').length,
    }
    onSave({ ...cas, directions: localDirs, edits: localEdits, summary: liveSummary })
  }

  const isFinal = meta.order_type === 'FINAL_DISPOSAL'

  return (
    <div
      className="detail-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Edit case"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="detail-modal detail-modal--wide">

        <div className="detail-modal-header">
          <div>
            <p className="detail-modal-label">Edit Directions</p>
            <p className="detail-modal-case">{meta.case_number ?? '—'}</p>
            <p className="detail-modal-court">{meta.court_name}</p>
          </div>
          <div className="detail-modal-header-right">
            <span className={`order-badge order-badge--${isFinal ? 'final' : 'interim'}`}>
              {isFinal ? 'Final Disposal' : 'Interim'}
            </span>
            <button className="detail-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="detail-modal-body" ref={bodyRef}>
          <p className="edc-intro">
            Edits require a reason and your name. All changes are logged in the audit trail.
          </p>
          <div className="edc-list">
            {localDirs.map((d, i) => (
              <EditDirectionCard key={i} dir={d} index={i} onChange={handleDirChange} />
            ))}
          </div>
        </div>

        <div className="edc-modal-footer">
          <button className="edc-cancel-btn" onClick={onClose}>Discard</button>
          <button className="edc-save-btn" onClick={handleSave}>Save All Changes</button>
        </div>

      </div>
    </div>
  )
}

// ── Case Details modal ────────────────────────────────────────────────────────

const CD_CATEGORY = {
  BINDING_TO_GOVT: { label: 'Binding to Govt', cls: 'cat--red'  },
  TO_PETITIONER:   { label: 'To Petitioner',   cls: 'cat--blue' },
  OBSERVATION:     { label: 'Observation',      cls: 'cat--gray' },
}
const CD_CONF_LABEL = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }

function CaseDetailsModal({ cas, onClose }) {
  const meta    = cas.case_metadata ?? {}
  const dirs    = cas.directions    ?? []
  const summary = cas.summary       ?? {}
  const isFinal = meta.order_type === 'FINAL_DISPOSAL'

  const totalDirs  = summary.total_directions ?? dirs.length
  const bindingCnt = summary.binding_to_govt  ?? dirs.filter(d => d.category === 'BINDING_TO_GOVT').length
  const petCnt     = summary.to_petitioner    ?? dirs.filter(d => d.category === 'TO_PETITIONER').length
  const obsCnt     = summary.observations     ?? dirs.filter(d => d.category === 'OBSERVATION').length

  const bodyRef = useRef(null)
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }) }, [])

  return (
    <div
      className="detail-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Case details"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="detail-modal">

        {/* Header */}
        <div className="detail-modal-header">
          <div>
            <p className="detail-modal-label">Case Details</p>
            <p className="detail-modal-case">{meta.case_number ?? '—'}</p>
            <p className="detail-modal-court">{meta.court_name}</p>
          </div>
          <div className="detail-modal-header-right">
            <span className={`order-badge order-badge--${isFinal ? 'final' : 'interim'}`}>
              {isFinal ? 'Final Disposal' : 'Interim'}
            </span>
            <button className="detail-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="detail-modal-body" ref={bodyRef}>

          {/* Stats */}
          <div className="cd-stats">
            <div className="cd-stat">
              <span className="cd-stat-num">{totalDirs}</span>
              <span className="cd-stat-label">Total Directions</span>
            </div>
            <div className="cd-stat cd-stat--red">
              <span className="cd-stat-num">{bindingCnt}</span>
              <span className="cd-stat-label">Binding to Govt</span>
            </div>
            <div className="cd-stat cd-stat--blue">
              <span className="cd-stat-num">{petCnt}</span>
              <span className="cd-stat-label">To Petitioner</span>
            </div>
            <div className="cd-stat cd-stat--gray">
              <span className="cd-stat-num">{obsCnt}</span>
              <span className="cd-stat-label">Observations</span>
            </div>
          </div>

          {/* Directions */}
          {dirs.length > 0 && (
            <div className="dm-section">
              <h3 className="dm-section-title">Extracted Directions</h3>
              <div className="cd-dirs">
                {dirs.map((d, i) => {
                  const cat  = CD_CATEGORY[d.category] ?? { label: d.category, cls: 'cat--gray' }
                  const confKey = String(d.confidence_score ?? '').toUpperCase()
                  const confCls = CONF_CLS[confKey] ?? 'conf--low'
                  return (
                    <div key={i} className={`cd-dir-card ${cat.cls}`}>
                      <div className="cd-dir-header">
                        <span className="cd-dir-num">#{i + 1}</span>
                        <span className={`cat-badge ${cat.cls}`}>{cat.label}</span>
                        <span className={`conf-badge ${confCls}`}>{CD_CONF_LABEL[confKey] ?? 'Low'}</span>
                      </div>
                      <p className="cd-dir-text">{d.verbatim_text}</p>
                      {(d.responsible_entity || d.original_timeline) && (
                        <div className="cd-dir-footer">
                          {d.responsible_entity && (
                            <span className="cd-dir-meta">
                              <span className="cd-dir-meta-label">Entity</span>{d.responsible_entity}
                            </span>
                          )}
                          {d.original_timeline && (
                            <span className="cd-dir-meta">
                              <span className="cd-dir-meta-label">Timeline</span>{d.original_timeline}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Verification stamp */}
          {cas.verification_stamp && (
            <p className="detail-stamp">
              {cas.verification_stamp.replace(
                'Verified by Deputy Commissioner',
                'Verified by System (Pre-login data)'
              )}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Edit History modal ────────────────────────────────────────────────────────

function EditHistoryModal({ cas, onClose }) {
  const edits = cas.edits ?? []
  const bodyRef = useRef(null)
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }) }, [])

  return (
    <div
      className="detail-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Edit history"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="detail-modal">
        <div className="detail-modal-header">
          <div>
            <p className="detail-modal-label">Edit History</p>
            <p className="detail-modal-case">{cas.case_metadata?.case_number ?? '—'}</p>
          </div>
          <div className="detail-modal-header-right">
            <button className="detail-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>
        <div className="detail-modal-body" ref={bodyRef}>
          <div className="dm-section detail-edit-history">
            <h3 className="dm-section-title">
              Edit History ({edits.length} change{edits.length !== 1 ? 's' : ''})
            </h3>
            {edits.map((e, i) => (
              <div key={i} className="detail-edit-card">
                {e.changes?.map((ch, j) => (
                  <div key={j} className="detail-edit-change">
                    {ch.field && <p className="detail-edit-change-field">{ch.field}</p>}
                    <div className="detail-edit-block detail-edit-block--old">
                      <span className="detail-edit-block-label">OLD TEXT</span>
                      <p className="detail-edit-block-text">{ch.original || '—'}</p>
                    </div>
                    <div className="detail-edit-block detail-edit-block--new">
                      <span className="detail-edit-block-label">NEW TEXT</span>
                      <p className="detail-edit-block-text">{ch.updated || '—'}</p>
                    </div>
                  </div>
                ))}
                <div className="detail-edit-footer">
                  <span><span className="detail-edit-footer-label">Changed by:</span> {e.edited_by}</span>
                  <span className="detail-edit-footer-sep">|</span>
                  <span><span className="detail-edit-footer-label">Reason:</span> {e.reason}</span>
                  <span className="detail-edit-footer-sep">|</span>
                  <span className="detail-edit-footer-time">{e.edited_at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Action Center modal ───────────────────────────────────────────────────────

function DetailModal({ cas, onClose, onStatusChange }) {
  const meta = cas.case_metadata ?? {}
  const dirs = cas.directions    ?? []

  const [stepsData,   setStepsData]   = useState(() => loadSteps(cas.id))
  const [localStatus, setLocalStatus] = useState(cas.status ?? 'Pending')
  const bodyRef = useRef(null)
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }) }, [])

  const checkedSteps = stepsData.checked
  const allDone      = NEXT_STEPS.every((_, i) => checkedSteps[i])

  function handleStatusChange(newStatus) {
    setLocalStatus(newStatus)
    onStatusChange(cas.id, newStatus)
  }

  function toggleStep(i) {
    const next = { ...checkedSteps, [i]: !checkedSteps[i] }
    const updatedAt = saveSteps(cas.id, next)
    setStepsData({ checked: next, updatedAt })

    // Auto-complete when all steps are checked
    const nowAllDone = NEXT_STEPS.every((_, idx) => next[idx])
    if (nowAllDone && localStatus !== 'Completed') {
      handleStatusChange('Completed')
    }
  }

  // Deadline calculations — prefer saved action_plan dates (may come from AI)
  const orderDate = dmParseDate(meta.order_date)
  const complianceDue = (() => {
    const s = cas.action_plan?.compliance_deadline
    if (s) { const p = new Date(s); if (!isNaN(p)) return p }
    return dmAddDays(orderDate, 30)
  })()
  const appealDue = (() => {
    const s = cas.action_plan?.appeal_deadline
    if (s) { const p = new Date(s); if (!isNaN(p)) return p }
    return dmAddDays(orderDate, 90)
  })()
  const daysLeft       = dmDaysFrom(complianceDue)
  const daysLeftAppeal = dmDaysFrom(appealDue)

  const bindingDirs = dirs.filter(d => d.category === 'BINDING_TO_GOVT')
  const isFinal     = meta.order_type === 'FINAL_DISPOSAL'
  const isInterim   = meta.order_type === 'INTERIM'

  function daysLabel(n) {
    if (n === null) return ''
    if (n < 0)  return `${Math.abs(n)} days overdue`
    if (n === 0) return 'Due today'
    return `${n} days remaining`
  }

  return (
    <div
      className="detail-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Case action center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="detail-modal">

        {/* ── Header ── */}
        <div className="detail-modal-header">
          <div>
            <p className="detail-modal-label">Action Center</p>
            <p className="detail-modal-case">{meta.case_number ?? '—'}</p>
            <p className="detail-modal-court">{meta.court_name}</p>
          </div>
          <div className="detail-modal-header-right">
            <span className={`order-badge order-badge--${isFinal ? 'final' : 'interim'}`}>
              {isFinal ? 'Final Disposal' : 'Interim'}
            </span>
            {isInterim && <span className="urgent-badge">URGENT</span>}
            <button className="detail-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="detail-modal-body" ref={bodyRef}>

          {/* ── 1. Action Plan ── */}
          <div className="dm-section dm-section--action">
            <h3 className="dm-section-title">
              {(isFinal && bindingDirs.length > 0) ? '✅ Compliance Required' : '⚖️ Action Required'}
            </h3>

            {bindingDirs.length > 0 && (
              <div className="dm-compliance-block">
                <p className="dm-block-label">What must be done</p>
                <ul className="dm-compliance-list">
                  {bindingDirs.map((d, i) => (
                    <li key={i} className="dm-compliance-item">
                      <span className="dm-bullet" aria-hidden="true">›</span>
                      <span>
                        {d.responsible_entity
                          ? <><strong>{d.responsible_entity}</strong> — </>
                          : null}
                        {d.verbatim_text.length > 160
                          ? d.verbatim_text.slice(0, 160).trimEnd() + '…'
                          : d.verbatim_text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadlines */}
            <div className="dm-deadlines">
              <div className={`dm-deadline ${daysLeft !== null && daysLeft < 15 ? 'dm-deadline--urgent' : ''}`}>
                <div className="dm-deadline-icon">📅</div>
                <div>
                  <p className="dm-deadline-label">Compliance Deadline</p>
                  <p className="dm-deadline-date">Due by: {dmFmt(complianceDue)}</p>
                  {daysLeft !== null && (
                    <p className={`dm-deadline-days ${daysLeft < 0 ? 'dm-overdue' : ''}`}>
                      {daysLabel(daysLeft)}
                    </p>
                  )}
                </div>
              </div>
              <div className="dm-deadline">
                <div className="dm-deadline-icon">🏛️</div>
                <div>
                  <p className="dm-deadline-label">Appeal Option (SLP)</p>
                  <p className="dm-deadline-date">File by: {dmFmt(appealDue)}</p>
                  <p className="dm-deadline-note">
                    SLP to Supreme Court — {daysLeftAppeal !== null ? daysLabel(daysLeftAppeal) : '90 days from order'}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned dept from action_plan if saved */}
            {cas.action_plan?.assigned_department && (
              <p className="dm-dept-tag">
                <strong>Responsible Department:</strong> {cas.action_plan.assigned_department}
              </p>
            )}
          </div>

          {/* ── 2. Next Steps checklist ── */}
          <div className={`dm-section ${allDone ? 'dm-section--alldone' : ''}`}>
            <h3 className="dm-section-title">
              Next Steps
              {allDone && <span className="dm-alldone-badge">All complete</span>}
            </h3>
            <ul className="dm-checklist">
              {NEXT_STEPS.map((step, i) => (
                <li key={i} className={`dm-check-item ${checkedSteps[i] ? 'dm-check-item--done' : ''}`}>
                  <label className="dm-check-label">
                    <input
                      type="checkbox"
                      checked={!!checkedSteps[i]}
                      onChange={() => toggleStep(i)}
                      className="dm-checkbox"
                    />
                    <span>{step}</span>
                  </label>
                </li>
              ))}
            </ul>
            {stepsData.updatedAt && (
              <p className="dm-steps-updated">Last updated: {stepsData.updatedAt}</p>
            )}
            {allDone && (
              <p className="dm-steps-autocomplete">
                Status automatically set to <strong>Completed</strong>
              </p>
            )}
          </div>

          {/* ── 3. Case Timeline ── */}
          <div className="dm-section">
            <h3 className="dm-section-title">Case Timeline</h3>
            <ol className="dm-timeline">
              {meta.order_date && (
                <li className="dm-tl-item dm-tl-item--past">
                  <span className="dm-tl-dot" />
                  <div>
                    <p className="dm-tl-label">Order Passed</p>
                    <p className="dm-tl-date">{meta.order_date}</p>
                  </div>
                </li>
              )}
              {cas.verified_at && (
                <li className="dm-tl-item dm-tl-item--past">
                  <span className="dm-tl-dot" />
                  <div>
                    <p className="dm-tl-label">Verified in CCMS</p>
                    <p className="dm-tl-date">{formatDate(cas.verified_at)}{cas.verified_by ? ` — by ${cas.verified_by}` : ''}</p>
                  </div>
                </li>
              )}
              {complianceDue && (
                <li className={`dm-tl-item ${daysLeft !== null && daysLeft >= 0 ? 'dm-tl-item--future' : 'dm-tl-item--overdue'}`}>
                  <span className="dm-tl-dot" />
                  <div>
                    <p className="dm-tl-label">Compliance Deadline</p>
                    <p className="dm-tl-date">{dmFmt(complianceDue)}</p>
                  </div>
                </li>
              )}
              {appealDue && (
                <li className={`dm-tl-item ${daysLeftAppeal !== null && daysLeftAppeal >= 0 ? 'dm-tl-item--future' : 'dm-tl-item--overdue'}`}>
                  <span className="dm-tl-dot" />
                  <div>
                    <p className="dm-tl-label">Appeal Deadline (SLP)</p>
                    <p className="dm-tl-date">{dmFmt(appealDue)}</p>
                  </div>
                </li>
              )}
            </ol>
          </div>

          {/* ── 4. Change Status ── */}
          <div className="dm-section dm-status-section">
            <h3 className="dm-section-title">Change Status</h3>
            <div className="dm-status-row">
              <span className={`status-select ${STATUS_CLS[localStatus] ?? ''}`} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                Current: {localStatus}
              </span>
              <span className="dm-status-arrow">→</span>
              <select
                className="dm-status-select"
                value={localStatus}
                onChange={e => handleStatusChange(e.target.value)}
                aria-label="Update status"
              >
                {MODAL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [cases,            setCases]            = useState(loadAllCases)
  const [search,           setSearch]           = useState('')
  const [statusFilter,     setStatusFilter]     = useState('All')
  const [interimOnly,      setInterimOnly]      = useState(false)
  const [caseDetailsCase,  setCaseDetailsCase]  = useState(null)  // Case Details modal (read-only)
  const [editHistoryCase,  setEditHistoryCase]  = useState(null)  // Edit History modal
  const [actionCase,       setActionCase]       = useState(null)  // Action Center modal
  const [editCase,         setEditCase]         = useState(null)  // Edit Directions modal
  const [sortUrgency,      setSortUrgency]      = useState(false)
  const [deleteToast,      setDeleteToast]      = useState(null)

  function handleStatusChange(id, newStatus) {
    const target = cases.find(c => c.id === id)
    if (target?._isSample) saveSampleStatus(id, newStatus)
    else saveStatusForReal(id, newStatus)
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    setActionCase(prev => prev?.id === id ? { ...prev, status: newStatus } : prev)
  }

  function handleEditSave(updatedCase) {
    // Persist to localStorage for real cases
    if (!updatedCase._isSample) {
      try {
        const stored = loadRealCases()
        const next   = stored.map(c => c.id === updatedCase.id ? updatedCase : c)
        localStorage.setItem('approved_cases', JSON.stringify(next))
      } catch { /* ignore */ }
    }
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c))
    setEditCase(null)
    setDeleteToast('Changes saved')
    setTimeout(() => setDeleteToast(null), 3000)
  }

  function handleDelete(id) {
    const target = cases.find(c => c.id === id)
    if (!target || target._isSample) return
    if (!window.confirm('Are you sure you want to delete this case from the dashboard?')) return
    deleteRealCase(id)
    setCases(prev => prev.filter(c => c.id !== id))
    setDeleteToast('Case deleted')
    setTimeout(() => setDeleteToast(null), 3000)
  }

  const interimCount = useMemo(
    () => cases.filter(c => c.case_metadata?.order_type === 'INTERIM').length,
    [cases]
  )

  const filtered = useMemo(() => {
    const list = cases.filter(c => {
      const num = c.case_metadata?.case_number ?? ''
      const matchSearch  = num.toLowerCase().includes(search.toLowerCase())
      const matchStatus  = statusFilter === 'All' || c.status === statusFilter
      const matchInterim = !interimOnly || c.case_metadata?.order_type === 'INTERIM'
      return matchSearch && matchStatus && matchInterim
    })

    // Always sort interim to top first, then apply urgency sort within groups
    return [...list].sort((a, b) => {
      const aInterim = a.case_metadata?.order_type === 'INTERIM' ? 0 : 1
      const bInterim = b.case_metadata?.order_type === 'INTERIM' ? 0 : 1
      if (aInterim !== bInterim) return aInterim - bInterim
      if (!sortUrgency) return 0
      const da = calcDaysRemaining(a)
      const db = calcDaysRemaining(b)
      if (da === null && db === null) return 0
      if (da === null) return 1
      if (db === null) return -1
      return da - db
    })
  }, [cases, search, statusFilter, interimOnly, sortUrgency])

  return (
    <>
      {caseDetailsCase && <CaseDetailsModal cas={caseDetailsCase} onClose={() => setCaseDetailsCase(null)} />}
      {editHistoryCase && <EditHistoryModal cas={editHistoryCase} onClose={() => setEditHistoryCase(null)} />}
      {editCase && <EditCaseModal cas={editCase} onClose={() => setEditCase(null)} onSave={handleEditSave} />}
      {actionCase && <DetailModal cas={actionCase} onClose={() => setActionCase(null)} onStatusChange={handleStatusChange} />}
      {deleteToast && <div className="delete-toast" role="status">{deleteToast}</div>}

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
            {interimCount > 0 && (
              <span className="dash-stat-chip dash-stat-chip--interim">
                {interimCount} Interim Order{interimCount > 1 ? 's' : ''}
              </span>
            )}
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
          <button
            className={`urgency-sort-btn ${sortUrgency ? 'urgency-sort-btn--active' : ''}`}
            onClick={() => setSortUrgency(v => !v)}
            aria-pressed={sortUrgency}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L12 22M12 2L6 8M12 2L18 8"/>
            </svg>
            {sortUrgency ? 'Sorted by Urgency' : 'Sort by Urgency'}
          </button>

          <label className={`interim-toggle ${interimOnly ? 'interim-toggle--active' : ''}`}>
            <input
              type="checkbox"
              checked={interimOnly}
              onChange={e => setInterimOnly(e.target.checked)}
              aria-label="Show interim orders only"
            />
            Interim Orders Only
          </label>
        </div>

        {interimOnly && (
          <div className="interim-alert" role="status">
            <strong>{filtered.length} Interim Order{filtered.length !== 1 ? 's' : ''}</strong> requiring immediate action
          </div>
        )}

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
                <th className="col-urgency">Days Remaining</th>
                <th>Status</th>
                <th>Verified On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="dash-empty">
                    No cases match your filters
                  </td>
                </tr>
              ) : filtered.map(cas => {
                const meta      = cas.case_metadata ?? {}
                const isFinal   = meta.order_type === 'FINAL_DISPOSAL'
                const isInterim = meta.order_type === 'INTERIM'
                const days      = calcDaysRemaining(cas)
                const urgCls    = urgencyClass(days)
                return (
                  <tr key={cas.id} className={`dash-row ${isInterim ? 'dash-row--interim' : ''}`}>
                    <td>
                      <div className="case-num-cell">
                        <div className="case-num-top">
                          <button
                            className="case-num-btn"
                            onClick={() => setCaseDetailsCase(cas)}
                            title={meta.case_number ?? ''}
                          >
                            {meta.case_number ?? '—'}
                          </button>
                          {isInterim && <span className="urgent-badge">URGENT</span>}
                        </div>
                        {cas.edits?.length > 0 && (
                          <button
                            className="edits-badge"
                            onClick={() => setEditHistoryCase(cas)}
                            title="View edit history"
                            aria-label={`${cas.edits.length} edit${cas.edits.length > 1 ? 's' : ''} made`}
                          >
                            ✏️ {cas.edits.length} edit{cas.edits.length > 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="col-date">{meta.order_date ?? '—'}</td>
                    <td className="col-court" title={meta.court_name ?? ''}>{meta.court_name ?? '—'}</td>
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
                    <td className="col-urgency">
                      <span className={`urgency-chip ${urgCls}`}>{urgencyLabel(days)}</span>
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
                      <div className="action-cell">
                        <button
                          className="view-btn"
                          onClick={() => setActionCase(cas)}
                          aria-label={`Open action center for ${meta.case_number}`}
                        >
                          Action Center
                        </button>
                        {!cas._isSample && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(cas.id)}
                            aria-label={`Delete ${meta.case_number}`}
                            title="Delete case"
                          >
                            🗑 Delete
                          </button>
                        )}
                      </div>
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
