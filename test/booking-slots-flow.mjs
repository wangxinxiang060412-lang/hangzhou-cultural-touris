import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const port = 4321
const baseUrl = `http://127.0.0.1:${port}/api`
const dbPath = resolve('data/test-booking-slots-flow.sqlite')

rmSync(dbPath, { force: true })

const today = new Date().toLocaleDateString('en-CA')
let server
let output = ''

const startServer = () => {
  output = ''
  server = spawn(process.execPath, ['server/index.mjs'], {
    env: { ...process.env, API_PORT: String(port), SQLITE_PATH: dbPath },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  server.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })
  server.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })
}

const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms))

const waitForServer = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`)
      if (response.ok) return
    } catch (_) {
      await wait(100)
    }
  }
  throw new Error(`API server did not start:\n${output}`)
}

const fetchWestLakeSlots = async () => {
  const response = await fetch(`${baseUrl}/booking-slots?scenicSpotId=west-lake`)
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(`booking slots request failed: ${response.status} ${JSON.stringify(payload)}`)
  }
  return payload
}

const expectFutureAvailableSlot = (slots, label) => {
  const futureAvailableSlot = slots.find((slot) => slot.date >= today && slot.remaining > 0)
  if (!futureAvailableSlot) {
    throw new Error(`${label}: expected at least one future available slot on or after ${today}`)
  }
}

const stopServer = async () => {
  if (!server) return
  server.kill()
  await wait(100)
}

try {
  startServer()
  await waitForServer()
  expectFutureAvailableSlot(await fetchWestLakeSlots(), 'fresh seed')

  await stopServer()

  const db = new DatabaseSync(dbPath)
  const staleRows = db
    .prepare("SELECT id FROM booking_slots WHERE scenic_spot_id = 'west-lake' ORDER BY date, time_range")
    .all()
  const updateSlotDate = db.prepare('UPDATE booking_slots SET date = ? WHERE id = ?')
  staleRows.forEach((row, index) => {
    const day = String(16 + Math.floor(index / 3)).padStart(2, '0')
    updateSlotDate.run(`2026-06-${day}`, row.id)
  })
  db.close()

  startServer()
  await waitForServer()
  expectFutureAvailableSlot(await fetchWestLakeSlots(), 'stale existing database')
} finally {
  await stopServer()
}
