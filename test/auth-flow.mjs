import { spawn } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const port = 4317
const baseUrl = `http://127.0.0.1:${port}/api`
const dbPath = resolve('data/test-auth-flow.sqlite')

rmSync(dbPath, { force: true })

const server = spawn(process.execPath, ['server/index.mjs'], {
  env: { ...process.env, API_PORT: String(port), SQLITE_PATH: dbPath },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let output = ''
server.stdout.on('data', (chunk) => {
  output += chunk.toString()
})
server.stderr.on('data', (chunk) => {
  output += chunk.toString()
})

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

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
  const payload = await response.json().catch(() => ({}))
  return { response, payload }
}

const expectStatus = ({ response, payload }, status, label) => {
  if (response.status !== status) {
    throw new Error(`${label}: expected ${status}, got ${response.status} ${JSON.stringify(payload)}`)
  }
}

const login = async (username, password = '123456') => {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  expectStatus(result, 200, `login ${username}`)
  return result.payload
}

try {
  await waitForServer()

  const guestUsers = await request('/users')
  expectStatus(guestUsers, 401, 'guest cannot list users')

  const admin = await login('admin')
  if (admin.user.role !== '管理员') {
    throw new Error(`admin login returned wrong role: ${admin.user.role}`)
  }
  if (!admin.user.avatarColor) {
    throw new Error('admin login should include avatar color')
  }

  const traveler = await login('traveler')
  if (traveler.user.role !== '普通用户') {
    throw new Error(`traveler login returned wrong role: ${traveler.user.role}`)
  }

  const travelerUsers = await request('/users', { token: traveler.token })
  expectStatus(travelerUsers, 403, 'traveler cannot list users')

  const adminUsers = await request('/users', { token: admin.token })
  expectStatus(adminUsers, 200, 'admin can list users')
  if (!adminUsers.payload.every((user) => !('passwordHash' in user))) {
    throw new Error('admin user list must not expose passwordHash')
  }

  const travelerOrders = await request('/orders', { token: traveler.token })
  expectStatus(travelerOrders, 200, 'traveler can list own orders')
  if (travelerOrders.payload.length !== 1 || travelerOrders.payload[0].id !== 'HZ-20260609-0001') {
    throw new Error(`traveler should only see seeded own order: ${JSON.stringify(travelerOrders.payload)}`)
  }

  const guestOrders = await request('/orders')
  expectStatus(guestOrders, 401, 'guest cannot list orders')

  const adminOrders = await request('/orders', { token: admin.token })
  expectStatus(adminOrders, 200, 'admin can list all orders')
  if (adminOrders.payload.length < travelerOrders.payload.length) {
    throw new Error('admin order list should include traveler orders')
  }

  const weakPassword = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `weak${Date.now()}`,
      password: '1234567',
      displayName: '弱密码游客',
      phone: '13900007777',
    }),
  })
  expectStatus(weakPassword, 400, 'reject password without letters')

  const shortPassword = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `short${Date.now()}`,
      password: 'a12345',
      displayName: '短密码游客',
      phone: '13900007777',
    }),
  })
  expectStatus(shortPassword, 400, 'reject short password')

  const invalidPhone = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `phone${Date.now()}`,
      password: 'abc12345',
      displayName: '错号游客',
      phone: '12345',
    }),
  })
  expectStatus(invalidPhone, 400, 'reject invalid phone number')

  const registration = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `guest${Date.now()}`,
      password: 'abc12345',
      displayName: '新游客账号',
      phone: '13900007788',
    }),
  })
  expectStatus(registration, 201, 'register traveler')
  if (registration.payload.user.role !== '普通用户') {
    throw new Error('registration should always create a traveler role')
  }
  if (registration.payload.user.phoneMasked !== '139****7788') {
    throw new Error(`registration should store masked phone: ${registration.payload.user.phoneMasked}`)
  }

  const westLakeSlots = await request('/booking-slots?scenicSpotId=west-lake')
  expectStatus(westLakeSlots, 200, 'public can list booking slots')
  const availableSlot = westLakeSlots.payload.find((slot) => slot.remaining > 0)
  if (!availableSlot) {
    throw new Error('expected at least one available west lake slot')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const databaseConnection = new DatabaseSync(dbPath)
  databaseConnection
    .prepare("UPDATE booking_slots SET date = ?, time_range = '00:00-00:30', capacity = 20, booked = 0 WHERE id = ?")
    .run(today, availableSlot.id)
  databaseConnection.close()

  const expiredOrder = await request('/orders', {
    method: 'POST',
    token: registration.payload.token,
    body: JSON.stringify({
      scenicSpotId: 'west-lake',
      slotId: availableSlot.id,
      ticketName: '免费入园登记',
      paymentMethod: 'free',
      visitorName: '测试游客',
      visitorPhone: '13900007788',
      visitorEmail: 'test@example.com',
      visitorIdNumber: '330102199001017788',
      visitorCount: 1,
    }),
  })
  expectStatus(expiredOrder, 409, 'reject expired same-day slot')

  const refreshedSlots = await request('/booking-slots?scenicSpotId=west-lake')
  expectStatus(refreshedSlots, 200, 'public can list refreshed booking slots')
  const nextAvailableSlot = refreshedSlots.payload.find((slot) => slot.remaining > 0 && slot.date > today)
  if (!nextAvailableSlot) {
    throw new Error('expected another available west lake slot')
  }

  const createOrder = await request('/orders', {
    method: 'POST',
    token: registration.payload.token,
    body: JSON.stringify({
      scenicSpotId: 'west-lake',
      slotId: nextAvailableSlot.id,
      ticketName: '免费入园登记',
      paymentMethod: 'free',
      visitorName: '测试游客',
      visitorPhone: '13900007788',
      visitorEmail: 'test@example.com',
      visitorIdNumber: '330102199001017788',
      visitorCount: 1,
    }),
  })
  expectStatus(createOrder, 201, 'logged-in traveler can create order')
  if (createOrder.payload.userId !== registration.payload.user.id) {
    throw new Error('created order should be linked to the current user')
  }

  const ownOrders = await request('/orders', { token: registration.payload.token })
  expectStatus(ownOrders, 200, 'new traveler can list own orders')
  if (!ownOrders.payload.some((order) => order.id === createOrder.payload.id)) {
    throw new Error('new traveler order list should include the created order')
  }

  const database = readFileSync(dbPath)
  if (!database.length) {
    throw new Error('database file should exist after auth flow')
  }
} finally {
  server.kill()
}
