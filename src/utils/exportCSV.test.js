import test from 'node:test'
import assert from 'node:assert/strict'
import { exportApplicationsCSV } from './exportCSV.js'

test('exports an escaped CSV and schedules object URL cleanup', async () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL
  const originalDocument = globalThis.document
  const originalWindow = globalThis.window
  let exportedBlob
  let timerCallback
  let revokedUrl
  const events = []
  const link = {
    href: '',
    download: '',
    click: () => events.push('click'),
    remove: () => events.push('remove'),
  }

  URL.createObjectURL = (blob) => {
    exportedBlob = blob
    return 'blob:campus-od-report'
  }
  URL.revokeObjectURL = (url) => { revokedUrl = url }
  globalThis.document = {
    createElement: (tag) => {
      assert.equal(tag, 'a')
      return link
    },
    body: { append: (element) => { assert.equal(element, link); events.push('append') } },
  }
  globalThis.window = { setTimeout: (callback, delay) => { timerCallback = callback; assert.equal(delay, 1000) } }

  try {
    exportApplicationsCSV([{
      id: 'OD-1',
      studentName: 'Ananya, Raman',
      purpose: '=HYPERLINK("https://example.invalid","open")',
      destination: 'Library',
    }])

    assert.equal(link.href, 'blob:campus-od-report')
    assert.match(link.download, /^campus-od-report-\d{4}-\d{2}-\d{2}\.csv$/)
    assert.deepEqual(events, ['append', 'click'])
    assert.ok(timerCallback)

    const csv = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await exportedBlob.arrayBuffer())
    assert.ok(csv.startsWith('\uFEFF'))
    assert.ok(csv.includes('"Ananya, Raman"'))
    assert.ok(csv.includes(`"'=HYPERLINK(""https://example.invalid"",""open"")"`))

    timerCallback()
    assert.deepEqual(events, ['append', 'click', 'remove'])
    assert.equal(revokedUrl, 'blob:campus-od-report')
  } finally {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
})
