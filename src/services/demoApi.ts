import {
  auditLogs as seedAuditLogs,
  bookingOrders as seedBookingOrders,
  bookingSlots as seedBookingSlots,
  cityPassPrices,
  scenicSpots as seedScenicSpots,
  ticketTypes as seedTicketTypes,
  userAccounts as seedUserAccounts,
} from '../content/demoData'
import { staticWeather } from '../content/staticWeather'
import type {
  ApiAuditLog,
  ApiBookingSlot,
  ApiScenicSpot,
  ApiTicketType,
  ApiUserAccount,
  BookingSlotInput,
  CreateBookingPayload,
  ScenicSpotInput,
  TicketTypeInput,
  UserAccountInput,
} from './api'
import type { BookingOrder, BookingOrderStatus } from '../types/booking'
import type { AuthUser, LoginCredentials, RegisterPayload } from '../types/security'

const STORAGE_PREFIX = 'hangzhou-static-v2:'
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const readStored = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return clone(fallback)
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) as T : clone(fallback)
  } catch {
    return clone(fallback)
  }
}

const writeStored = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // Static demo state is best-effort; browsing still works without persistence.
  }
}

const spotName = (id: string) => spots.find((spot) => spot.id === id)?.nameZh ?? ''
const normalizeSlot = (slot: (typeof seedBookingSlots)[number]): ApiBookingSlot => ({
  ...slot,
  spotName: seedScenicSpots.find((spot) => spot.id === slot.scenicSpotId)?.nameZh ?? '',
  localBooked: 0,
  remaining: Math.max(slot.capacity - slot.booked, 0),
})

let spots = readStored<ApiScenicSpot[]>('spots', seedScenicSpots as ApiScenicSpot[])
let tickets = readStored<ApiTicketType[]>('tickets', seedTicketTypes as ApiTicketType[])
let slots = readStored<ApiBookingSlot[]>('slots', seedBookingSlots.map(normalizeSlot))
let orders = readStored<BookingOrder[]>('orders', seedBookingOrders as BookingOrder[])
let users = readStored<ApiUserAccount[]>('users', seedUserAccounts as ApiUserAccount[])
let audits = readStored<ApiAuditLog[]>('audits', seedAuditLogs as ApiAuditLog[])

const demoPasswordHashes = readStored<Record<string, string>>('passwords', {})

const passwordHash = (password: string) => {
  let hash = 2166136261
  for (const character of password) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

for (const account of seedUserAccounts) {
  demoPasswordHashes[account.username] ??= passwordHash('123456')
}

const parseBody = <T>(init?: RequestInit): T => {
  if (typeof init?.body !== 'string') return {} as T
  return JSON.parse(init.body) as T
}

const publicUser = (user: ApiUserAccount): AuthUser => {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

const userFromToken = (token: string) => {
  if (!token.startsWith('demo:')) return undefined
  return users.find((user) => user.id === token.slice(5))
}

const requireUser = (token: string) => {
  const user = userFromToken(token)
  if (!user || user.status !== '启用') throw new Error('请先登录')
  return user
}

const requireAdmin = (token: string) => {
  const user = requireUser(token)
  if (user.role !== '管理员') throw new Error('仅管理员可执行此操作')
  return user
}

const persistCatalog = () => {
  writeStored('spots', spots)
  writeStored('tickets', tickets)
  writeStored('slots', slots)
}

const persistSecurity = () => {
  writeStored('users', users)
  writeStored('passwords', demoPasswordHashes)
  writeStored('audits', audits)
}

const addAudit = (token: string, action: string, targetTable: string, targetId: string, detail: string) => {
  const actor = userFromToken(token)
  audits = [{
    id: `audit-${Date.now()}`,
    actor: actor?.username ?? 'demo',
    role: actor?.role ?? '演示访客',
    action,
    targetTable,
    targetId,
    detail,
    createdAt: new Date().toISOString(),
  }, ...audits]
  writeStored('audits', audits)
}

const resetDemoState = () => {
  spots = clone(seedScenicSpots) as ApiScenicSpot[]
  tickets = clone(seedTicketTypes) as ApiTicketType[]
  slots = seedBookingSlots.map(normalizeSlot)
  orders = clone(seedBookingOrders) as BookingOrder[]
  users = clone(seedUserAccounts) as ApiUserAccount[]
  audits = clone(seedAuditLogs) as ApiAuditLog[]
  persistCatalog()
  writeStored('orders', orders)
  persistSecurity()
}

const response = <T>(value: T): Promise<T> => Promise.resolve(clone(value))

export const handleDemoRequest = async <T>(path: string, init: RequestInit | undefined, token: string): Promise<T> => {
  const method = (init?.method ?? 'GET').toUpperCase()
  const url = new URL(path, 'https://hangzhou.demo')
  const route = url.pathname

  if (route === '/scenic-spots' && method === 'GET') return response(spots) as Promise<T>
  if (route.startsWith('/scenic-spots/') && method === 'GET') {
    const id = decodeURIComponent(route.slice('/scenic-spots/'.length))
    const found = spots.find((spot) => spot.id === id)
    if (!found) throw new Error('景点不存在')
    return response(found) as Promise<T>
  }
  if (route === '/scenic-spots' && method === 'POST') {
    requireAdmin(token)
    const input = parseBody<ScenicSpotInput>(init)
    const created = { ...input, id: input.id ?? `spot-${Date.now()}` } as ApiScenicSpot
    spots = [created, ...spots]
    persistCatalog()
    addAudit(token, '新增景点', 'scenic_spots', created.id, `新增景点 ${created.nameZh}`)
    return response(created) as Promise<T>
  }
  if (route.startsWith('/scenic-spots/') && method === 'PUT') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/scenic-spots/'.length))
    const current = spots.find((spot) => spot.id === id)
    if (!current) throw new Error('景点不存在')
    const updated = { ...current, ...parseBody<Partial<ApiScenicSpot>>(init), id }
    spots = spots.map((spot) => spot.id === id ? updated : spot)
    persistCatalog()
    addAudit(token, '修改景点', 'scenic_spots', id, `更新景点 ${updated.nameZh}`)
    return response(updated) as Promise<T>
  }
  if (route.startsWith('/scenic-spots/') && method === 'DELETE') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/scenic-spots/'.length))
    spots = spots.filter((spot) => spot.id !== id)
    tickets = tickets.filter((ticket) => ticket.scenicSpotId !== id)
    persistCatalog()
    addAudit(token, '删除景点', 'scenic_spots', id, '删除演示景点及关联票种')
    return response({ ok: true }) as Promise<T>
  }
  if (route === '/uploads/scenic-spot-image' && method === 'POST') {
    requireAdmin(token)
    const input = parseBody<{ mimeType: string; dataBase64: string }>(init)
    return response({ imageUrl: `data:${input.mimeType};base64,${input.dataBase64}` }) as Promise<T>
  }

  if (route === '/ticket-types' && method === 'GET') {
    const spotId = url.searchParams.get('scenicSpotId')
    return response(spotId ? tickets.filter((ticket) => ticket.scenicSpotId === spotId) : tickets) as Promise<T>
  }
  if (route === '/ticket-types' && method === 'POST') {
    requireAdmin(token)
    const input = parseBody<TicketTypeInput>(init)
    const created = { ...input, id: input.id ?? `ticket-${Date.now()}` } as ApiTicketType
    tickets = [created, ...tickets]
    persistCatalog()
    addAudit(token, '新增票种', 'ticket_types', created.id, `新增票种 ${created.name}`)
    return response(created) as Promise<T>
  }
  if (route.startsWith('/ticket-types/') && method === 'PUT') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/ticket-types/'.length))
    const current = tickets.find((ticket) => ticket.id === id)
    if (!current) throw new Error('票种不存在')
    const updated = { ...current, ...parseBody<Partial<ApiTicketType>>(init), id }
    tickets = tickets.map((ticket) => ticket.id === id ? updated : ticket)
    persistCatalog()
    addAudit(token, '修改票种', 'ticket_types', id, `更新票种 ${updated.name}`)
    return response(updated) as Promise<T>
  }
  if (route.startsWith('/ticket-types/') && method === 'DELETE') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/ticket-types/'.length))
    tickets = tickets.filter((ticket) => ticket.id !== id)
    persistCatalog()
    addAudit(token, '删除票种', 'ticket_types', id, '删除演示票种')
    return response({ ok: true }) as Promise<T>
  }

  if (route === '/booking-slots' && method === 'GET') {
    const spotId = url.searchParams.get('scenicSpotId')
    return response(spotId ? slots.filter((slot) => slot.scenicSpotId === spotId) : slots) as Promise<T>
  }
  if (route === '/booking-slots' && method === 'POST') {
    requireAdmin(token)
    const input = parseBody<BookingSlotInput>(init)
    const booked = input.booked ?? 0
    const created: ApiBookingSlot = {
      ...input,
      id: input.id ?? `slot-${Date.now()}`,
      booked,
      spotName: spotName(input.scenicSpotId),
      localBooked: 0,
      remaining: Math.max(input.capacity - booked, 0),
    }
    slots = [created, ...slots]
    persistCatalog()
    addAudit(token, '新增时段', 'booking_slots', created.id, `${created.date} ${created.timeRange}`)
    return response(created) as Promise<T>
  }
  if (route.startsWith('/booking-slots/') && method === 'PUT') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/booking-slots/'.length))
    const current = slots.find((slot) => slot.id === id)
    if (!current) throw new Error('时段不存在')
    const updated = { ...current, ...parseBody<Partial<ApiBookingSlot>>(init), id }
    updated.remaining = Math.max(updated.capacity - updated.booked, 0)
    slots = slots.map((slot) => slot.id === id ? updated : slot)
    persistCatalog()
    addAudit(token, '修改时段', 'booking_slots', id, `${updated.date} ${updated.timeRange}`)
    return response(updated) as Promise<T>
  }
  if (route.startsWith('/booking-slots/') && method === 'DELETE') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/booking-slots/'.length))
    slots = slots.filter((slot) => slot.id !== id)
    persistCatalog()
    addAudit(token, '删除时段', 'booking_slots', id, '删除演示预约时段')
    return response({ ok: true }) as Promise<T>
  }

  if (route === '/orders' && method === 'GET') {
    const user = requireUser(token)
    return response(user.role === '管理员' ? orders : orders.filter((order) => order.userId === user.id)) as Promise<T>
  }
  if (route === '/orders' && method === 'POST') {
    const user = requireUser(token)
    const input = parseBody<CreateBookingPayload>(init)
    const slot = slots.find((item) => item.id === input.slotId)
    if (!slot || slot.remaining < input.visitorCount) throw new Error('该时段余量不足')
    const now = new Date()
    const id = `HZ-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    const ticketPrice = tickets.find((ticket) => ticket.scenicSpotId === input.scenicSpotId && (!input.ticketName || ticket.name === input.ticketName))?.price ?? 0
    const amount = (input.cityPassId ? cityPassPrices.get(input.cityPassId) ?? 0 : ticketPrice) * input.visitorCount
    const created: BookingOrder = {
      id,
      scenicSpotId: input.scenicSpotId,
      slotId: input.slotId,
      userId: user.id,
      cityPassId: input.cityPassId,
      ticketName: input.ticketName,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === 'free' ? '免费预约' : '支付完成',
      amount,
      spotName: spotName(input.scenicSpotId),
      visitDate: slot.date,
      timeRange: slot.timeRange,
      visitors: [input.visitorName],
      visitorCount: input.visitorCount,
      status: '待出行',
      qrCodeText: `VERIFY-${id}`,
      createdAt: now.toISOString(),
      contactPhone: input.visitorPhone,
      contactEmail: input.visitorEmail,
      maskedIdNumber: input.visitorIdNumber.replace(/.(?=.{4})/g, '*'),
      voucherChannels: ['sms', 'email'],
      refundStatus: '无需退款',
      supportHotline: '12301',
      supportEmail: 'tickets@hangzhou.example.gov.cn',
      appealStatus: '可发起',
      invoiceStatus: '可申请',
    }
    orders = [created, ...orders]
    slots = slots.map((item) => item.id === slot.id ? {
      ...item,
      booked: item.booked + input.visitorCount,
      localBooked: item.localBooked + input.visitorCount,
      remaining: item.remaining - input.visitorCount,
    } : item)
    writeStored('orders', orders)
    persistCatalog()
    return response(created) as Promise<T>
  }
  if (/^\/orders\/[^/]+\/status$/.test(route) && method === 'PATCH') {
    const user = requireUser(token)
    const id = decodeURIComponent(route.split('/')[2])
    const current = orders.find((order) => order.id === id)
    if (!current || (user.role !== '管理员' && current.userId !== user.id)) throw new Error('订单不存在')
    const input = parseBody<{ status: BookingOrderStatus; cancellationReason?: string }>(init)
    const updated = { ...current, ...input }
    orders = orders.map((order) => order.id === id ? updated : order)
    writeStored('orders', orders)
    return response(updated) as Promise<T>
  }
  if (route.startsWith('/orders/') && method === 'DELETE') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/orders/'.length))
    orders = orders.filter((order) => order.id !== id)
    writeStored('orders', orders)
    addAudit(token, '删除订单', 'booking_orders', id, '删除演示订单')
    return response({ ok: true }) as Promise<T>
  }

  if (route === '/users' && method === 'GET') {
    requireAdmin(token)
    return response(users.map(publicUser)) as Promise<T>
  }
  if (route === '/users' && method === 'POST') {
    requireAdmin(token)
    const input = parseBody<UserAccountInput>(init)
    if (users.some((user) => user.username === input.username)) throw new Error('用户名已存在')
    const now = new Date().toISOString()
    const created: ApiUserAccount = {
      id: input.id ?? `user-${Date.now()}`,
      username: input.username,
      displayName: input.displayName,
      role: input.role,
      status: input.status,
      phoneMasked: input.phoneMasked,
      avatarColor: input.avatarColor,
      createdAt: now,
    }
    users = [created, ...users]
    demoPasswordHashes[created.username] = passwordHash(input.password || '123456')
    persistSecurity()
    addAudit(token, '新增账户', 'user_accounts', created.id, `新增${created.role} ${created.username}`)
    return response(publicUser(created)) as Promise<T>
  }
  if (route.startsWith('/users/') && method === 'PUT') {
    requireAdmin(token)
    const id = decodeURIComponent(route.slice('/users/'.length))
    const current = users.find((user) => user.id === id)
    if (!current) throw new Error('账户不存在')
    const input = parseBody<Partial<UserAccountInput>>(init)
    const updated = { ...current, ...input, id }
    users = users.map((user) => user.id === id ? updated : user)
    if (input.password) demoPasswordHashes[updated.username] = passwordHash(input.password)
    persistSecurity()
    addAudit(token, '修改账户', 'user_accounts', id, `更新账户 ${updated.username}`)
    return response(publicUser(updated)) as Promise<T>
  }
  if (route.startsWith('/users/') && method === 'DELETE') {
    const admin = requireAdmin(token)
    const id = decodeURIComponent(route.slice('/users/'.length))
    if (admin.id === id) throw new Error('不能删除当前登录账户')
    users = users.filter((user) => user.id !== id)
    persistSecurity()
    addAudit(token, '删除账户', 'user_accounts', id, '删除演示账户')
    return response({ ok: true }) as Promise<T>
  }
  if (route === '/audit-logs' && method === 'GET') {
    requireAdmin(token)
    return response(audits) as Promise<T>
  }

  if (route === '/weather/hangzhou' && method === 'GET') {
    return response({ ...staticWeather, syncedAt: new Date().toISOString() }) as Promise<T>
  }
  if (route === '/reset/orders' && method === 'POST') {
    requireAdmin(token)
    orders = clone(seedBookingOrders) as BookingOrder[]
    writeStored('orders', orders)
    addAudit(token, '重置订单表', 'booking_orders', 'seed', '恢复演示订单')
    return response({ ok: true }) as Promise<T>
  }
  if (route === '/reset/database' && method === 'POST') {
    requireAdmin(token)
    resetDemoState()
    return response({ ok: true }) as Promise<T>
  }

  if (route === '/auth/login' && method === 'POST') {
    const credentials = parseBody<LoginCredentials>(init)
    const user = users.find((account) => account.username === credentials.username)
    if (!user || user.status !== '启用' || demoPasswordHashes[user.username] !== passwordHash(credentials.password)) {
      throw new Error('用户名或密码错误')
    }
    user.lastLoginAt = new Date().toISOString()
    writeStored('users', users)
    return response({ token: `demo:${user.id}`, user: publicUser(user) }) as Promise<T>
  }
  if (route === '/auth/register' && method === 'POST') {
    const input = parseBody<RegisterPayload>(init)
    if (users.some((user) => user.username === input.username)) throw new Error('用户名已存在')
    const now = new Date().toISOString()
    const created: ApiUserAccount = {
      id: `user-${Date.now()}`,
      username: input.username,
      displayName: input.displayName,
      role: '普通用户',
      status: '启用',
      phoneMasked: `${input.phone.slice(0, 3)}****${input.phone.slice(-4)}`,
      avatarColor: '#7f9c8d',
      createdAt: now,
      lastLoginAt: now,
    }
    users = [created, ...users]
    demoPasswordHashes[created.username] = passwordHash(input.password)
    persistSecurity()
    return response({ token: `demo:${created.id}`, user: publicUser(created) }) as Promise<T>
  }
  if (route === '/auth/me' && method === 'GET') return response(publicUser(requireUser(token))) as Promise<T>
  if (route === '/auth/logout' && method === 'POST') return response({ ok: true }) as Promise<T>

  throw new Error(`演示模式暂不支持：${method} ${route}`)
}
