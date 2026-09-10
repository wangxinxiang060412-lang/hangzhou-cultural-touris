import { mkdirSync } from 'node:fs'
import crypto from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import {
  auditLogs,
  bookingOrders,
  bookingSlots,
  scenicSpots,
  ticketTypes,
  todayInHangzhou,
  userAccounts,
} from './seed.mjs'

const DB_PATH = resolve(process.env.SQLITE_PATH || 'data/hangzhou.sqlite')

mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA foreign_keys = ON;')

const toBool = (value) => (value ? 1 : 0)
const fromBool = (value) => Boolean(value)
const json = (value) => JSON.stringify(value)
const parseJson = (value, fallback = []) => {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export const nowLocal = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export const makeId = (prefix, label = '') => {
  const normalized = String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36)
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  return [prefix, normalized, suffix].filter(Boolean).join('-')
}

const makeLegacyPasswordHash = (password = '123456') => {
  let hash = 0
  for (const char of String(password)) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return `sha256-demo:${hash.toString(16).padStart(8, '0')}`
}

export const makePasswordHash = (password = '123456') => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, 32).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export const verifyPasswordHash = (password, storedHash = '') => {
  if (storedHash.startsWith('sha256-demo:')) {
    return makeLegacyPasswordHash(password) === storedHash
  }

  if (!storedHash.startsWith('scrypt:')) return false
  const [, salt, expectedHash] = storedHash.split(':')
  if (!salt || !expectedHash) return false

  const actual = crypto.scryptSync(String(password), salt, 32)
  const expected = Buffer.from(expectedHash, 'hex')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

export const isLegacyPasswordHash = (storedHash = '') => storedHash.startsWith('sha256-demo:')

export const initDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('管理员', '普通用户')),
      status TEXT NOT NULL CHECK (status IN ('启用', '停用')),
      password_hash TEXT NOT NULL,
      phone_masked TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS scenic_spots (
      id TEXT PRIMARY KEY,
      name_zh TEXT NOT NULL,
      name_en TEXT NOT NULL,
      area TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT NOT NULL,
      opening_hours TEXT NOT NULL,
      tags TEXT NOT NULL,
      reservation_required INTEGER NOT NULL DEFAULT 0,
      paid INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '',
      image_position TEXT NOT NULL DEFAULT '50% 50%',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_types (
      id TEXT PRIMARY KEY,
      scenic_spot_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      description TEXT NOT NULL DEFAULT '',
      available_for TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (scenic_spot_id, name),
      FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spots(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS booking_slots (
      id TEXT PRIMARY KEY,
      scenic_spot_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time_range TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      booked INTEGER NOT NULL DEFAULT 0 CHECK (booked >= 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (scenic_spot_id, date, time_range),
      CHECK (booked <= capacity),
      FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spots(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS booking_orders (
      id TEXT PRIMARY KEY,
      scenic_spot_id TEXT NOT NULL,
      slot_id TEXT NOT NULL,
      user_id TEXT,
      city_pass_id TEXT,
      ticket_name TEXT,
      spot_name TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      time_range TEXT NOT NULL,
      visitors TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('待出行', '已完成', '已取消')),
      payment_method TEXT NOT NULL CHECK (payment_method IN ('free', 'alipay', 'wechat', 'unionpay')),
      payment_status TEXT NOT NULL CHECK (payment_status IN ('免费预约', '支付完成')),
      amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
      visitor_count INTEGER NOT NULL CHECK (visitor_count BETWEEN 1 AND 8),
      qr_code_text TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      contact_phone TEXT,
      contact_email TEXT,
      masked_id_number TEXT,
      cancellation_reason TEXT,
      refund_status TEXT,
      support_hotline TEXT,
      support_email TEXT,
      appeal_status TEXT,
      invoice_status TEXT,
      FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spots(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (slot_id) REFERENCES booking_slots(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (user_id) REFERENCES user_accounts(id)
        ON UPDATE CASCADE ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_table TEXT NOT NULL,
      target_id TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scenic_area_category ON scenic_spots(area, category);
    CREATE INDEX IF NOT EXISTS idx_ticket_spot ON ticket_types(scenic_spot_id);
    CREATE INDEX IF NOT EXISTS idx_slot_lookup ON booking_slots(scenic_spot_id, date);
    CREATE INDEX IF NOT EXISTS idx_order_status_created ON booking_orders(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_order_spot_slot ON booking_orders(scenic_spot_id, slot_id);
    CREATE INDEX IF NOT EXISTS idx_order_user_created ON booking_orders(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs(actor, created_at);
  `)

  try { db.exec('ALTER TABLE user_accounts ADD COLUMN avatar_color TEXT NOT NULL DEFAULT \'#0a6e5c\';') } catch (_) { /* column already exists */ }
  try { db.exec('ALTER TABLE booking_orders ADD COLUMN user_id TEXT;') } catch (_) { /* column already exists */ }
  try { db.exec('ALTER TABLE scenic_spots ADD COLUMN image_url TEXT NOT NULL DEFAULT \'\';') } catch (_) { /* column already exists */ }
  try { db.exec('ALTER TABLE scenic_spots ADD COLUMN image_position TEXT NOT NULL DEFAULT \'50% 50%\';') } catch (_) { /* column already exists */ }

  const count = db.prepare('SELECT COUNT(*) AS count FROM scenic_spots').get().count
  if (count === 0) {
    seedDatabase()
  } else {
    ensureSeedSpotImages()
    ensureFutureBookingSlots()
  }
}

export const ensureSeedSpotImages = () => {
  const updateSpotImage = db.prepare(`
    UPDATE scenic_spots
    SET image_url = ?, image_position = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND (image_url IS NULL OR image_url = '')
  `)

  db.exec('BEGIN;')
  try {
    scenicSpots.forEach((spot) => {
      if (!spot.imageUrl) return
      updateSpotImage.run(spot.imageUrl, spot.imagePosition ?? '50% 50%', spot.id)
    })
    db.exec('COMMIT;')
  } catch (error) {
    db.exec('ROLLBACK;')
    throw error
  }
}

export const ensureFutureBookingSlots = () => {
  const today = todayInHangzhou()
  const futureRows = db.prepare(`
    SELECT scenic_spot_id, COUNT(*) AS count
    FROM booking_slots
    WHERE date >= ?
    GROUP BY scenic_spot_id
  `).all(today)
  const spotsWithFutureSlots = new Set(
    futureRows.filter((row) => row.count > 0).map((row) => row.scenic_spot_id),
  )
  const hasSpot = db.prepare('SELECT 1 FROM scenic_spots WHERE id = ?')
  const hasSlotForDate = db.prepare(`
    SELECT 1
    FROM booking_slots
    WHERE scenic_spot_id = ? AND date = ? AND time_range = ?
  `)
  const hasSlotId = db.prepare('SELECT 1 FROM booking_slots WHERE id = ?')
  const insertSlot = db.prepare(`
    INSERT INTO booking_slots
      (id, scenic_spot_id, date, time_range, capacity, booked)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  db.exec('BEGIN;')
  try {
    bookingSlots.forEach((slot) => {
      if (spotsWithFutureSlots.has(slot.scenicSpotId)) return
      if (!hasSpot.get(slot.scenicSpotId)) return
      if (hasSlotForDate.get(slot.scenicSpotId, slot.date, slot.timeRange)) return

      const id = hasSlotId.get(slot.id) ? `${slot.id}-${slot.date}` : slot.id
      insertSlot.run(id, slot.scenicSpotId, slot.date, slot.timeRange, slot.capacity, slot.booked)
    })
    db.exec('COMMIT;')
  } catch (error) {
    db.exec('ROLLBACK;')
    throw error
  }
}

export const seedDatabase = () => {
  const insertUser = db.prepare(`
    INSERT INTO user_accounts
      (id, username, display_name, role, status, password_hash, phone_masked, created_at, last_login_at, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertSpot = db.prepare(`
    INSERT INTO scenic_spots
      (id, name_zh, name_en, area, category, description, address, opening_hours, tags,
       reservation_required, paid, featured, image_url, image_position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertTicket = db.prepare(`
    INSERT INTO ticket_types
      (id, scenic_spot_id, name, price, description, available_for)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const insertSlot = db.prepare(`
    INSERT INTO booking_slots
      (id, scenic_spot_id, date, time_range, capacity, booked)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const insertOrder = db.prepare(`
    INSERT INTO booking_orders
      (id, scenic_spot_id, slot_id, user_id, city_pass_id, ticket_name, spot_name, visit_date, time_range, visitors, status,
       payment_method, payment_status, amount, visitor_count, qr_code_text, created_at, contact_phone,
       contact_email, masked_id_number, refund_status, support_hotline, support_email, appeal_status, invoice_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs
      (id, actor, role, action, target_table, target_id, detail, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  db.exec('DELETE FROM audit_logs; DELETE FROM booking_orders; DELETE FROM booking_slots; DELETE FROM ticket_types; DELETE FROM scenic_spots; DELETE FROM user_accounts;')

  db.exec('BEGIN;')
  try {
    userAccounts.forEach((user) => {
      insertUser.run(
        user.id,
        user.username,
        user.displayName,
        user.role,
        user.status,
        user.passwordHash,
        user.phoneMasked,
        user.createdAt,
        user.lastLoginAt ?? null,
        user.avatarColor ?? '#0a6e5c',
      )
    })

    scenicSpots.forEach((spot) => {
      insertSpot.run(
        spot.id,
        spot.nameZh,
        spot.nameEn,
        spot.area,
        spot.category,
        spot.description,
        spot.address,
        spot.openingHours,
        json(spot.tags),
        toBool(spot.reservationRequired),
        toBool(spot.paid),
        toBool(spot.featured),
        spot.imageUrl ?? '',
        spot.imagePosition ?? '50% 50%',
      )
    })

    ticketTypes.forEach((ticket) => {
      insertTicket.run(
        ticket.id,
        ticket.scenicSpotId,
        ticket.name,
        ticket.price,
        ticket.description,
        ticket.availableFor,
      )
    })

    bookingSlots.forEach((slot) => {
      insertSlot.run(slot.id, slot.scenicSpotId, slot.date, slot.timeRange, slot.capacity, slot.booked)
    })

    bookingOrders.forEach((order) => {
      insertOrder.run(
        order.id,
        order.scenicSpotId,
        order.slotId,
        order.userId ?? null,
        order.cityPassId ?? null,
        order.ticketName ?? null,
        order.spotName,
        order.visitDate,
        order.timeRange,
        json(order.visitors),
        order.status,
        order.paymentMethod,
        order.paymentStatus,
        order.amount ?? 0,
        order.visitorCount ?? order.visitors.length,
        order.qrCodeText,
        order.createdAt,
        order.contactPhone ?? null,
        order.contactEmail ?? null,
        order.maskedIdNumber ?? null,
        order.refundStatus ?? '无需退款',
        order.supportHotline ?? '12301',
        order.supportEmail ?? 'tickets@hangzhou.example.gov.cn',
        order.appealStatus ?? '可发起',
        order.invoiceStatus ?? '可申请',
      )
    })

    auditLogs.forEach((log) => {
      insertAudit.run(log.id, log.actor, log.role, log.action, log.targetTable, log.targetId, log.detail, log.createdAt)
    })
    db.exec('COMMIT;')
  } catch (error) {
    db.exec('ROLLBACK;')
    throw error
  }
}

export const rowToSpot = (row) => ({
  id: row.id,
  nameZh: row.name_zh,
  nameEn: row.name_en,
  area: row.area,
  category: row.category,
  description: row.description,
  address: row.address,
  openingHours: row.opening_hours,
  tags: parseJson(row.tags),
  reservationRequired: fromBool(row.reservation_required),
  paid: fromBool(row.paid),
  featured: fromBool(row.featured),
  imageUrl: row.image_url ?? '',
  imagePosition: row.image_position ?? '50% 50%',
})

export const rowToTicket = (row) => ({
  id: row.id,
  scenicSpotId: row.scenic_spot_id,
  name: row.name,
  price: row.price,
  description: row.description,
  availableFor: row.available_for,
})

export const rowToSlot = (row) => ({
  id: row.id,
  scenicSpotId: row.scenic_spot_id,
  date: row.date,
  timeRange: row.time_range,
  capacity: row.capacity,
  booked: row.booked,
  spotName: row.spot_name,
  localBooked: row.local_booked,
  remaining: Math.max(row.capacity - row.booked - row.local_booked, 0),
})

export const rowToOrder = (row) => ({
  id: row.id,
  scenicSpotId: row.scenic_spot_id,
  slotId: row.slot_id,
  userId: row.user_id ?? undefined,
  cityPassId: row.city_pass_id ?? undefined,
  ticketName: row.ticket_name ?? undefined,
  spotName: row.spot_name,
  visitDate: row.visit_date,
  timeRange: row.time_range,
  visitors: parseJson(row.visitors, []),
  status: row.status,
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  amount: row.amount,
  visitorCount: row.visitor_count,
  qrCodeText: row.qr_code_text,
  createdAt: row.created_at,
  contactPhone: row.contact_phone ?? undefined,
  contactEmail: row.contact_email ?? undefined,
  maskedIdNumber: row.masked_id_number ?? undefined,
  cancellationReason: row.cancellation_reason ?? undefined,
  refundStatus: row.refund_status ?? undefined,
  supportHotline: row.support_hotline ?? undefined,
  supportEmail: row.support_email ?? undefined,
  appealStatus: row.appeal_status ?? undefined,
  invoiceStatus: row.invoice_status ?? undefined,
})

export const rowToUser = (row) => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  status: row.status,
  passwordHash: row.password_hash,
  phoneMasked: row.phone_masked,
  createdAt: row.created_at,
  lastLoginAt: row.last_login_at ?? undefined,
  avatarColor: row.avatar_color ?? '#0a6e5c',
})

export const rowToAudit = (row) => ({
  id: row.id,
  actor: row.actor,
  role: row.role,
  action: row.action,
  targetTable: row.target_table,
  targetId: row.target_id,
  detail: row.detail ?? '',
  createdAt: row.created_at,
})

export const appendAudit = (action, targetTable, targetId, detail, actor = 'admin', role = '管理员') => {
  db.prepare(`
    INSERT INTO audit_logs (id, actor, role, action, target_table, target_id, detail, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(makeId('audit', `${targetTable}-${action}`), actor, role, action, targetTable, targetId, detail, nowLocal())
}

initDatabase()
