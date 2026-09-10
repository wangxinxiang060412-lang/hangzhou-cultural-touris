import crypto from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { extname, join, resolve } from 'node:path'
import { URL } from 'node:url'
import {
  appendAudit,
  db,
  isLegacyPasswordHash,
  makeId,
  makePasswordHash,
  nowLocal,
  rowToAudit,
  rowToOrder,
  rowToSlot,
  rowToSpot,
  rowToTicket,
  rowToUser,
  seedDatabase,
  verifyPasswordHash,
} from './database.mjs'
import { cityPassPrices } from './seed.mjs'
import { fetchHangzhouWeather } from './weather.mjs'

const PORT = Number(process.env.API_PORT || 3001)
const PUBLIC_DIR = resolve('public')
const SCENIC_UPLOAD_DIR = join(PUBLIC_DIR, 'uploads', 'scenic-spots')
const IMAGE_MIME_EXTENSIONS = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

mkdirSync(SCENIC_UPLOAD_DIR, { recursive: true })

const authTokens = new Map() // token -> userId

const generateToken = () => {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

const getAuthUser = (req) => {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const userId = authTokens.get(token)
  if (!userId) return null
  const row = db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(userId)
  return row ? rowToUser(row) : null
}

const toSafeUser = (user) => {
  if (!user) return null
  const { passwordHash, ...safeUser } = user
  return safeUser
}

const requireUser = (req, res) => {
  const user = getAuthUser(req)
  if (!user) {
    fail(res, 401, '请先登录')
    return null
  }
  if (user.status === '停用') {
    fail(res, 403, '账号已停用，请联系管理员')
    return null
  }
  return user
}

const requireAdmin = (req, res) => {
  const user = requireUser(req, res)
  if (!user) return null
  if (user.role !== '管理员') {
    fail(res, 403, '当前账号没有后台管理权限')
    return null
  }
  return user
}

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(JSON.stringify(body))
}

const sendFile = (res, path, contentType) => {
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=31536000, immutable',
  })
  createReadStream(path).pipe(res)
}

const ok = (res, body) => send(res, 200, body)
const created = (res, body) => send(res, 201, body)
const fail = (res, status, message) => send(res, status, { error: message })

const readJson = async (req) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const getSpot = (id) =>
  db.prepare('SELECT * FROM scenic_spots WHERE id = ?').get(id)

const getSlot = (id) =>
  db.prepare('SELECT * FROM booking_slots WHERE id = ?').get(id)

const formatLocalDate = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const addLocalDays = (days, from = new Date()) => {
  const date = new Date(from)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

const parseTimeRangeEndMinutes = (timeRange = '') => {
  const match = String(timeRange).match(/-\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

const isSlotBookable = (slot, now = new Date()) => {
  const today = formatLocalDate(now)
  const lastBookableDate = formatLocalDate(addLocalDays(6, now))
  if (slot.date < today || slot.date > lastBookableDate) return false
  if (slot.date !== today) return true
  const endMinutes = parseTimeRangeEndMinutes(slot.time_range)
  if (endMinutes === null) return true
  return endMinutes > now.getHours() * 60 + now.getMinutes()
}

const normalizeImagePosition = (value) => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || '50% 50%'
}

const normalizeImageUrl = (value) => {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return ''
  if (text.startsWith('/src/assets/images/') || text.startsWith('/uploads/scenic-spots/')) return text
  return ''
}

const publicContentType = (pathname) => {
  switch (extname(pathname).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

const tryServePublicFile = (pathname, res) => {
  if (!pathname.startsWith('/uploads/scenic-spots/')) return false
  const relativePath = pathname.replace(/^\/+/, '')
  const filePath = resolve(PUBLIC_DIR, relativePath)
  if (!filePath.startsWith(SCENIC_UPLOAD_DIR)) return false
  if (!existsSync(filePath)) {
    fail(res, 404, '文件不存在')
    return true
  }

  sendFile(res, filePath, publicContentType(pathname))
  return true
}

const storeUploadedImage = (body) => {
  const mimeType = String(body.mimeType ?? '').toLowerCase()
  const extension = IMAGE_MIME_EXTENSIONS.get(mimeType)
  if (!extension) {
    throw new Error('仅支持 JPG、PNG 或 WebP 图片')
  }

  const dataBase64 = String(body.dataBase64 ?? '').replace(/^data:image\/[a-z0-9.+-]+;base64,/i, '')
  if (!dataBase64) {
    throw new Error('图片内容不能为空')
  }

  const buffer = Buffer.from(dataBase64, 'base64')
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('图片大小需在 3MB 以内')
  }

  const slug = String(body.fileName ?? 'scenic-spot')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36) || 'scenic-spot'
  const fileName = `${slug}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}${extension}`
  writeFileSync(join(SCENIC_UPLOAD_DIR, fileName), buffer)
  return `/uploads/scenic-spots/${fileName}`
}

const getActiveBookedBySlot = (slotId) =>
  db.prepare(`
    SELECT COALESCE(SUM(visitor_count), 0) AS total
    FROM booking_orders
    WHERE slot_id = ? AND status IN ('待出行', '已完成')
  `).get(slotId).total

const getSlotRemaining = (slotId) => {
  const slot = getSlot(slotId)
  if (!slot) return null
  return Math.max(slot.capacity - slot.booked - getActiveBookedBySlot(slotId), 0)
}

const querySlots = (scenicSpotId) => {
  const sql = `
    SELECT
      s.*,
      p.name_zh AS spot_name,
      COALESCE(SUM(CASE WHEN o.status IN ('待出行', '已完成') THEN o.visitor_count ELSE 0 END), 0) AS local_booked
    FROM booking_slots s
    JOIN scenic_spots p ON p.id = s.scenic_spot_id
    LEFT JOIN booking_orders o ON o.slot_id = s.id
    ${scenicSpotId ? 'WHERE s.scenic_spot_id = ?' : ''}
    GROUP BY s.id
    ORDER BY s.date, s.time_range
  `
  return (scenicSpotId ? db.prepare(sql).all(scenicSpotId) : db.prepare(sql).all()).map(rowToSlot)
}

const listOrders = (user) => {
  const statement = user.role === '管理员'
    ? db.prepare('SELECT * FROM booking_orders ORDER BY created_at DESC')
    : db.prepare('SELECT * FROM booking_orders WHERE user_id = ? ORDER BY created_at DESC')
  return (user.role === '管理员' ? statement.all() : statement.all(user.id)).map(rowToOrder)
}

const createOrderId = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `HZ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
}

const isStrongPassword = (password) =>
  typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)

const normalizeMainlandPhone = (value = '') => String(value).replace(/\D/g, '')

const isValidMainlandPhone = (value = '') => /^1[3-9]\d{9}$/.test(normalizeMainlandPhone(value))

const maskPhone = (value = '') => {
  const phone = normalizeMainlandPhone(value)
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

const routes = {
  'POST /api/auth/login': async (req, res) => {
    const body = await readJson(req)
    const username = (body.username || '').trim().toLowerCase()
    const password = body.password || ''
    if (!username || !password) return fail(res, 400, '请输入用户名和密码')

    const row = db.prepare('SELECT * FROM user_accounts WHERE username = ?').get(username)
    if (!row) return fail(res, 401, '用户名或密码错误')

    const user = rowToUser(row)
    if (user.status === '停用') return fail(res, 403, '账号已停用，请联系管理员')

    if (!verifyPasswordHash(password, user.passwordHash)) return fail(res, 401, '用户名或密码错误')

    db.prepare(`
      UPDATE user_accounts
      SET last_login_at = ?,
          password_hash = CASE WHEN ? = 1 THEN ? ELSE password_hash END
      WHERE id = ?
    `).run(nowLocal(), isLegacyPasswordHash(user.passwordHash) ? 1 : 0, makePasswordHash(password), user.id)

    const token = generateToken()
    authTokens.set(token, user.id)

    ok(res, { token, user: toSafeUser(rowToUser(db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(user.id))) })
  },

  'POST /api/auth/register': async (req, res) => {
    const body = await readJson(req)
    const username = (body.username || '').trim().toLowerCase()
    const password = body.password || ''
    const displayName = (body.displayName || '').trim()
    const phone = (body.phone || body.phoneNumber || '').trim()

    if (!username || username.length < 3) return fail(res, 400, '用户名至少3个字符')
    if (!isStrongPassword(password)) return fail(res, 400, '密码至少8位，且需包含字母和数字')
    if (!displayName || displayName.length < 2) return fail(res, 400, '昵称至少2个字符')
    if (!isValidMainlandPhone(phone)) return fail(res, 400, '请输入有效的11位手机号')

    const existing = db.prepare('SELECT id FROM user_accounts WHERE username = ?').get(username)
    if (existing) return fail(res, 409, '用户名已被注册')

    // Generate avatar color from username
    let colorHash = 0
    for (const c of username) colorHash = (colorHash * 31 + c.charCodeAt(0)) >>> 0
    const hue = colorHash % 360
    const avatarColor = `hsl(${hue}, 35%, 42%)`

    const id = makeId('user', username)
    db.prepare(`
      INSERT INTO user_accounts
        (id, username, display_name, role, status, password_hash, phone_masked, created_at, last_login_at, avatar_color)
      VALUES (?, ?, ?, '普通用户', '启用', ?, ?, ?, ?, ?)
    `).run(id, username, displayName, makePasswordHash(password), maskPhone(phone), nowLocal(), nowLocal(), avatarColor)

    appendAudit('用户注册', 'user_accounts', id, `新用户注册 ${username}`, username, '普通用户')

    const token = generateToken()
    authTokens.set(token, id)

    created(res, { token, user: toSafeUser(rowToUser(db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(id))) })
  },

  'GET /api/auth/me': (req, res) => {
    const user = getAuthUser(req)
    if (!user) return fail(res, 401, '未登录或登录已过期')
    ok(res, toSafeUser(user))
  },

  'POST /api/auth/logout': (req, res) => {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (token) authTokens.delete(token)
    ok(res, { ok: true })
  },

  'GET /api/health': (_req, res) => ok(res, { ok: true, database: 'sqlite' }),

  'GET /api/weather/hangzhou': async (req, res, url) => {
    const force = url.searchParams.get('force') === '1'
    ok(res, await fetchHangzhouWeather({ force }))
  },

  'GET /api/scenic-spots': (_req, res) =>
    ok(res, db.prepare('SELECT * FROM scenic_spots ORDER BY featured DESC, name_zh').all().map(rowToSpot)),

  'GET /api/scenic-spots/:id': (_req, res, _url, params) => {
    const spot = getSpot(params.id)
    if (!spot) return fail(res, 404, '景点不存在')
    ok(res, rowToSpot(spot))
  },

  'GET /api/ticket-types': (req, res, url) => {
    const spotId = url.searchParams.get('scenicSpotId')
    const rows = spotId
      ? db.prepare('SELECT * FROM ticket_types WHERE scenic_spot_id = ? ORDER BY price, name').all(spotId)
      : db.prepare('SELECT * FROM ticket_types ORDER BY scenic_spot_id, price, name').all()
    ok(res, rows.map(rowToTicket))
  },

  'GET /api/booking-slots': (req, res, url) => ok(res, querySlots(url.searchParams.get('scenicSpotId'))),

  'GET /api/orders': (req, res) => {
    const user = requireUser(req, res)
    if (!user) return
    ok(res, listOrders(user))
  },

  'GET /api/users': (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    ok(res, db.prepare('SELECT * FROM user_accounts ORDER BY role, username').all().map(rowToUser).map(toSafeUser))
  },

  'GET /api/audit-logs': (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    ok(res, db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 80').all().map(rowToAudit))
  },

  'POST /api/uploads/scenic-spot-image': async (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const body = await readJson(req)
    try {
      const imageUrl = storeUploadedImage(body)
      appendAudit('上传景点图片', 'scenic_spots', imageUrl, '上传景点封面图片', admin.username, admin.role)
      created(res, { imageUrl })
    } catch (error) {
      fail(res, 400, error instanceof Error ? error.message : '图片上传失败')
    }
  },

  'POST /api/scenic-spots': async (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const body = await readJson(req)
    const id = body.id?.trim() || makeId('spot', body.nameEn || body.nameZh)
    if (getSpot(id)) return fail(res, 409, '景点 ID 已存在')

    db.prepare(`
      INSERT INTO scenic_spots
        (id, name_zh, name_en, area, category, description, address, opening_hours, tags,
         reservation_required, paid, featured, image_url, image_position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.nameZh?.trim(),
      body.nameEn?.trim(),
      body.area?.trim(),
      body.category?.trim(),
      body.description?.trim() || '',
      body.address?.trim() || '',
      body.openingHours?.trim() || '',
      JSON.stringify(body.tags ?? []),
      body.reservationRequired ? 1 : 0,
      body.paid ? 1 : 0,
      body.featured ? 1 : 0,
      normalizeImageUrl(body.imageUrl),
      normalizeImagePosition(body.imagePosition),
    )
    appendAudit('新增景点', 'scenic_spots', id, `新增景点 ${body.nameZh}`, admin.username, admin.role)
    created(res, rowToSpot(getSpot(id)))
  },

  'PUT /api/scenic-spots/:id': async (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const current = getSpot(params.id)
    if (!current) return fail(res, 404, '景点不存在')
    const body = await readJson(req)
    db.prepare(`
      UPDATE scenic_spots
      SET name_zh = ?, name_en = ?, area = ?, category = ?, description = ?, address = ?,
          opening_hours = ?, tags = ?, reservation_required = ?, paid = ?, featured = ?,
          image_url = ?, image_position = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      body.nameZh ?? current.name_zh,
      body.nameEn ?? current.name_en,
      body.area ?? current.area,
      body.category ?? current.category,
      body.description ?? current.description,
      body.address ?? current.address,
      body.openingHours ?? current.opening_hours,
      JSON.stringify(body.tags ?? JSON.parse(current.tags)),
      body.reservationRequired === undefined ? current.reservation_required : body.reservationRequired ? 1 : 0,
      body.paid === undefined ? current.paid : body.paid ? 1 : 0,
      body.featured === undefined ? current.featured : body.featured ? 1 : 0,
      body.imageUrl === undefined ? current.image_url : normalizeImageUrl(body.imageUrl),
      body.imagePosition === undefined ? current.image_position : normalizeImagePosition(body.imagePosition),
      params.id,
    )
    appendAudit('修改景点', 'scenic_spots', params.id, `更新景点 ${body.nameZh ?? current.name_zh}`, admin.username, admin.role)
    ok(res, rowToSpot(getSpot(params.id)))
  },

  'DELETE /api/scenic-spots/:id': (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const activeOrders = db.prepare(`
      SELECT COUNT(*) AS count FROM booking_orders
      WHERE scenic_spot_id = ? AND status <> '已取消'
    `).get(params.id).count
    if (activeOrders > 0) return fail(res, 409, '该景点仍有未取消订单，不能删除')
    db.prepare('DELETE FROM scenic_spots WHERE id = ?').run(params.id)
    appendAudit('删除景点', 'scenic_spots', params.id, '删除景点并级联移除其票种', admin.username, admin.role)
    ok(res, { ok: true })
  },

  'POST /api/ticket-types': async (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const body = await readJson(req)
    if (!getSpot(body.scenicSpotId)) return fail(res, 404, '所属景点不存在')
    const id = body.id?.trim() || makeId('ticket', body.name)
    db.prepare(`
      INSERT INTO ticket_types (id, scenic_spot_id, name, price, description, available_for)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, body.scenicSpotId, body.name?.trim(), Math.max(Math.round(body.price ?? 0), 0), body.description?.trim() || '', body.availableFor?.trim() || '')
    appendAudit('新增票种', 'ticket_types', id, `新增 ${body.name}`, admin.username, admin.role)
    created(res, rowToTicket(db.prepare('SELECT * FROM ticket_types WHERE id = ?').get(id)))
  },

  'PUT /api/ticket-types/:id': async (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const current = db.prepare('SELECT * FROM ticket_types WHERE id = ?').get(params.id)
    if (!current) return fail(res, 404, '票种不存在')
    const body = await readJson(req)
    if (body.scenicSpotId && !getSpot(body.scenicSpotId)) return fail(res, 404, '所属景点不存在')
    db.prepare(`
      UPDATE ticket_types
      SET scenic_spot_id = ?, name = ?, price = ?, description = ?, available_for = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      body.scenicSpotId ?? current.scenic_spot_id,
      body.name ?? current.name,
      Math.max(Math.round(body.price ?? current.price), 0),
      body.description ?? current.description,
      body.availableFor ?? current.available_for,
      params.id,
    )
    appendAudit('修改票种', 'ticket_types', params.id, `更新票种 ${body.name ?? current.name}`, admin.username, admin.role)
    ok(res, rowToTicket(db.prepare('SELECT * FROM ticket_types WHERE id = ?').get(params.id)))
  },

  'DELETE /api/ticket-types/:id': (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    db.prepare('DELETE FROM ticket_types WHERE id = ?').run(params.id)
    appendAudit('删除票种', 'ticket_types', params.id, '删除票种记录', admin.username, admin.role)
    ok(res, { ok: true })
  },

  'POST /api/booking-slots': async (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const body = await readJson(req)
    if (!getSpot(body.scenicSpotId)) return fail(res, 404, '所属景点不存在')
    const id = body.id?.trim() || makeId('slot', `${body.scenicSpotId}-${body.date}`)
    try {
      db.prepare(`
        INSERT INTO booking_slots (id, scenic_spot_id, date, time_range, capacity, booked)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        id,
        body.scenicSpotId,
        body.date,
        body.timeRange?.trim(),
        Math.max(Math.round(body.capacity ?? 1), 1),
        Math.max(Math.round(body.booked ?? 0), 0),
      )
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) return fail(res, 409, '同景点、日期和时段已存在')
      throw error
    }
    appendAudit('新增时段', 'booking_slots', id, `${body.scenicSpotId} ${body.date} ${body.timeRange}`, admin.username, admin.role)
    created(res, querySlots().find((slot) => slot.id === id))
  },

  'PUT /api/booking-slots/:id': async (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const current = getSlot(params.id)
    if (!current) return fail(res, 404, '时段不存在')
    const body = await readJson(req)
    const capacity = Math.max(Math.round(body.capacity ?? current.capacity), 1)
    const booked = Math.max(Math.round(body.booked ?? current.booked), 0)
    const localBooked = getActiveBookedBySlot(params.id)
    if (booked + localBooked > capacity) return fail(res, 409, '容量不能小于基础已约和有效订单占用之和')
    db.prepare(`
      UPDATE booking_slots
      SET date = ?, time_range = ?, capacity = ?, booked = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(body.date ?? current.date, body.timeRange ?? current.time_range, capacity, booked, params.id)
    appendAudit('修改时段', 'booking_slots', params.id, `${body.date ?? current.date} ${body.timeRange ?? current.time_range} 容量 ${capacity}`, admin.username, admin.role)
    ok(res, querySlots().find((slot) => slot.id === params.id))
  },

  'DELETE /api/booking-slots/:id': (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const activeOrders = db.prepare(`
      SELECT COUNT(*) AS count FROM booking_orders
      WHERE slot_id = ? AND status <> '已取消'
    `).get(params.id).count
    if (activeOrders > 0) return fail(res, 409, '该时段仍有未取消订单，不能删除')
    db.prepare('DELETE FROM booking_slots WHERE id = ?').run(params.id)
    appendAudit('删除时段', 'booking_slots', params.id, '删除无有效订单占用的预约时段', admin.username, admin.role)
    ok(res, { ok: true })
  },

  'POST /api/orders': async (req, res) => {
    const user = requireUser(req, res)
    if (!user) return
    const body = await readJson(req)
    const spot = getSpot(body.scenicSpotId)
    if (!spot) return fail(res, 404, '景点不存在')
    const slot = getSlot(body.slotId)
    if (!slot) return fail(res, 404, '预约时段不存在')
    if (!isSlotBookable(slot)) return fail(res, 409, '该时段已不可预约，请重新选择日期或时间')
    const visitorCount = Math.max(Math.round(body.visitorCount ?? 1), 1)
    const remaining = getSlotRemaining(body.slotId)
    if (remaining < visitorCount) return fail(res, 409, '当前时段余量不足，请重新选择时段')

    const ticket = body.ticketName
      ? db.prepare('SELECT * FROM ticket_types WHERE scenic_spot_id = ? AND name = ?').get(body.scenicSpotId, body.ticketName)
      : null
    const amount = (cityPassPrices.get(body.cityPassId) ?? ticket?.price ?? 0) * visitorCount
    const id = createOrderId()
    const paymentMethod = body.paymentMethod ?? (amount > 0 ? 'alipay' : 'free')

    db.prepare(`
      INSERT INTO booking_orders
        (id, scenic_spot_id, slot_id, user_id, city_pass_id, ticket_name, spot_name, visit_date, time_range, visitors,
         status, payment_method, payment_status, amount, visitor_count, qr_code_text, created_at,
         contact_phone, contact_email, masked_id_number, refund_status, support_hotline, support_email,
         appeal_status, invoice_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待出行', ?, ?, ?, ?, ?, ?, ?, ?, ?, '无需退款', '12301',
              'tickets@hangzhou.example.gov.cn', '可发起', '可申请')
    `).run(
      id,
      body.scenicSpotId,
      body.slotId,
      user.id,
      body.cityPassId ?? null,
      body.ticketName ?? null,
      spot.name_zh,
      slot.date,
      slot.time_range,
      JSON.stringify([body.visitorName?.trim() || '游客']),
      paymentMethod,
      paymentMethod === 'free' ? '免费预约' : '支付完成',
      amount,
      visitorCount,
      `VERIFY-${id}`,
      nowLocal(),
      body.visitorPhone?.trim() ?? '',
      body.visitorEmail?.trim() || null,
      String(body.visitorIdNumber ?? '').replace(/.(?=.{4})/g, '*'),
    )
    appendAudit('提交预约', 'booking_orders', id, `${spot.name_zh} ${slot.date} ${slot.time_range} ${visitorCount} 人`, user.username, user.role)
    created(res, rowToOrder(db.prepare('SELECT * FROM booking_orders WHERE id = ?').get(id)))
  },

  'PATCH /api/orders/:id/status': async (req, res, _url, params) => {
    const user = requireUser(req, res)
    if (!user) return
    const current = db.prepare('SELECT * FROM booking_orders WHERE id = ?').get(params.id)
    if (!current) return fail(res, 404, '订单不存在')
    const body = await readJson(req)
    const isOwner = current.user_id === user.id
    const isTravelerCancellation = user.role === '普通用户' && isOwner && body.status === '已取消'
    if (user.role !== '管理员' && !isTravelerCancellation) {
      return fail(res, 403, '只能取消自己的待出行订单')
    }
    if (user.role !== '管理员' && current.status !== '待出行') {
      return fail(res, 409, '当前订单状态不可取消')
    }
    db.prepare(`
      UPDATE booking_orders
      SET status = ?, cancellation_reason = COALESCE(?, cancellation_reason),
          refund_status = CASE
            WHEN ? = '已取消' AND amount > 0 THEN '待处理'
            WHEN ? = '已取消' THEN '无需退款'
            ELSE refund_status
          END
      WHERE id = ?
    `).run(body.status, body.cancellationReason ?? null, body.status, body.status, params.id)
    appendAudit('更新订单状态', 'booking_orders', params.id, `订单状态更新为 ${body.status}`, user.username, user.role)
    ok(res, rowToOrder(db.prepare('SELECT * FROM booking_orders WHERE id = ?').get(params.id)))
  },

  'DELETE /api/orders/:id': (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    db.prepare('DELETE FROM booking_orders WHERE id = ?').run(params.id)
    appendAudit('删除订单', 'booking_orders', params.id, '硬删除订单记录', admin.username, admin.role)
    ok(res, { ok: true })
  },

  'POST /api/users': async (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const body = await readJson(req)
    const username = body.username?.trim().toLowerCase()
    if (!username) return fail(res, 400, '用户名不能为空')
    if (!isStrongPassword(body.password)) return fail(res, 400, '初始密码至少8位，且需包含字母和数字')
    const id = body.id?.trim() || makeId('user', username)
    const avatarColor = body.avatarColor?.trim() || '#0a6e5c'
    db.prepare(`
      INSERT INTO user_accounts
        (id, username, display_name, role, status, password_hash, phone_masked, created_at, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, username, body.displayName?.trim(), body.role, body.status, makePasswordHash(body.password), body.phoneMasked?.trim(), nowLocal(), avatarColor)
    appendAudit('新增账户', 'user_accounts', id, `新增${body.role} ${username}`, admin.username, admin.role)
    created(res, toSafeUser(rowToUser(db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(id))))
  },

  'PUT /api/users/:id': async (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const current = db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(params.id)
    if (!current) return fail(res, 404, '用户不存在')
    const body = await readJson(req)
    const activeAdmins = db.prepare(`
      SELECT COUNT(*) AS count FROM user_accounts
      WHERE id <> ? AND role = '管理员' AND status = '启用'
    `).get(params.id).count
    if ((body.role === '普通用户' || body.status === '停用') && current.role === '管理员' && activeAdmins === 0) {
      return fail(res, 409, '至少需要保留一个启用的管理员账号')
    }
    db.prepare(`
      UPDATE user_accounts
      SET username = ?, display_name = ?, role = ?, status = ?, phone_masked = ?, avatar_color = ?,
          password_hash = CASE WHEN ? IS NULL THEN password_hash ELSE ? END
      WHERE id = ?
    `).run(
      body.username?.trim().toLowerCase() ?? current.username,
      body.displayName?.trim() ?? current.display_name,
      body.role ?? current.role,
      body.status ?? current.status,
      body.phoneMasked?.trim() ?? current.phone_masked,
      body.avatarColor?.trim() ?? current.avatar_color ?? '#0a6e5c',
      body.password ? makePasswordHash(body.password) : null,
      body.password ? makePasswordHash(body.password) : null,
      params.id,
    )
    appendAudit('修改账户', 'user_accounts', params.id, `更新账户 ${body.username ?? current.username}`, admin.username, admin.role)
    ok(res, toSafeUser(rowToUser(db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(params.id))))
  },

  'DELETE /api/users/:id': (req, res, _url, params) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const target = db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(params.id)
    if (!target) return fail(res, 404, '用户不存在')
    const activeAdmins = db.prepare(`
      SELECT COUNT(*) AS count FROM user_accounts
      WHERE id <> ? AND role = '管理员' AND status = '启用'
    `).get(params.id).count
    if (target.role === '管理员' && target.status === '启用' && activeAdmins === 0) {
      return fail(res, 409, '至少需要保留一个启用的管理员账号')
    }
    db.prepare('DELETE FROM user_accounts WHERE id = ?').run(params.id)
    appendAudit('删除账户', 'user_accounts', params.id, `删除账户 ${target.username}`, admin.username, admin.role)
    ok(res, { ok: true })
  },

  'POST /api/reset/orders': (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    db.prepare('DELETE FROM booking_orders').run()
    appendAudit('重置订单表', 'booking_orders', 'seed', '订单表已清空，可重新演示预约流程', admin.username, admin.role)
    ok(res, { ok: true })
  },

  'POST /api/reset/database': (req, res) => {
    const admin = requireAdmin(req, res)
    if (!admin) return
    seedDatabase()
    appendAudit('重置整库', 'database', 'hangzhou.sqlite', '恢复全部种子数据', admin.username, admin.role)
    ok(res, { ok: true })
  },
}

const routeParams = (method, pathname) => {
  for (const key of Object.keys(routes)) {
    const [routeMethod, routePath] = key.split(' ')
    if (routeMethod !== method) continue
    const names = []
    const pattern = routePath
      .replace(/:[^/]+/g, (part) => {
        names.push(part.slice(1))
        return '([^/]+)'
      })
      .replace(/\//g, '\\/')
    const match = pathname.match(new RegExp(`^${pattern}$`))
    if (match) {
      return {
        handler: routes[key],
        params: Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(match[index + 1])])),
      }
    }
  }
  return null
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {})
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    if (req.method === 'GET' && tryServePublicFile(url.pathname, res)) return
    const route = routeParams(req.method, url.pathname)
    if (!route) return fail(res, 404, '接口不存在')
    await route.handler(req, res, url, route.params)
  } catch (error) {
    console.error(error)
    fail(res, 500, error instanceof Error ? error.message : '服务器错误')
  }
})

server.listen(PORT, () => {
  console.log(`Hangzhou API running at http://localhost:${PORT}`)
})
