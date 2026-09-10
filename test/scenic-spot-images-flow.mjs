import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const port = 4322
const baseUrl = `http://127.0.0.1:${port}/api`
const dbPath = resolve('data/test-scenic-spot-images-flow.sqlite')

rmSync(dbPath, { force: true })
let uploadedImagePath = ''

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

try {
  await waitForServer()

  const seededSpots = await request('/scenic-spots')
  expectStatus(seededSpots, 200, 'list seeded scenic spots')
  const seededMissingImages = seededSpots.payload.filter((spot) => !spot.imageUrl)
  if (seededMissingImages.length > 0) {
    throw new Error(`seeded spots should expose imageUrl: ${seededMissingImages.map((spot) => spot.id).join(', ')}`)
  }

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: '123456' }),
  })
  expectStatus(login, 200, 'admin login')

  const upload = await request('/uploads/scenic-spot-image', {
    method: 'POST',
    token: login.payload.token,
    body: JSON.stringify({
      fileName: 'demo.png',
      mimeType: 'image/png',
      dataBase64:
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    }),
  })
  expectStatus(upload, 201, 'upload scenic spot image')
  if (!upload.payload.imageUrl?.startsWith('/uploads/scenic-spots/')) {
    throw new Error(`upload should return stored imageUrl: ${JSON.stringify(upload.payload)}`)
  }
  uploadedImagePath = resolve('public', upload.payload.imageUrl.replace(/^\/+/, ''))

  const createSpot = await request('/scenic-spots', {
    method: 'POST',
    token: login.payload.token,
    body: JSON.stringify({
      id: 'image-test-spot',
      nameZh: '图片测试景点',
      nameEn: 'Image Test Spot',
      area: '测试区',
      category: '测试分类',
      description: '用于验证景点图片上传和展示的数据闭环。',
      address: '测试路 1 号',
      openingHours: '09:00-17:00',
      tags: ['图片', '测试'],
      reservationRequired: false,
      paid: false,
      featured: false,
      imageUrl: upload.payload.imageUrl,
      imagePosition: '50% 45%',
    }),
  })
  expectStatus(createSpot, 201, 'create scenic spot with uploaded image')
  if (createSpot.payload.imageUrl !== upload.payload.imageUrl || createSpot.payload.imagePosition !== '50% 45%') {
    throw new Error(`created spot should keep image fields: ${JSON.stringify(createSpot.payload)}`)
  }

  const detail = await request('/scenic-spots/image-test-spot')
  expectStatus(detail, 200, 'detail returns image fields')
  if (detail.payload.imageUrl !== upload.payload.imageUrl || detail.payload.imagePosition !== '50% 45%') {
    throw new Error(`detail should expose image fields: ${JSON.stringify(detail.payload)}`)
  }
} finally {
  server.kill()
  if (uploadedImagePath) {
    rmSync(uploadedImagePath, { force: true })
  }
}
