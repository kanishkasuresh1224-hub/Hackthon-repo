export default function StatCard({ icon: Icon, label, value, note, tone = 'blue' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon"><Icon size={19} strokeWidth={1.8} /></span>
      </div>
      <strong className="stat-value">{value}</strong>
      {note && <span className="stat-note">{note}</span>}
    </article>
  )
}
