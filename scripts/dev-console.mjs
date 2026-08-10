#!/usr/bin/env node
// Prints a status table of local Squinder services, similar to a dev console.

import { connect } from 'node:net'

const HTTP_TIMEOUT_MS = 1500

const checkHttp = async (url) => {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS)
    })
    // Strict: a 4xx here usually means a foreign service squats the port.
    return response.ok
  } catch {
    return false
  }
}

const checkTcp = (port, host = '127.0.0.1') =>
  new Promise((resolve) => {
    const socket = connect({ host, port })
    const finish = (result) => {
      socket.destroy()
      resolve(result)
    }
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    socket.setTimeout(HTTP_TIMEOUT_MS, () => finish(false))
  })

const sections = [
  {
    title: 'App / API',
    rows: [
      {
        service: 'API',
        url: 'http://localhost:7131 (health: /health)',
        note: 'make backend',
        check: () => checkHttp('http://localhost:7131/health')
      },
      {
        service: 'Persona photos',
        url: 'http://localhost:7133/squinder/profiles/…',
        note: 'MinIO bucket, synced from ./profiles',
        check: () => checkHttp('http://localhost:7133/minio/health/live')
      },
      {
        service: 'CRM',
        url: 'http://localhost:7132',
        note: 'auto with make backend',
        check: () => checkHttp('http://localhost:7132')
      }
    ]
  },
  {
    title: 'Mobile',
    rows: [
      {
        service: 'Metro (Expo)',
        url: 'http://localhost:8081',
        note: 'make ios / make android',
        check: () => checkTcp(8081)
      }
    ]
  },
  {
    title: 'Service endpoints',
    rows: [
      {
        service: 'PostgreSQL',
        url: 'postgres://squinder:squinder@localhost:7135/squinder',
        note: 'make backend',
        check: () => checkTcp(7135)
      },
      {
        service: 'MinIO S3',
        url: 'http://localhost:7133',
        note: 'make backend',
        check: () => checkHttp('http://localhost:7133/minio/health/live')
      },
      {
        service: 'MinIO console',
        url: 'http://localhost:7134 (squinder / squinder)',
        note: 'make backend',
        check: () => checkTcp(7134)
      }
    ]
  }
]

const main = async () => {
  const resolved = await Promise.all(
    sections.map(async (section) => ({
      title: section.title,
      rows: await Promise.all(
        section.rows.map(async (row) => ({
          mark: (await row.check()) ? '●' : '○',
          service: row.service,
          url: row.url,
          note: row.note
        }))
      )
    }))
  )

  const allRows = resolved.flatMap((section) => section.rows)
  const widths = {
    service: Math.max(
      'Service'.length,
      ...allRows.map((row) => row.service.length)
    ),
    url: Math.max('URL'.length, ...allRows.map((row) => row.url.length)),
    note: Math.max(
      'How to start'.length,
      ...allRows.map((row) => row.note.length)
    )
  }

  const line = (left, mid, right, fill) =>
    left +
    fill.repeat(3) +
    mid +
    fill.repeat(widths.service + 2) +
    mid +
    fill.repeat(widths.url + 2) +
    mid +
    fill.repeat(widths.note + 2) +
    right

  const row = (mark, service, url, note) =>
    `│ ${mark} │ ${service.padEnd(widths.service)} ` +
    `│ ${url.padEnd(widths.url)} │ ${note.padEnd(widths.note)} │`

  console.log(line('┌', '┬', '┐', '─'))
  console.log(row(' ', 'Service', 'URL', 'How to start'))

  for (const section of resolved) {
    console.log(line('├', '┼', '┤', '─'))
    console.log(
      `│   │ ${section.title.padEnd(
        widths.service + widths.url + widths.note + 6
      )} │`
    )
    for (const item of section.rows) {
      console.log(row(item.mark, item.service, item.url, item.note))
    }
  }

  console.log(line('└', '┴', '┘', '─'))
  console.log('  ● = running now    ○ = not running')
}

await main()
