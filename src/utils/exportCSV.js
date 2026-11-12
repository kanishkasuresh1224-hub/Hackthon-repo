const csvCell = (value) => {
  const text = String(value ?? '')
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export function exportApplicationsCSV(applications) {
  const columns = ['Request ID', 'Student', 'Register Number', 'Department', 'Year / Section', 'Purpose', 'Destination', 'Date', 'Start Time', 'End Time', 'Status', 'Activity Status', 'Reviewed By', 'Remarks', 'Rejection Reason']
  const rows = applications.map((item) => [
    item.id, item.studentName, item.registerNumber, item.department, item.yearSection, item.purpose,
    item.destination, item.date, item.startTime, item.endTime, item.status, item.activityStatus,
    item.reviewer, item.remarks, item.rejectionReason,
  ])
  const content = [columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `campus-od-report-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.append(link)
  link.click()
  window.setTimeout(() => {
    link.remove()
    URL.revokeObjectURL(url)
  }, 1000)
}
