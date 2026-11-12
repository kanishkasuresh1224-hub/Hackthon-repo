export function validateApplication(form, applications, studentId, now = new Date()) {
  const required = ['studentName', 'registerNumber', 'department', 'yearSection', 'purpose', 'destination', 'date', 'startTime', 'endTime']
  const missing = required.find((field) => !String(form[field] ?? '').trim())
  if (missing) return 'Please complete all required fields.'

  const selectedDate = new Date(`${form.date}T00:00:00`)
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (Number.isNaN(selectedDate.getTime()) || selectedDate < currentDate) return 'Past dates are not allowed.'

  if (form.endTime <= form.startTime) return 'End time must be later than start time.'

  const duplicate = applications.some((application) => {
    if (application.studentId !== studentId || application.date !== form.date || ['rejected', 'cancelled'].includes(application.status)) return false
    return form.startTime < application.endTime && form.endTime > application.startTime
  })
  if (duplicate) return 'This request overlaps another OD application for the selected date.'

  return ''
}

export function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const destinations = [
  'CSE Department',
  'Computer Lab',
  'Library',
  'Auditorium',
  'Seminar Hall',
  'Other approved campus location',
]
