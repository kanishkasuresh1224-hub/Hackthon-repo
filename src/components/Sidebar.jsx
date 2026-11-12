import { BookOpenCheck, Building2, ClipboardList, LayoutDashboard, LogOut, PlusCircle, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleTitles = { student: 'Student portal', staff: 'Faculty portal', hod: 'HOD workspace' }

export default function Sidebar({ onReset, onNavigate }) {
  const { user, logout } = useAuth()
  const root = `/${user.role}`
  const links = user.role === 'student'
    ? [{ to: root, label: 'Overview', icon: LayoutDashboard }, { to: `${root}/apply`, label: 'Apply for OD', icon: PlusCircle }, { to: `${root}/history`, label: 'My OD history', icon: ClipboardList }]
    : user.role === 'staff'
      ? [{ to: root, label: 'Approvals', icon: LayoutDashboard }, { to: `${root}/history`, label: 'Request history', icon: ClipboardList }]
      : [{ to: root, label: 'Overview', icon: LayoutDashboard }, { to: `${root}/records`, label: 'OD records', icon: ClipboardList }]

  return (
    <aside className="sidebar">
      <Link className="brand" to={root} aria-label="Campus OD Tracker home" onClick={onNavigate}>
        <span className="brand-mark"><BookOpenCheck size={21} /></span>
        <span><strong>Campus OD</strong><small>TRACKER</small></span>
      </Link>
      <div className="workspace-label">WORKSPACE</div>
      <div className="role-chip"><span className="role-dot" />{roleTitles[user.role]}</div>
      <nav className="side-nav" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === root} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            {label === 'Approvals' && <span className="nav-indicator" />}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {user.role === 'hod' && <div className="side-tip"><ShieldCheck size={17} /><span>Department operations<br />at a glance</span></div>}
        <button className="side-utility" onClick={onReset}><RotateCcw size={16} /> Reset demo data</button>
        <button className="side-utility" onClick={logout}><LogOut size={16} /> Sign out</button>
        <div className="sidebar-campus"><Building2 size={16} /> Computer Science</div>
      </div>
    </aside>
  )
}
