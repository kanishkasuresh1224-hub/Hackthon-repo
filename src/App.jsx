import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowDownToLine, ArrowRight, BadgeCheck, BookOpen, CalendarCheck2, CalendarClock,
  ChartNoAxesCombined, Check, CheckCircle2, ChevronRight, Clock3, FileCheck2, FilePlus2,
  GraduationCap, MapPin, Search, Send, Users, X,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { AuthProvider, demoUsers, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ODForm from './components/ODForm'
import ODTable from './components/ODTable'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import StatusBadge from './components/StatusBadge'
import { loadState, resetState, saveState } from './services/storageService'
import { localDateString, validateApplication } from './utils/validation'
import { exportApplicationsCSV } from './utils/exportCSV'

const today = () => localDateString()
const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
const formatTimestamp = (date) => date ? new Date(date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const roleHome = (role) => `/${role}`
const makeId = () => `OD-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

function AppFrame({ data, onRead, onReset, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className={`app-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      {sidebarOpen && <button className="mobile-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <Sidebar onReset={onReset} onNavigate={() => setSidebarOpen(false)} />
      <div className="main-column">
        <Navbar allNotifications={data.notifications} onRead={onRead} onToggleSidebar={() => setSidebarOpen((open) => !open)} sidebarOpen={sidebarOpen} />
        <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>{children}</main>
        <footer className="app-footer"><span>Campus OD Tracker <span className="footer-dot">·</span> Internal college prototype</span><span>Campus-only activity <span className="footer-dot">·</span> No location tracking</span></footer>
      </div>
    </div>
  )
}

function PageTitle({ eyebrow, title, description, actions }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>
}

function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const enter = (role) => {
    login(role)
    navigate(roleHome(role))
  }
  if (user) return <Navigate to={roleHome(user.role)} replace />
  const roles = [
    { key: 'student', title: 'Student', desc: 'Apply for on-duty and track activity updates.', icon: GraduationCap, email: demoUsers.student.email, initial: 'AR' },
    { key: 'staff', title: 'Staff / Faculty', desc: 'Review student applications and manage approvals.', icon: BookOpen, email: demoUsers.staff.email, initial: 'MN' },
    { key: 'hod', title: 'Head of Department', desc: 'Monitor department-wide OD activity and reports.', icon: ChartNoAxesCombined, email: demoUsers.hod.email, initial: 'AM' },
  ]
  return (
    <div className="login-page">
      <div className="login-art"><div className="login-art-top"><span className="brand-mark"><BookOpen size={22} /></span><span>Campus OD <small>TRACKER</small></span></div>
        <div className="art-content"><div className="art-tag"><span /> SMART ON-DUTY MANAGEMENT</div><h1>Campus time,<br /><em>made accountable.</em></h1><p>A simpler way to manage on-duty requests, keep faculty in sync, and stay focused on what matters.</p>
          <div className="art-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-card"><div className="visual-card-top"><span>Today's activity</span><span className="visual-live">LIVE</span></div><strong>12 <small>requests</small></strong><div className="visual-bars"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="visual-card-bottom"><span>Department overview</span><span>•••</span></div></div><div className="floating-badge"><span><Check size={14} /></span> All in one place</div></div>
        </div><div className="login-art-footer"><span>DESIGNED FOR CAMPUS OPERATIONS</span><span>01 — 03</span></div>
      </div>
      <div className="login-panel"><div className="login-mobile-brand"><span className="brand-mark"><BookOpen size={20} /></span><strong>Campus OD Tracker</strong></div><div className="login-content">
        <span className="login-kicker">WELCOME TO YOUR WORKSPACE</span><h2>Sign in to continue</h2><p className="login-intro">Select your role to enter the Campus OD Tracker demo.</p>
        <div className="demo-label"><span>DEMO ACCOUNTS</span><i /></div>
        <div className="role-list">{roles.map(({ key, title, desc, icon: Icon, email, initial }) => <button className="role-card" key={key} onClick={() => enter(key)}><span className={`role-icon role-icon-${key}`}><Icon size={20} /></span><span className="role-copy"><strong>{title}</strong><small>{desc}</small><em>{email}</em></span><span className="role-arrow"><ArrowRight size={17} /></span><span className="role-initials">{initial}</span></button>)}</div>
        <div className="demo-notice"><span>i</span><p>Demo access uses local browser storage. Role checks here are for demonstration only; connect Firebase Auth and backend authorization before production use.</p></div>
        <div className="login-privacy"><span>🔒</span> Prototype data stays in this browser <span className="privacy-sep">·</span> Not shared across users</div>
      </div><div className="login-panel-footer">CAMPUS OD TRACKER <span>© 2026</span></div></div>
    </div>
  )
}

function StudentOverview({ data, onApply, onUpdateActivity, onComplete }) {
  const { user } = useAuth()
  const own = data.applications.filter((application) => application.studentId === user.id)
  const pending = own.filter((application) => application.status === 'pending').length
  const approved = own.filter((application) => application.status === 'approved').length
  const rejected = own.filter((application) => application.status === 'rejected').length
  const recent = [...own].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5)
  return (
    <>
      <PageTitle eyebrow="STUDENT WORKSPACE" title={`Good morning, ${user.name.split(' ')[0]}`} description="Here's your on-duty activity at a glance." actions={<button className="button button-primary" onClick={onApply}><FilePlus2 size={17} /> New OD request</button>} />
      <div className="student-welcome"><div className="welcome-icon"><GraduationCap size={22} /></div><div><strong>{user.name}</strong><span>{user.registerNumber} <i /> {user.department} <i /> {user.yearSection}</span></div><div className="welcome-tag">STUDENT PROFILE <BadgeCheck size={15} /></div></div>
      <div className="stats-grid four">
        <StatCard icon={FileCheck2} label="Total requests" value={own.length} note="All-time applications" />
        <StatCard icon={CalendarClock} label="Pending" value={pending} note="Awaiting faculty review" tone="amber" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} note="Ready for campus activity" tone="green" />
        <StatCard icon={X} label="Rejected" value={rejected} note="Review feedback below" tone="rose" />
      </div>
      <section className="content-card">
      <div className="section-heading"><div><div className="eyebrow">YOUR REQUESTS</div><h2>Recent OD activity</h2></div><Link className="text-link" to="/student/history">View all <ChevronRight size={15} /></Link></div>
        <ODTable applications={recent} emptyTitle="No requests yet" emptyText="Create your first on-duty request to get started." />
      </section>
      {own.some((application) => application.status === 'approved' && application.date === today() && application.activityStatus !== 'completed') && <section className="content-card activity-card">
        <div className="section-heading"><div><div className="eyebrow">CAMPUS ACTIVITY</div><h2>Approved activities</h2><p className="section-subtitle">Share a progress update or mark an activity complete.</p></div><span className="campus-only-note"><MapPin size={14} /> Campus-only</span></div>
        <div className="activity-list">{own.filter((application) => application.status === 'approved' && application.activityStatus !== 'completed').map((application) => <ActivityItem key={application.id} application={application} onUpdate={onUpdateActivity} onComplete={onComplete} />)}</div>
      </section>}
    </>
  )
}

function ActivityItem({ application, onUpdate, onComplete }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const submitUpdate = (event) => {
    event.preventDefault()
    if (!text.trim()) { setError('Write a short update before submitting.'); return }
    onUpdate(application.id, text.trim())
    setText('')
    setError('')
  }
  return <div className="activity-item"><div className="activity-item-main"><div className="activity-pin"><MapPin size={17} /></div><div><strong>{application.destination}</strong><span>{formatDate(application.date)} · {application.startTime}–{application.endTime}</span></div><StatusBadge status={application.activityStatus} /></div>
    {application.activityUpdates?.map((update) => <div className="activity-update" key={update.id}><span className="update-line" /><p>{update.text}<small>{formatTimestamp(update.createdAt)}</small></p></div>)}
    <form className="activity-form" onSubmit={submitUpdate}><input maxLength={240} placeholder="Share a quick activity update…" value={text} onChange={(e) => setText(e.target.value)} /><button className="button button-soft" type="submit"><Send size={14} /> Update</button><button type="button" className="button button-complete" onClick={() => onComplete(application.id)}><CheckCircle2 size={15} /> Mark complete</button></form>
    {error && <small className="field-error">{error}</small>}
    <div className="activity-disclaimer">No GPS or continuous location tracking is used. Updates are self-reported.</div>
  </div>
}

function StudentHistory({ data, onApply, onUpdateActivity, onComplete }) {
  const { user } = useAuth()
  const own = [...data.applications.filter((application) => application.studentId === user.id)].sort((a, b) => b.date.localeCompare(a.date))
  return <>
    <PageTitle eyebrow="STUDENT WORKSPACE" title="My OD history" description="Review request decisions and follow activity progress." actions={<button className="button button-primary" onClick={onApply}><FilePlus2 size={17} /> New OD request</button>} />
    <section className="content-card"><div className="section-heading"><div><div className="eyebrow">APPLICATION HISTORY</div><h2>All requests <span className="count-pill">{own.length}</span></h2></div></div><ODTable applications={own} emptyTitle="No OD history yet" emptyText="Submitted requests will appear here." /></section>
    <section className="content-card"><div className="section-heading"><div><div className="eyebrow">ACTIVITY MONITORING</div><h2>Approved activities</h2><p className="section-subtitle">Activity progress is self-reported and limited to campus requests.</p></div></div>
      <div className="activity-list">{own.filter((application) => application.status === 'approved').map((application) => <ActivityItem key={application.id} application={application} onUpdate={onUpdateActivity} onComplete={onComplete} />)}
      {!own.some((application) => application.status === 'approved') && <div className="empty-inline">Approved OD activities will appear here.</div>}</div>
    </section>
  </>
}

function ODApplicationPage({ data, onSubmit, onCancel }) {
  const { user } = useAuth()
  const own = data.applications.filter((application) => application.studentId === user.id)
  return <ODForm user={user} applications={own} onCancel={onCancel} onSubmit={(form) => onSubmit(form, own)} />
}

function StaffDashboard({ data, onReview }) {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [date, setDate] = useState('')
  const [selected, setSelected] = useState(null)
  const requests = useMemo(() => data.applications.filter((application) => {
    const text = `${application.studentName} ${application.registerNumber}`.toLowerCase()
    return (!query || text.includes(query.toLowerCase())) && (status === 'all' || application.status === status) && (!date || application.date === date)
  }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)), [data.applications, query, status, date])
  const pending = data.applications.filter((item) => item.status === 'pending').length
  const approved = data.applications.filter((item) => item.status === 'approved').length
  const rejected = data.applications.filter((item) => item.status === 'rejected').length
  const history = location.pathname.endsWith('/history')
  return <>
    <PageTitle eyebrow="FACULTY WORKSPACE" title={history ? 'Request history' : 'OD approvals'} description={history ? 'Browse department decisions and student activity status.' : 'Review and manage on-duty requests from your department.'} actions={<span className="date-display"><CalendarDaysIcon /> {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>} />
    <div className="stats-grid three">
      <StatCard icon={Clock3} label="Awaiting review" value={pending} note="Requests need your attention" tone="amber" />
      <StatCard icon={CheckCircle2} label="Approved" value={approved} note="Department requests" tone="green" />
      <StatCard icon={X} label="Rejected" value={rejected} note="With feedback recorded" tone="rose" />
    </div>
    <section className="content-card">
      <div className="section-heading"><div><div className="eyebrow">{history ? 'DECISION LOG' : 'REQUEST QUEUE'}</div><h2>{history ? 'Department requests' : 'Applications to review'} <span className="count-pill">{requests.length}</span></h2></div></div>
      <div className="filters-row"><label className="search-field"><Search size={17} /><input placeholder="Search name or register number" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><input className="date-filter" type="date" aria-label="Filter by date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <ODTable applications={requests} showStudent onSelect={setSelected} emptyTitle="No matching requests" emptyText="Update the filters or clear your search." />
    </section>
    {selected && <RequestDetails application={selected} onClose={() => setSelected(null)} onReview={(id, decision, reason, remarks) => { onReview(id, decision, reason, remarks); setSelected(null) }} />}
  </>
}

function CalendarDaysIcon() {
  return <CalendarCheck2 size={16} />
}

function RequestDetails({ application, onClose, onReview }) {
  const [decision, setDecision] = useState('')
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState(application.remarks || '')
  const [error, setError] = useState('')
  const submitDecision = () => {
    if (!decision) return
    if (decision === 'rejected' && !reason.trim()) { setError('A rejection reason is required.'); return }
    const verb = decision === 'approved' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${verb} this OD request?`)) return
    onReview(application.id, decision, reason.trim(), remarks.trim())
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
    <div className="modal-header"><div><span className="eyebrow">REQUEST DETAILS · {application.id}</span><h2 id="detail-title">{application.studentName}</h2><p>{application.registerNumber} <i /> {application.department} · {application.yearSection}</p></div><button className="icon-button" onClick={onClose} aria-label="Close details"><X size={19} /></button></div>
    <div className="detail-status"><StatusBadge status={application.status} /><span>Submitted {formatTimestamp(application.submittedAt)}</span></div>
    <div className="detail-grid"><div><small>PURPOSE</small><strong>{application.purpose}</strong></div><div><small>DESTINATION</small><strong>{application.destination}</strong></div><div><small>DATE & TIME</small><strong>{formatDate(application.date)} · {application.startTime}–{application.endTime}</strong></div><div><small>SUPPORTING DOCUMENT</small><strong>{application.documentName || 'Not provided'}</strong></div></div>
    {application.activityUpdates?.length > 0 && <div className="detail-activity"><strong>Activity updates</strong>{application.activityUpdates.map((update) => <p key={update.id}>{update.text}<small>{formatTimestamp(update.createdAt)}</small></p>)}<StatusBadge status={application.activityStatus} /></div>}
    {application.status === 'pending' ? <>
      <label className="modal-label">Faculty remarks <textarea maxLength={300} rows={2} placeholder="Optional notes for the student" value={remarks} onChange={(e) => setRemarks(e.target.value)} /></label>
      {decision === 'rejected' && <label className="modal-label">Reason for rejection <textarea maxLength={300} rows={2} placeholder="Explain why this request cannot be approved" value={reason} onChange={(e) => setReason(e.target.value)} required /></label>}
      {error && <div className="inline-alert error">{error}</div>}
      <div className="modal-actions"><button className="button button-outline" onClick={() => { setDecision('rejected'); setError('') }}><X size={15} /> Reject</button><button className="button button-primary" onClick={() => decision ? submitDecision() : setDecision('approved')}><Check size={16} /> {decision === 'approved' ? 'Confirm approval' : decision === 'rejected' ? 'Confirm rejection' : 'Approve request'}</button></div>
    </> : <div className="decision-summary"><strong>{application.status === 'approved' ? 'Reviewed by' : 'Rejection reason'}</strong><p>{application.status === 'approved' ? application.reviewer : application.rejectionReason}</p>{application.remarks && <><strong>Faculty remarks</strong><p>{application.remarks}</p></>}</div>}
  </section></div>
}

const CHART_COLORS = ['#3968cc', '#21a67a', '#f3a448', '#8e76d8', '#e16e77', '#31a6b0']

function HODDashboard({ data, onExport }) {
  const applications = data.applications
  const pending = applications.filter((item) => item.status === 'pending').length
  const approved = applications.filter((item) => item.status === 'approved').length
  const rejected = applications.filter((item) => item.status === 'rejected').length
  const currentTime = new Date().toTimeString().slice(0, 5)
  const activeStudents = new Set(applications.filter((item) => item.status === 'approved' && item.date === today() && item.startTime <= currentTime && item.endTime >= currentTime).map((item) => item.studentId)).size
  const submittedToday = applications.filter((item) => localDateString(new Date(item.submittedAt)) === today()).length
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - (5 - index))
      return { key: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`, month: monthDate.toLocaleString([], { month: 'short' }), applications: 0 }
    })
    applications.forEach((item) => {
      const month = months.find((entry) => entry.key === item.submittedAt.slice(0, 7))
      if (month) month.applications += 1
    })
    return months
  }, [applications])
  const statusData = [{ name: 'Approved', value: approved }, { name: 'Rejected', value: rejected }]
  const destinations = useMemo(() => {
    const counts = applications.reduce((acc, item) => ({ ...acc, [item.destination]: (acc[item.destination] || 0) + 1 }), {})
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [applications])
  const purposes = useMemo(() => {
    const counts = applications.reduce((acc, item) => ({ ...acc, [item.purpose]: (acc[item.purpose] || 0) + 1 }), {})
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [applications])
  const latest = [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5)
  return <>
    <PageTitle eyebrow="DEPARTMENT OVERVIEW" title="Good morning, Dr. Menon" description="A clear view of on-duty activity across Computer Science." actions={<button className="button button-outline" onClick={onExport}><ArrowDownToLine size={17} /> Export report</button>} />
    <div className="stats-grid six">
      <StatCard icon={FileCheck2} label="Total applications" value={applications.length} note="Department records" />
      <StatCard icon={Clock3} label="Pending" value={pending} note="Awaiting staff review" tone="amber" />
      <StatCard icon={CheckCircle2} label="Approved" value={approved} note="Approved requests" tone="green" />
      <StatCard icon={X} label="Rejected" value={rejected} note="Decision recorded" tone="rose" />
      <StatCard icon={Activity} label="Students on OD" value={activeStudents} note="Active approved OD now" tone="purple" />
      <StatCard icon={CalendarCheck2} label="Applications today" value={submittedToday} note="Submitted today" tone="cyan" />
    </div>
    <div className="analytics-grid">
      <section className="content-card chart-card monthly-chart"><div className="section-heading"><div><div className="eyebrow">APPLICATION VOLUME</div><h2>Monthly OD applications</h2></div><span className="chart-legend-dot">Requests</span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}><CartesianGrid stroke="#edf1f7" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a96a9', fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8a96a9', fontSize: 11 }} /><Tooltip cursor={{ fill: '#f5f8fc' }} contentStyle={{ border: '1px solid #e8edf4', borderRadius: 10, fontSize: 12 }} /><Bar dataKey="applications" name="Applications" fill="#4776d0" radius={[5, 5, 0, 0]} barSize={30} /></BarChart></ResponsiveContainer></div></section>
      <section className="content-card chart-card status-chart"><div className="section-heading"><div><div className="eyebrow">REQUEST OUTCOMES</div><h2>Approved vs rejected</h2></div></div><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" innerRadius={58} outerRadius={80} paddingAngle={4} stroke="none">{statusData.map((item, index) => <Cell key={item.name} fill={['#22a67a', '#e2747d'][index]} />)}</Pie><Tooltip contentStyle={{ border: '1px solid #e8edf4', borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{approved + rejected}</strong><span>decisions</span></div></div><div className="chart-key">{statusData.map((item, index) => <span key={item.name}><i style={{ background: ['#22a67a', '#e2747d'][index] }} />{item.name}<strong>{item.value}</strong></span>)}</div></section>
      <section className="content-card chart-card destination-chart"><div className="section-heading"><div><div className="eyebrow">CAMPUS FOOTPRINT</div><h2>Popular destinations</h2></div><MapPin size={17} className="muted-icon" /></div>{destinations.length === 0 ? <div className="empty-inline">No destination data yet.</div> : <div className="dest-chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={destinations} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 3 }}><CartesianGrid stroke="#edf1f7" horizontal={false} /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8a96a9', fontSize: 9 }} /><YAxis type="category" dataKey="name" width={104} axisLine={false} tickLine={false} tick={{ fill: '#738298', fontSize: 8 }} /><Tooltip cursor={{ fill: '#f5f8fc' }} contentStyle={{ border: '1px solid #e8edf4', borderRadius: 10, fontSize: 11 }} /><Bar dataKey="value" name="OD requests" fill="#4776d0" radius={[0, 4, 4, 0]} barSize={13} /></BarChart></ResponsiveContainer></div>}</section>
      <section className="content-card chart-card destination-chart"><div className="section-heading"><div><div className="eyebrow">ACTIVITY MIX</div><h2>Top OD purposes</h2></div><BookOpen size={17} className="muted-icon" /></div><div className="destination-bars">{purposes.map((item, index) => <div className="destination-bar-row" key={item.name}><div><span>{item.name}</span><strong>{item.value}</strong></div><span className="bar-track"><i style={{ width: `${Math.max(8, item.value / Math.max(...purposes.map((entry) => entry.value)) * 100)}%`, background: CHART_COLORS[index] }} /></span></div>)}{purposes.length === 0 && <div className="empty-inline">No purpose data yet.</div>}</div></section>
    </div>
    <section className="content-card"><div className="section-heading"><div><div className="eyebrow">DEPARTMENT RECORDS</div><h2>Recent OD applications</h2></div><Link className="text-link" to="/hod/records">View all records <ChevronRight size={15} /></Link></div><ODTable applications={latest} showStudent showReview /></section>
    <div className="report-footnote"><ShieldCheckIcon /> Department reports reflect data saved in this browser only. Records are not shared across devices.</div>
  </>
}

function ShieldCheckIcon() {
  return <BadgeCheck size={15} />
}

function HODRecords({ data, onExport }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [destination, setDestination] = useState('all')
  const [date, setDate] = useState('')
  const destinations = [...new Set(data.applications.map((application) => application.destination))].sort()
  const filtered = data.applications.filter((application) => {
    const text = `${application.studentName} ${application.registerNumber} ${application.purpose}`.toLowerCase()
    return (!query || text.includes(query.toLowerCase())) && (status === 'all' || application.status === status) && (destination === 'all' || application.destination === destination) && (!date || application.date === date)
  }).sort((a, b) => b.date.localeCompare(a.date))
  return <>
    <PageTitle eyebrow="ADMINISTRATION" title="Department OD records" description="Search student history, staff decisions, and campus activity." actions={<button className="button button-outline" onClick={() => onExport(filtered)}><ArrowDownToLine size={17} /> Export filtered report</button>} />
    <div className="stats-grid three compact-stats"><StatCard icon={Users} label="Students with OD" value={new Set(data.applications.map((item) => item.studentId)).size} note="Unique student accounts" /><StatCard icon={MapPin} label="Campus destinations" value={destinations.length} note="Locations used" tone="cyan" /><StatCard icon={Activity} label="Activities completed" value={data.applications.filter((item) => item.activityStatus === 'completed').length} note="Student-reported completions" tone="green" /></div>
    <section className="content-card"><div className="section-heading"><div><div className="eyebrow">ALL DEPARTMENT ACTIVITY</div><h2>OD records <span className="count-pill">{filtered.length}</span></h2></div></div>
      <div className="filters-row"><label className="search-field"><Search size={17} /><input placeholder="Search student, register no. or purpose" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><select value={destination} onChange={(e) => setDestination(e.target.value)} aria-label="Filter by destination"><option value="all">All destinations</option>{destinations.map((item) => <option key={item}>{item}</option>)}</select><input type="date" aria-label="Filter by activity date" className="date-filter" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <ODTable applications={filtered} showStudent showReview emptyTitle="No records match" emptyText="Change or clear the selected filters." />
    </section>
    <div className="report-footnote"><ShieldCheckIcon /> Activity status is self-reported. QR verification is a future integration; this prototype does not implement QR or GPS.</div>
  </>
}

function AuthenticatedLayout({ data, onRead, onReset, children }) {
  return <AppFrame data={data} onRead={onRead} onReset={onReset}>{children}</AppFrame>
}

function AppContent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(loadState)
  const [toast, setToast] = useState('')
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    try {
      saveState(data)
      setStorageError('')
    } catch (error) {
      console.error('Unable to save Campus OD Tracker data:', error)
      setStorageError('Changes could not be saved in this browser. Check available local storage.')
    }
  }, [data])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const pushNotification = (recipient, title, message) => ({ id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, recipient, title, message, createdAt: new Date().toISOString(), read: false })
  const markRead = () => setData((current) => ({ ...current, notifications: current.notifications.map((notification) => notification.recipient === user?.role ? { ...notification, read: true } : notification) }))

  const submitApplication = async (form, ownApplications) => {
    const validationError = validateApplication(form, ownApplications, user.id)
    if (validationError) throw new Error(validationError)
    let documentData = ''
    if (form.document) {
      documentData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('The supporting document could not be read. Please try again.'))
        reader.readAsDataURL(form.document)
      })
    }
    const application = {
      ...Object.fromEntries(Object.entries(form).filter(([key]) => key !== 'document')),
      id: makeId(),
      studentId: user.id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewer: '',
      remarks: '',
      activityStatus: 'not-started',
      activityUpdates: [],
      documentName: form.document?.name || '',
      documentData,
    }
    setData((current) => ({
      ...current,
      applications: [application, ...current.applications],
      notifications: [
        pushNotification('student', 'OD request submitted', `Your request for ${application.destination} is awaiting faculty review.`),
        pushNotification('staff', 'New OD request', `${application.studentName} submitted a request for ${application.destination}.`),
        ...current.notifications,
      ],
    }))
    setToast('OD request submitted successfully.')
    navigate('/student')
  }

  const reviewApplication = (id, decision, rejectionReason, remarks) => {
    const target = data.applications.find((application) => application.id === id)
    if (!target || target.status !== 'pending') {
      setToast('This request has already been reviewed.')
      return
    }
    if (decision === 'rejected' && !rejectionReason.trim()) {
      setToast('A rejection reason is required.')
      return
    }
    const reviewedAt = new Date().toISOString()
    setData((current) => ({
      ...current,
      applications: current.applications.map((application) => application.id === id ? {
        ...application, status: decision, rejectionReason: decision === 'rejected' ? rejectionReason : '', remarks,
        reviewedAt, reviewer: demoUsers.staff.name,
      } : application),
      notifications: [
        pushNotification(target.studentId, decision === 'approved' ? 'OD request approved' : 'OD request rejected', decision === 'approved' ? `Your request for ${target.destination} was approved.` : `Your request was rejected: ${rejectionReason}`),
        pushNotification('hod', 'OD request reviewed', `${target.studentName}'s request was ${decision} by ${demoUsers.staff.name}.`),
        ...current.notifications,
      ],
    }))
    setToast(`OD request ${decision}.`)
  }

  const updateActivity = (id, text) => {
    setData((current) => ({
      ...current,
      applications: current.applications.map((application) => application.id === id && application.status === 'approved' && application.activityStatus !== 'completed'
        ? { ...application, activityStatus: 'in-progress', activityUpdates: [...(application.activityUpdates || []), { id: `UP-${Date.now()}`, text, createdAt: new Date().toISOString() }] }
        : application),
      notifications: [pushNotification('staff', 'Activity update submitted', `${user.name} submitted an activity update.`), pushNotification('hod', 'Activity update submitted', `${user.name} submitted an activity update.`), ...current.notifications],
    }))
    setToast('Activity update submitted.')
  }

  const completeActivity = (id) => {
    const application = data.applications.find((item) => item.id === id)
    if (!application || application.status !== 'approved') return
    if (!window.confirm(`Mark the ${application.destination} activity as completed?`)) return
    setData((current) => ({
      ...current,
      applications: current.applications.map((item) => item.id === id ? { ...item, activityStatus: 'completed', completedAt: new Date().toISOString() } : item),
      notifications: [pushNotification('staff', 'Activity completed', `${user.name} marked an activity at ${application.destination} complete.`), pushNotification('hod', 'Activity completed', `${user.name} marked an activity at ${application.destination} complete.`), ...current.notifications],
    }))
    setToast('Activity marked as completed.')
  }

  const resetDemo = () => {
    if (!window.confirm('Reset all Campus OD Tracker data to the original demo records? Your local changes will be removed.')) return
    try {
      setData(resetState())
      setToast('Demo data has been reset.')
    } catch (error) {
      console.error('Unable to reset demo data:', error)
      setStorageError('Demo data could not be reset. Check browser storage settings.')
    }
  }

  const applyAction = () => navigate('/student/apply')
  const notifyProps = { data, onRead: markRead, onReset: resetDemo }
  const privateRoute = (role, element) => <ProtectedRoute role={role}><AuthenticatedLayout {...notifyProps}>{element}</AuthenticatedLayout></ProtectedRoute>

  return <>
    {storageError && <div className="storage-warning" role="alert">{storageError}</div>}
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/student" element={privateRoute('student', <StudentOverview data={data} onApply={applyAction} onUpdateActivity={updateActivity} onComplete={completeActivity} />)} />
      <Route path="/student/apply" element={privateRoute('student', <ODApplicationPage data={data} onSubmit={submitApplication} onCancel={() => navigate('/student')} />)} />
      <Route path="/student/history" element={privateRoute('student', <StudentHistory data={data} onApply={applyAction} onUpdateActivity={updateActivity} onComplete={completeActivity} />)} />
      <Route path="/staff" element={privateRoute('staff', <StaffDashboard data={data} onReview={reviewApplication} />)} />
      <Route path="/staff/history" element={privateRoute('staff', <StaffDashboard data={data} onReview={reviewApplication} />)} />
      <Route path="/hod" element={privateRoute('hod', <HODDashboard data={data} onExport={() => exportApplicationsCSV(data.applications)} />)} />
      <Route path="/hod/records" element={privateRoute('hod', <HODRecords data={data} onExport={exportApplicationsCSV} />)} />
      <Route path="/" element={<Navigate to={user ? roleHome(user.role) : '/login'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    {toast && <div className="toast" role="status"><CheckCircle2 size={18} /><span>{toast}</span><button onClick={() => setToast('')} aria-label="Dismiss message"><X size={16} /></button></div>}
  </>
}

function NotFound() {
  const { user } = useAuth()
  return <div className="not-found"><div className="not-found-card"><span className="not-found-icon"><FileCheck2 size={26} /></span><div className="eyebrow">404 · PAGE NOT FOUND</div><h1>This page isn't here.</h1><p>The page may have moved or you may not have access to it.</p><a className="button button-primary" href={user ? roleHome(user.role) : '/login'}>Back to your workspace <ArrowRight size={16} /></a></div></div>
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
