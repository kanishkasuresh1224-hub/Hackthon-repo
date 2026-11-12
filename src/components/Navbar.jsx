import { Bell, ChevronDown, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const formatTime = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export default function Navbar({ allNotifications, onRead, onToggleSidebar, sidebarOpen }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const notifications = allNotifications.filter((item) => item.recipient === user.role)
  const unread = notifications.filter((item) => !item.read).length
  const initials = user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')

  const toggle = () => {
    setOpen((value) => !value)
    if (unread) onRead()
  }

  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={onToggleSidebar} aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="breadcrumb"><span>Computer Science</span><span className="crumb-slash">/</span><strong>{user.role === 'hod' ? 'Administration' : user.role === 'staff' ? 'Faculty' : 'Student'}</strong></div>
      <div className="topbar-right">
        <div className="notification-wrap">
          <button className={`icon-button notification-button${unread ? ' has-unread' : ''}`} onClick={toggle} aria-label={`Notifications, ${unread} unread`}>
            <Bell size={19} />{unread > 0 && <span className="notification-count">{unread}</span>}
          </button>
          {open && <div className="notification-popover">
            <div className="popover-heading"><strong>Notifications</strong><span>{notifications.length} recent</span></div>
            {notifications.length === 0 ? <div className="popover-empty">You're all caught up.</div> : notifications.slice(0, 8).map((notification) => (
              <div className="notification-item" key={notification.id}>
                <span className={`notification-dot${notification.read ? ' read' : ''}`} />
                <div><strong>{notification.title}</strong><p>{notification.message}</p><small>{formatTime(notification.createdAt)}</small></div>
              </div>
            ))}
          </div>}
        </div>
        <div className="user-menu"><span className="avatar">{initials}</span><span className="user-menu-name"><strong>{user.name}</strong><small>{user.role.toUpperCase()}</small></span><ChevronDown size={15} /></div>
      </div>
    </header>
  )
}
