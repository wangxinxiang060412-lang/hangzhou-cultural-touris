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
  city_pass_id: string | null
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
  contact_phone: string | null
  contact_email: string | null
  id_type: string | null
  masked_id_number: string | null
  voucher_channels_json: string | null
  cancellation_reason: string | null
  refund_status: string | null
  refund_amount: number | null
  refund_progress: string | null
  support_hotline: string | null
  support_email: string | null
  appeal_status: string | null
  appeal_summary: string | null
  invoice_status: string | null
  invoice_title: string | null
  invoice_type: string | null
  receipt_code: string | null
  companions_json: string | null
  last_service_update: string | null
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

export type TravelerProfileRow = {
  id: string
  display_name: string | null
  profile_json: string
  created_at: string
  updated_at: string
}

const parseJsonArray = <T>(value: string | null | undefined, fallback: T[] = []) => {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

export const mapOrderRow = (row: OrderRow) => ({
  id: row.id,
  scenicSpotId: row.scenic_spot_id ?? undefined,
  slotId: row.slot_id ?? undefined,
  cityPassId: row.city_pass_id ?? undefined,
  ticketName: row.ticket_name ?? undefined,
  visitorCount: row.visitor_count ?? undefined,
  paymentMethod: row.payment_method ?? undefined,
  paymentStatus: row.payment_status ?? undefined,
  amount: row.amount ?? undefined,
  spotName: row.spot_name,
  visitDate: row.visit_date,
  timeRange: row.time_range,
  visitors: parseJsonArray<string>(row.visitors_json),
  status: row.status,
  qrCodeText: row.qr_code_text,
  createdAt: row.created_at,
  contactPhone: row.contact_phone ?? undefined,
  contactEmail: row.contact_email ?? undefined,
  idType: row.id_type ?? undefined,
  maskedIdNumber: row.masked_id_number ?? undefined,
  voucherChannels: row.voucher_channels_json
    ? parseJsonArray<string>(row.voucher_channels_json)
    : undefined,
  cancellationReason: row.cancellation_reason ?? undefined,
  refundStatus: row.refund_status ?? undefined,
  refundAmount: row.refund_amount ?? undefined,
  refundProgress: row.refund_progress ?? undefined,
  supportHotline: row.support_hotline ?? undefined,
  supportEmail: row.support_email ?? undefined,
  appealStatus: row.appeal_status ?? undefined,
  appealSummary: row.appeal_summary ?? undefined,
  invoiceStatus: row.invoice_status ?? undefined,
  invoiceTitle: row.invoice_title ?? undefined,
  invoiceType: row.invoice_type ?? undefined,
  receiptCode: row.receipt_code ?? undefined,
  companions: row.companions_json ? parseJsonArray(row.companions_json) : undefined,
  lastServiceUpdate: row.last_service_update ?? undefined,
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
      city_pass_id TEXT,
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
      created_at TEXT NOT NULL,
      contact_phone TEXT,
      contact_email TEXT,
      id_type TEXT,
      masked_id_number TEXT,
      voucher_channels_json TEXT,
      cancellation_reason TEXT,
      refund_status TEXT,
      refund_amount INTEGER,
      refund_progress TEXT,
      support_hotline TEXT,
      support_email TEXT,
      appeal_status TEXT,
      appeal_summary TEXT,
      invoice_status TEXT,
      invoice_title TEXT,
      invoice_type TEXT,
      receipt_code TEXT,
      companions_json TEXT,
      last_service_update TEXT
    );

    CREATE TABLE IF NOT EXISTS traveler_profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      profile_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ticket_types_spot ON ticket_types(scenic_spot_id);
    CREATE INDEX IF NOT EXISTS idx_booking_slots_spot ON booking_slots(scenic_spot_id);
    CREATE INDEX IF NOT EXISTS idx_booking_orders_slot ON booking_orders(slot_id);
    CREATE INDEX IF NOT EXISTS idx_booking_orders_status ON booking_orders(status);
    CREATE INDEX IF NOT EXISTS idx_traveler_profiles_updated ON traveler_profiles(updated_at);
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
  const addColumnIfMissing = (columnName: string, definition: string) => {
    if (!columns.some((column) => column.name === columnName)) {
      db.exec(`ALTER TABLE booking_orders ADD COLUMN ${columnName} ${definition}`)
    }
  }

  if (!hasPaymentMethod) {
    db.exec(`ALTER TABLE booking_orders ADD COLUMN payment_method TEXT`)
  }

  if (!hasPaymentStatus) {
    db.exec(`ALTER TABLE booking_orders ADD COLUMN payment_status TEXT`)
  }

  if (!hasAmount) {
    db.exec(`ALTER TABLE booking_orders ADD COLUMN amount INTEGER`)
  }

  addColumnIfMissing('contact_phone', 'TEXT')
  addColumnIfMissing('city_pass_id', 'TEXT')
  addColumnIfMissing('contact_email', 'TEXT')
  addColumnIfMissing('id_type', 'TEXT')
  addColumnIfMissing('masked_id_number', 'TEXT')
  addColumnIfMissing('voucher_channels_json', 'TEXT')
  addColumnIfMissing('cancellation_reason', 'TEXT')
  addColumnIfMissing('refund_status', 'TEXT')
  addColumnIfMissing('refund_amount', 'INTEGER')
  addColumnIfMissing('refund_progress', 'TEXT')
  addColumnIfMissing('support_hotline', 'TEXT')
  addColumnIfMissing('support_email', 'TEXT')
  addColumnIfMissing('appeal_status', 'TEXT')
  addColumnIfMissing('appeal_summary', 'TEXT')
  addColumnIfMissing('invoice_status', 'TEXT')
  addColumnIfMissing('invoice_title', 'TEXT')
  addColumnIfMissing('invoice_type', 'TEXT')
  addColumnIfMissing('receipt_code', 'TEXT')
  addColumnIfMissing('companions_json', 'TEXT')
  addColumnIfMissing('last_service_update', 'TEXT')
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
      id, scenic_spot_id, slot_id, city_pass_id, ticket_name, visitor_count, payment_method, payment_status, amount, spot_name,
      visit_date, time_range, visitors_json, status, qr_code_text, created_at,
      contact_phone, contact_email, id_type, masked_id_number, voucher_channels_json,
      cancellation_reason, refund_status, refund_amount, refund_progress, support_hotline, support_email,
      appeal_status, appeal_summary, invoice_status, invoice_title, invoice_type, receipt_code,
      companions_json, last_service_update
    )
    VALUES (
      @id, @scenicSpotId, @slotId, @cityPassId, @ticketName, @visitorCount, @paymentMethod, @paymentStatus, @amount, @spotName,
      @visitDate, @timeRange, @visitorsJson, @status, @qrCodeText, @createdAt,
      @contactPhone, @contactEmail, @idType, @maskedIdNumber, @voucherChannelsJson,
      @cancellationReason, @refundStatus, @refundAmount, @refundProgress, @supportHotline, @supportEmail,
      @appealStatus, @appealSummary, @invoiceStatus, @invoiceTitle, @invoiceType, @receiptCode,
      @companionsJson, @lastServiceUpdate
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
        contactPhone: order.contactPhone ?? null,
        contactEmail: order.contactEmail ?? null,
        idType: order.idType ?? null,
        maskedIdNumber: order.maskedIdNumber ?? null,
        voucherChannelsJson: JSON.stringify(order.voucherChannels ?? []),
        cancellationReason: order.cancellationReason ?? null,
        refundStatus: order.refundStatus ?? null,
        refundAmount: order.refundAmount ?? null,
        refundProgress: order.refundProgress ?? null,
        supportHotline: order.supportHotline ?? null,
        supportEmail: order.supportEmail ?? null,
        appealStatus: order.appealStatus ?? null,
        appealSummary: order.appealSummary ?? null,
        invoiceStatus: order.invoiceStatus ?? null,
        invoiceTitle: order.invoiceTitle ?? null,
        invoiceType: order.invoiceType ?? null,
        receiptCode: order.receiptCode ?? null,
        companionsJson: JSON.stringify(order.companions ?? []),
        lastServiceUpdate: order.lastServiceUpdate ?? null,
      })
    })
  })

  transaction()
}
