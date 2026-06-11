'use client'

import { useState } from 'react'
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface ParsedRow {
  clientName: string
  phone: string
  email: string
}

// Minimal CSV parser that handles quoted fields and commas inside quotes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (field !== '' || row.length) {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      }
      if (c === '\r' && text[i + 1] === '\n') i++
    } else {
      field += c
    }
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function findCol(headers: string[], patterns: RegExp[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().trim()
    if (patterns.some((p) => p.test(h))) return i
  }
  return -1
}

export default function CsvImport({ onImported }: { onImported?: () => void }) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setResult(null)
    const text = await file.text()
    const table = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ''))
    if (table.length < 2) {
      setResult('That file didn’t have any rows we could read.')
      return
    }
    const headers = table[0]
    const nameIdx = findCol(headers, [/name/])
    const firstIdx = findCol(headers, [/first/])
    const lastIdx = findCol(headers, [/last/])
    const phoneIdx = findCol(headers, [/phone/, /mobile/, /cell/])
    const emailIdx = findCol(headers, [/email/, /e-mail/])

    if (phoneIdx === -1) {
      setResult('We couldn’t find a phone column. Make sure your CSV has a "Phone" header.')
      return
    }

    const parsed: ParsedRow[] = table.slice(1).map((r) => ({
      clientName:
        nameIdx >= 0
          ? (r[nameIdx] || '').trim()
          : `${(r[firstIdx] || '').trim()} ${(r[lastIdx] || '').trim()}`.trim(),
      phone: (r[phoneIdx] || '').trim(),
      email: emailIdx >= 0 ? (r[emailIdx] || '').trim() : '',
    }))

    const valid = parsed.filter((p) => p.phone.replace(/[^\d]/g, '').length >= 10)
    setRows(valid)
    setFileName(file.name)
    if (!valid.length) setResult('No rows had a usable phone number.')
  }

  const handleImport = async () => {
    if (!rows.length || !sessionTitle.trim() || !dateTime) return
    setImporting(true)
    setResult(null)
    try {
      const when = new Date(dateTime)
      const label = when.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
      const bookings = rows.map((r) => ({
        clientName: r.clientName,
        phone: r.phone,
        email: r.email,
        sessionTitle: sessionTitle.trim(),
        sessionDateISO: when.toISOString(),
        sessionTimeLabel: label,
      }))
      const res = await fetch('/api/import/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookings }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(`Imported! Scheduled ${data.scheduled} reminder(s) from ${data.rows} client(s).`)
        setRows([])
        setFileName('')
        onImported?.()
      } else {
        setResult(data.error || 'Import failed.')
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        No connection needed — export your client list from UseSession (Clients → Export CSV) and upload it here.
        Pick the session day and we&apos;ll schedule reminders for everyone.
      </p>

      <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-hairline cursor-pointer hover:bg-white/5 w-full sm:w-auto sm:inline-flex">
        <ArrowUpTrayIcon className="w-5 h-5 text-faint" />
        <span className="text-sm text-ink">{fileName || 'Choose a CSV file'}</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </label>

      {rows.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <DocumentTextIcon className="w-4 h-4" />
            {rows.length} client(s) with valid phone numbers found.
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Session title</label>
              <input
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g. Summer Greenhouse Mini"
                className="w-full border border-hairline bg-card text-ink placeholder:text-faint rounded-lg px-3 py-2 text-sm focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Session date &amp; time</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full border border-hairline bg-card text-ink placeholder:text-faint rounded-lg px-3 py-2 text-sm focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
            </div>
          </div>
          <button
            onClick={handleImport}
            disabled={importing || !sessionTitle.trim() || !dateTime}
            className="px-5 py-2 rounded-lg bg-accent text-accent-ink text-sm font-semibold hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)] transition-shadow disabled:opacity-50"
          >
            {importing ? 'Importing…' : `Schedule reminders for ${rows.length} client(s)`}
          </button>
        </div>
      )}

      {result && <p className="mt-3 text-sm text-muted">{result}</p>}
    </div>
  )
}
