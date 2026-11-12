const STORAGE_KEY = 'campus-od-tracker-v1'

const today = new Date()
const localDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateOffset = (offset) => {
  const date = new Date(today)
  date.setDate(date.getDate() + offset)
  return localDateString(date)
}

const initialState = () => ({
  applications: [
    {
      id: 'OD-2026-001',
      studentId: 'student',
      studentName: 'Ananya Raman',
      registerNumber: '22CS104',
      department: 'Computer Science',
      yearSection: 'III Year · A',
      purpose: 'Project presentation',
      destination: 'Seminar Hall',
      date: dateOffset(0),
      startTime: '10:00',
      endTime: '12:00',
      status: 'approved',
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewedAt: new Date(Date.now() - 86400000).toISOString(),
      reviewer: 'Dr. Meera Nair',
      remarks: 'Approved. Please be on time.',
      activityStatus: 'in-progress',
      activityUpdates: [{ id: 'up-1', text: 'Reached the seminar hall and started setup.', createdAt: new Date(Date.now() - 1800000).toISOString() }],
      documentName: '',
    },
    {
      id: 'OD-2026-002',
      studentId: 'student',
      studentName: 'Ananya Raman',
      registerNumber: '22CS104',
      department: 'Computer Science',
      yearSection: 'III Year · A',
      purpose: 'Library research',
      destination: 'Library',
      date: dateOffset(1),
      startTime: '14:00',
      endTime: '16:00',
      status: 'pending',
      submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      reviewedAt: null,
      reviewer: '',
      remarks: '',
      activityStatus: 'not-started',
      activityUpdates: [],
      documentName: '',
    },
    {
      id: 'OD-2026-003',
      studentId: 'student',
      studentName: 'Ananya Raman',
      registerNumber: '22CS104',
      department: 'Computer Science',
      yearSection: 'III Year · A',
      purpose: 'Department event volunteering',
      destination: 'Auditorium',
      date: dateOffset(-2),
      startTime: '09:00',
      endTime: '11:30',
      status: 'rejected',
      submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      reviewer: 'Dr. Meera Nair',
      remarks: 'Please coordinate with the event faculty first.',
      rejectionReason: 'Event schedule confirmation is pending.',
      activityStatus: 'not-started',
      activityUpdates: [],
      documentName: '',
    },
    {
      id: 'OD-2026-004',
      studentId: 'student-2',
      studentName: 'Rahul Kumar',
      registerNumber: '22CS118',
      department: 'Computer Science',
      yearSection: 'III Year · B',
      purpose: 'Lab equipment workshop',
      destination: 'Computer Lab',
      date: dateOffset(0),
      startTime: '13:00',
      endTime: '15:00',
      status: 'pending',
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      reviewedAt: null,
      reviewer: '',
      remarks: '',
      activityStatus: 'not-started',
      activityUpdates: [],
      documentName: '',
    },
    {
      id: 'OD-2026-005',
      studentId: 'student-3',
      studentName: 'Priya Suresh',
      registerNumber: '23CS032',
      department: 'Computer Science',
      yearSection: 'II Year · A',
      purpose: 'Faculty mentoring session',
      destination: 'CSE Department',
      date: dateOffset(-1),
      startTime: '11:00',
      endTime: '12:00',
      status: 'approved',
      submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewer: 'Dr. Meera Nair',
      remarks: 'Approved.',
      activityStatus: 'completed',
      activityUpdates: [{ id: 'up-2', text: 'Mentoring session completed successfully.', createdAt: new Date(Date.now() - 86400000).toISOString() }],
      documentName: '',
    },
  ],
  notifications: [
    { id: 'n-1', recipient: 'student', title: 'OD request approved', message: 'Your request for Seminar Hall was approved.', createdAt: new Date(Date.now() - 86400000).toISOString(), read: false },
    { id: 'n-2', recipient: 'staff', title: 'New OD request', message: 'Rahul Kumar submitted a new request.', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), read: false },
  ],
})

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      const state = initialState()
      saveState(state)
      return state
    }
    const parsed = JSON.parse(saved)
    if (!parsed || !Array.isArray(parsed.applications) || !Array.isArray(parsed.notifications)) {
      throw new Error('Stored data has an unexpected format.')
    }
    return parsed
  } catch (error) {
    console.error('Unable to load Campus OD Tracker data:', error)
    const state = initialState()
    try {
      saveState(state)
    } catch (saveError) {
      console.error('Unable to restore demo data:', saveError)
    }
    return state
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetState() {
  const state = initialState()
  saveState(state)
  return state
}
