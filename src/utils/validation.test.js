import test from 'node:test'
import assert from 'node:assert/strict'
import { validateApplication } from './validation.js'

const now = new Date(2026, 10, 12, 12)
const validForm = {
  studentName: 'Ananya Raman',
  registerNumber: '22CS104',
  department: 'Computer Science',
  yearSection: 'III Year · A',
  purpose: 'Project presentation',
  destination: 'Seminar Hall',
  date: '2026-11-13',
  startTime: '10:00',
  endTime: '12:00',
}
const existing = [{
  studentId: 'student',
  date: '2026-11-13',
  startTime: '11:00',
  endTime: '13:00',
  status: 'pending',
}]

test('requires every application field', () => {
  assert.equal(validateApplication({ ...validForm, purpose: '' }, [], 'student', now), 'Please complete all required fields.')
})

test('rejects dates before today', () => {
  assert.equal(validateApplication({ ...validForm, date: '2026-11-11' }, [], 'student', now), 'Past dates are not allowed.')
})

test('rejects invalid time ranges', () => {
  assert.equal(validateApplication({ ...validForm, startTime: '12:00', endTime: '12:00' }, [], 'student', now), 'End time must be later than start time.')
})

test('rejects overlapping applications for the same student and date', () => {
  assert.match(validateApplication(validForm, existing, 'student', now), /overlaps another OD application/)
})

test('allows back-to-back periods and other students', () => {
  assert.equal(validateApplication({ ...validForm, startTime: '13:00', endTime: '14:00' }, existing, 'student', now), '')
  assert.equal(validateApplication(validForm, existing, 'another-student', now), '')
})

test('does not count rejected requests as active overlaps', () => {
  assert.equal(validateApplication(validForm, existing.map((application) => ({ ...application, status: 'rejected' })), 'student', now), '')
})
