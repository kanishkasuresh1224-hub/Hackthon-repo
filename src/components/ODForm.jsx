import { useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Paperclip, Send } from 'lucide-react'
import { destinations, localDateString } from '../utils/validation'

export default function ODForm({ user, applications, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    studentName: user.name,
    registerNumber: user.registerNumber,
    department: user.department,
    yearSection: user.yearSection,
    purpose: '',
    destination: '',
    date: '',
    startTime: '',
    endTime: '',
    document: null,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSubmit(form)
    } catch (issue) {
      setError(issue.message || 'The request could not be submitted.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="form-page">
      <button className="back-link" onClick={onCancel}><ArrowLeft size={16} /> Back to overview</button>
      <div className="page-heading"><div><div className="eyebrow"><CalendarDays size={14} /> ON-DUTY REQUEST</div><h1>Apply for on-duty</h1><p>Share where you need to be on campus and when.</p></div></div>
      <div className="form-layout">
        <form className="od-form card" onSubmit={submit}>
          <div className="form-section-head"><span className="section-number">01</span><div><h2>Student details</h2><p>Your profile information is filled in for you.</p></div></div>
          <div className="form-grid">
            <label>Student name<input value={form.studentName} readOnly /></label>
            <label>Register number<input value={form.registerNumber} readOnly /></label>
            <label>Department<input value={form.department} readOnly /></label>
            <label>Year & section<input value={form.yearSection} readOnly /></label>
          </div>
          <div className="form-divider" />
          <div className="form-section-head"><span className="section-number">02</span><div><h2>Activity details</h2><p>All activities must take place within approved campus locations.</p></div></div>
          <div className="form-grid">
            <label className="field-full">Purpose of OD <input maxLength={100} placeholder="e.g. Project presentation" value={form.purpose} onChange={(e) => update('purpose', e.target.value)} required /></label>
            <label className="field-full">Campus destination
              <select value={form.destination} onChange={(e) => update('destination', e.target.value)} required>
                <option value="">Select a campus location</option>{destinations.map((destination) => <option key={destination}>{destination}</option>)}
              </select>
            </label>
            <label>OD date<input type="date" min={localDateString()} value={form.date} onChange={(e) => update('date', e.target.value)} required /></label>
            <div className="time-field">
              <label>Starting time<input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} required /></label>
              <label>Ending time<input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} required /></label>
            </div>
            <label className="field-full upload-field">Supporting document <span className="optional-label">OPTIONAL · MAX 1 MB</span>
              <span className="upload-control"><Paperclip size={17} /><span>{form.document?.name || 'Attach a supporting file'}</span><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return update('document', null)
                if (file.size > 1024 * 1024) { setError('Supporting documents must be 1 MB or smaller.'); e.target.value = ''; return }
                setError('')
                update('document', file)
              }} /></span>
              <small>PDF or image. Stored locally in this browser for the demo.</small>
            </label>
          </div>
          {error && <div className="inline-alert error">{error}</div>}
          <div className="form-footer"><span><CheckCircle2 size={15} /> Request will be sent to faculty for review.</span><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}{!busy && <Send size={16} />}</button></div>
        </form>
        <aside className="form-aside">
          <div className="aside-note"><span className="aside-note-icon"><CheckCircle2 size={18} /></span><strong>Before you submit</strong><p>Choose an approved location and make sure your OD times don't overlap another active request.</p><div className="aside-rule" /><small>{applications.length} previous {applications.length === 1 ? 'request' : 'requests'} on your record</small></div>
          <div className="aside-privacy"><strong>Campus-only activity</strong><p>This prototype does not track your location. No GPS is collected.</p></div>
        </aside>
      </div>
    </div>
  )
}
