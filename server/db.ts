import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedBookingSlots, seedOrders, seedScenicSpots, seedTicketTypes } from './data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH ?? path.resolve(__dirname, '../data/west-lake.sqlite')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('foreign_keys = ON')

export type OrderStatus = '待出行' | '已完成' | '已取消'

export type OrderRow = {
  id: string
  scenic_spot_id: string | null
  slot_id: string | null
  ticket_name: string | null
  visitor_count: number | null
  payment_method: string | null
  payment_status: string | null
  amount: number | null
  spot_name: string
  visit_date: string
  time_range: string
  visitors_json: string
  status: OrderStatus
  qr_code_text: string
  created_at: string
}

export type SlotRow = {
  id: string
  scenic_spot_id: string
  date: string
  time_range: string
  capacity: number
  booked: number
  spot_name: string
  local_booked: number
  remaining: number
}

export const mapOrderRow = (row: OrderRow) => ({
  id: row.id,
  scenicSpotId: row.scenic_spot_id ?? undefined,
  slotId: row.slot_id ?? undefined,
  ticketName: row.ticket_name ?? undefined,
  visitorCount: row.visitor_count ?? undefined,
  paymentMethod: row.payment_method ?? undefined,
  paymentStatus: row.payment_status ?? undefined,
  amount: row.amount ?? undefined,
  spotName: row.spot_name,
  visitDate: row.visit_date,
  timeRange: row.time_range,
  visitors: JSON.parse(row.visitors_json) as string[],
  status: row.status,
  qrCodeText: row.qr_code_text,
  createdAt: row.created_at,
})

export const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scenic_spots (
      id TEXT PRIMARY KEY,
      name_zh TEXT NOT NULL,
      name_en TEXT NOT NULL,
      area TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT NOT NULL,
      opening_hours TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      reservation_required INTEGER NOT NULL DEFAULT 0,
      paid INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ticket_types (
      id TEXT PRIMARY KEY,
      scenic_spot_id TEXT NOT NULL REFERENCES scenic_spots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT NOT NULL,
      available_for TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booking_slots (
      id TEXT PRIMARY KEY,
      scenic_spot_id TEXT NOT NULL REFERENCES scenic_spots(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      time_range TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      booked INTEGER NOT NULL DEFAULT 0 CHECK (booked >= 0)
    );

    CREATE TABLE IF NOT EXISTS booking_orders (
      id TEXT PRIMARY KEY,
      scenic_spot_id TEXT REFERENCES scenic_spots(id) ON DELETE SET NULL,
      slot_id TEXT REFERENCES booking_slots(id) ON DELETE SET NULL,
      ticket_name TEXT,
      visitor_count INTEGER CHECK (visitor_count IS NULL OR visitor_count > 0),
      payment_method TEXT,
      payment_status TEXT,
      amount INTEGER CHECK (amount IS NULL OR amount >= 0),
      spot_name TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      time_range TEXT NOT NULL,
      visitors_json TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('待出行', '已完成', '已取消')),
      qr_code_text TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ticket_types_spot ON ticket_types(scenic_spot_id);
    CREATE INDEX IF NOT EXISTS idx_booking_slots_spot ON booking_slots(scenic_spot_id);
    CREATE INDEX IF NOT EXISTS idx_booking_orders_slot ON booking_orders(slot_id);
    CREATE INDEX IF NOT EXISTS idx_booking_orders_status ON booking_orders(status);
  `)

  ensureTagsColumn()
  ensureOrderColumns()
  seedStaticData()
}

const ensureTagsColumn = () => {
  const columns = db.prepare(`PRAGMA table_info(scenic_spots)`).all() as Array<{ name: string }>
  const hasTags = columns.some((column) => column.name === 'tags_json')
  if (!hasTags) {
    db.exec(`ALTER TABLE scenic_spots ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]'`)
  }
}

const ensureOrderColumns = () => {
  const columns = db.prepare(`PRAGMA table_info(booking_orders)`).all() as Array<{ name: string }>
  const hasPaymentMethod = columns.some((column) => column.name === 'payment_method')
  const hasPaymentStatus = columns.some((column) => column.name === 'payment_status')
  const hasAmount = columns.some((column) => column.name === 'amount')

  if (!hasPaymentMethod) {
    db.exec(`ALTER TABLE booking_orders ADD COLUMN payment_method TEXT`)
  }

  if (!hasPaymentStatus) {
    db.exec(`ALTER TABLE booking_orders ADD COLUMN payment_status TEXT`)
  }

  if (!hasAmount) {
    db.exec(`ALTER TABLE booking_orders ADD COLUMN amount INTEGER`)
  }
}

const seedStaticData = () => {
  const spotInsert = db.prepare(`
    INSERT OR IGNORE INTO scenic_spots (
      id, name_zh, name_en, area, category, description, address, opening_hours,
      tags_json, reservation_required, paid, featured
    )
    VALUES (
      @id, @nameZh, @nameEn, @area, @category, @description, @address, @openingHours,
      @tagsJson, @reservationRequired, @paid, @featured
    )
  `)
  const ticketInsert = db.prepare(`
    INSERT OR IGNORE INTO ticket_types (
      id, scenic_spot_id, name, price, description, available_for
    )
    VALUES (@id, @scenicSpotId, @name, @price, @description, @availableFor)
  `)
  const slotInsert = db.prepare(`
    INSERT OR IGNORE INTO booking_slots (
      id, scenic_spot_id, date, time_range, capacity, booked
    )
    VALUES (@id, @scenicSpotId, @date, @timeRange, @capacity, @booked)
  `)
  const orderInsert = db.prepare(`
    INSERT OR IGNORE INTO booking_orders (
      id, scenic_spot_id, slot_id, ticket_name, visitor_count, payment_method, payment_status, amount, spot_name,
      visit_date, time_range, visitors_json, status, qr_code_text, created_at
    )
    VALUES (
      @id, @scenicSpotId, @slotId, @ticketName, @visitorCount, @paymentMethod, @paymentStatus, @amount, @spotName,
      @visitDate, @timeRange, @visitorsJson, @status, @qrCodeText, @createdAt
    )
  `)

  const transaction = db.transaction(() => {
    seedScenicSpots.forEach((spot) => {
      spotInsert.run({
        ...spot,
        tagsJson: JSON.stringify(spot.tags ?? []),
        reservationRequired: Number(spot.reservationRequired),
        paid: Number(spot.paid),
        featured: Number(spot.featured),
      })
    })

    seedTicketTypes.forEach((ticket) => ticketInsert.run(ticket))
    seedBookingSlots.forEach((slot) => slotInsert.run(slot))
    seedOrders.forEach((order) => {
      orderInsert.run({
        ...order,
        visitorsJson: JSON.stringify(order.visitors),
      })
    })
  })

  transaction()
}
