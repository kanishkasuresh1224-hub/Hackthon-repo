import { ArrowUpRight, FileText } from 'lucide-react'
import StatusBadge from './StatusBadge'

const prettyDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })

export default function ODTable({ applications, showStudent = false, showReview = false, onSelect, emptyTitle = 'No OD requests found', emptyText = 'Try adjusting your filters or check back later.' }) {
  return (
    <div className="table-scroll">
      <table className="od-table">
        <thead><tr>{showStudent && <th>STUDENT</th>}<th>OD PURPOSE</th><th>DESTINATION</th><th>DATE & TIME</th><th>STATUS</th><th>ACTIVITY</th>{showReview && <th>STAFF REVIEW</th>}<th /></tr></thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id} onClick={() => onSelect?.(application)} className={onSelect ? 'row-clickable' : ''}>
              {showStudent && <td><div className="student-cell"><span className="mini-avatar">{application.studentName.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span><span><strong>{application.studentName}</strong><small>{application.registerNumber}</small></span></div></td>}
              <td><strong className="purpose-text">{application.purpose}</strong><small className="table-secondary">ID · {application.id}</small></td>
              <td><span className="destination-cell">{application.destination}</span></td>
              <td><strong>{prettyDate(application.date)}</strong><small className="table-secondary">{application.startTime} – {application.endTime}</small></td>
              <td><StatusBadge status={application.status} /></td>
              <td><StatusBadge status={application.activityStatus || 'not-started'} /></td>
              {showReview && <td><strong>{application.reviewer || 'Awaiting review'}</strong><small className="table-secondary">{application.remarks || application.rejectionReason || 'No remarks'}</small></td>}
              <td>{application.documentName && <span className="document-chip" title={application.documentName}><FileText size={14} /></span>}<ArrowUpRight className="row-arrow" size={16} /></td>
            </tr>
          ))}
          {applications.length === 0 && <tr><td colSpan={(showStudent ? 1 : 0) + (showReview ? 1 : 0) + 6}><div className="empty-state"><span className="empty-icon"><FileText size={22} /></span><strong>{emptyTitle}</strong><p>{emptyText}</p></div></td></tr>}
        </tbody>
      </table>
    </div>
  )
}
