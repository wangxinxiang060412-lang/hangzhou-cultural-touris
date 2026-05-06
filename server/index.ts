import cors from 'cors'
import { randomUUID } from 'node:crypto'
import express from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { db, initializeDatabase, mapOrderRow } from './db'
import type { OrderRow, OrderStatus, SlotRow } from './db'
import { seedBookingSlots, seedOrders, seedScenicSpots, seedTicketTypes } from './data'

const app = express()
const port = Number(process.env.PORT ?? 4174)
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000
const HANGZHOU_COORDINATES = {
  latitude: 30.27,
  longitude: 120.15,
}

type WeatherCache = {
  expiresAt: number
  payload: HangzhouWeatherPayload
}

type HangzhouWeatherPayload = {
  location: string
  latitude: number
  longitude: number
  timezone: string
  source: string
  sourceUrl: string
  syncedAt: string
  cacheStatus: 'live' | 'cached' | 'stale'
  syncError?: string
  current: {
    time: string
    temperature: number
    feelsLike: number
    humidity: number
    precipitation: number
    rain: number
    cloudCover: number
    windSpeed: number
    windDirection: number
    weatherCode: number
    isDay: boolean
  }
  daily: Array<{
    date: string
    weatherCode: number
    temperatureMax: number
    temperatureMin: number
    precipitationProbability: number
    precipitationSum: number
    windSpeedMax: number
    sunrise: string
    sunset: string
  }>
}

let weatherCache: WeatherCache | null = null

initializeDatabase()

app.use(cors())
app.use(express.json())

const idSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, '仅允许小写字母、数字、短横线，首字符需为字母或数字')

const orderStatusSchema = z.enum(['待出行', '已完成', '已取消'])

const tagsSchema = z.array(z.string().trim().min(1).max(24)).max(12)

const scenicSpotCreateSchema = z.object({
  id: idSchema.optional(),
  nameZh: z.string().trim().min(1),
  nameEn: z.string().trim().min(1),
  area: z.string().trim().min(1),
  category: z.string().trim().min(1),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  openingHours: z.string().trim().optional(),
  tags: tagsSchema.optional(),
  reservationRequired: z.boolean().optional(),
  paid: z.boolean().optional(),
  featured: z.boolean().optional(),
})

const scenicSpotPatchSchema = z.object({
  nameZh: z.string().trim().min(1).optional(),
  nameEn: z.string().trim().min(1).optional(),
  area: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  openingHours: z.string().trim().optional(),
  tags: tagsSchema.optional(),
  reservationRequired: z.boolean().optional(),
  paid: z.boolean().optional(),
  featured: z.boolean().optional(),
})

const ticketTypeCreateSchema = z.object({
  id: idSchema.optional(),
  scenicSpotId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: z.number().int().min(0).max(1_000_000),
  description: z.string().trim().optional(),
  availableFor: z.string().trim().optional(),
})

const ticketTypePatchSchema = z.object({
  scenicSpotId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  price: z.number().int().min(0).max(1_000_000).optional(),
  description: z.string().trim().optional(),
  availableFor: z.string().trim().optional(),
})

const bookingSlotCreateSchema = z.object({
  id: idSchema.optional(),
  scenicSpotId: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期需为 YYYY-MM-DD'),
  timeRange: z.string().trim().min(1).max(32),
  capacity: z.number().int().min(1).max(10_000),
  booked: z.number().int().min(0).max(10_000).optional(),
})

const bookingSlotPatchSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期需为 YYYY-MM-DD')
    .optional(),
  timeRange: z.string().trim().min(1).max(32).optional(),
  capacity: z.number().int().min(1).max(10_000).optional(),
  booked: z.number().int().min(0).max(10_000).optional(),
})

const createOrderSchema = z.object({
  scenicSpotId: z.string().min(1),
  slotId: z.string().min(1),
  ticketName: z.string().min(1),
  paymentMethod: z.enum(['free', 'alipay', 'wechat', 'unionpay']),
  visitorName: z.string().min(2),
  visitorPhone: z.string().min(7).max(20),
  visitorIdNumber: z.string().min(4),
  visitorCount: z.number().int().min(1).max(8),
})

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    database: 'sqlite',
    version: 'api-v2',
    weatherCache: weatherCache ? weatherCache.payload.cacheStatus : 'empty',
  })
})

app.get('/api/weather/hangzhou', async (_request, response) => {
  response.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  try {
    response.json(await fetchHangzhouWeather())
  } catch (error) {
    response.status(502).json({
      message: error instanceof Error ? error.message : '天气数据同步失败',
    })
  }
})

app.get('/api/scenic-spots', (_request, response) => {
  response.json(listScenicSpots())
})

app.get('/api/scenic-spots/:id', (request, response) => {
  const spot = findScenicSpot(request.params.id)
  if (!spot) {
    response.status(404).json({ message: '未找到景点' })
    return
  }
  response.json(spot)
})

app.post('/api/scenic-spots', (request, response) => {
  handleZod(scenicSpotCreateSchema, request, response, (input) => {
    const id = input.id ?? generateSlugId(input.nameEn)
    if (findScenicSpot(id)) {
      response.status(409).json({ message: '景点 ID 已存在' })
      return
    }

    db.prepare(
      `
        INSERT INTO scenic_spots (
          id, name_zh, name_en, area, category, description, address, opening_hours,
          tags_json, reservation_required, paid, featured
        )
        VALUES (@id, @nameZh, @nameEn, @area, @category, @description, @address, @openingHours,
          @tagsJson, @reservationRequired, @paid, @featured)
      `,
    ).run({
      id,
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      area: input.area,
      category: input.category,
      description: input.description ?? '',
      address: input.address ?? '',
      openingHours: input.openingHours ?? '',
      tagsJson: JSON.stringify(input.tags ?? []),
      reservationRequired: Number(input.reservationRequired ?? false),
      paid: Number(input.paid ?? false),
      featured: Number(input.featured ?? false),
    })

    response.status(201).json(findScenicSpot(id))
  })
})

app.patch('/api/scenic-spots/:id', (request, response) => {
  const spot = findScenicSpot(request.params.id)
  if (!spot) {
    response.status(404).json({ message: '未找到景点' })
    return
  }

  handleZod(scenicSpotPatchSchema, request, response, (input) => {
    db.prepare(
      `
        UPDATE scenic_spots SET
          name_zh = COALESCE(@nameZh, name_zh),
          name_en = COALESCE(@nameEn, name_en),
          area = COALESCE(@area, area),
          category = COALESCE(@category, category),
          description = COALESCE(@description, description),
          address = COALESCE(@address, address),
          opening_hours = COALESCE(@openingHours, opening_hours),
          tags_json = COALESCE(@tagsJson, tags_json),
          reservation_required = COALESCE(@reservationRequired, reservation_required),
          paid = COALESCE(@paid, paid),
          featured = COALESCE(@featured, featured)
        WHERE id = @id
      `,
    ).run({
      id: request.params.id,
      nameZh: input.nameZh ?? null,
      nameEn: input.nameEn ?? null,
      area: input.area ?? null,
      category: input.category ?? null,
      description: input.description ?? null,
      address: input.address ?? null,
      openingHours: input.openingHours ?? null,
      tagsJson: input.tags === undefined ? null : JSON.stringify(input.tags),
      reservationRequired:
        input.reservationRequired === undefined ? null : Number(input.reservationRequired),
      paid: input.paid === undefined ? null : Number(input.paid),
      featured: input.featured === undefined ? null : Number(input.featured),
    })

    response.json(findScenicSpot(request.params.id))
  })
})

app.delete('/api/scenic-spots/:id', (request, response) => {
  const spot = findScenicSpot(request.params.id)
  if (!spot) {
    response.status(404).json({ message: '未找到景点' })
    return
  }

  const activeOrders = countActiveOrdersForSpot(request.params.id)
  if (activeOrders > 0) {
    response.status(409).json({ message: `景点存在 ${activeOrders} 条未完成订单，无法删除` })
    return
  }

  db.prepare('DELETE FROM scenic_spots WHERE id = ?').run(request.params.id)
  response.json({ ok: true })
})

app.get('/api/ticket-types', (request, response) => {
  response.json(listTicketTypes(typeof request.query.scenicSpotId === 'string' ? request.query.scenicSpotId : ''))
})

app.post('/api/ticket-types', (request, response) => {
  handleZod(ticketTypeCreateSchema, request, response, (input) => {
    if (!findScenicSpot(input.scenicSpotId)) {
      response.status(400).json({ message: '关联的景点不存在' })
      return
    }

    const id = input.id ?? generateSlugId(`${input.scenicSpotId}-${input.name}`)
    if (findTicketType(id)) {
      response.status(409).json({ message: '票种 ID 已存在' })
      return
    }

    db.prepare(
      `
        INSERT INTO ticket_types (id, scenic_spot_id, name, price, description, available_for)
        VALUES (@id, @scenicSpotId, @name, @price, @description, @availableFor)
      `,
    ).run({
      id,
      scenicSpotId: input.scenicSpotId,
      name: input.name,
      price: input.price,
      description: input.description ?? '',
      availableFor: input.availableFor ?? '',
    })

    response.status(201).json(findTicketType(id))
  })
})

app.patch('/api/ticket-types/:id', (request, response) => {
  const ticket = findTicketType(request.params.id)
  if (!ticket) {
    response.status(404).json({ message: '未找到票种' })
    return
  }

  handleZod(ticketTypePatchSchema, request, response, (input) => {
    if (input.scenicSpotId && !findScenicSpot(input.scenicSpotId)) {
      response.status(400).json({ message: '关联的景点不存在' })
      return
    }

    db.prepare(
      `
        UPDATE ticket_types SET
          scenic_spot_id = COALESCE(@scenicSpotId, scenic_spot_id),
          name = COALESCE(@name, name),
          price = COALESCE(@price, price),
          description = COALESCE(@description, description),
          available_for = COALESCE(@availableFor, available_for)
        WHERE id = @id
      `,
    ).run({
      id: request.params.id,
      scenicSpotId: input.scenicSpotId ?? null,
      name: input.name ?? null,
      price: input.price ?? null,
      description: input.description ?? null,
      availableFor: input.availableFor ?? null,
    })

    response.json(findTicketType(request.params.id))
  })
})

app.delete('/api/ticket-types/:id', (request, response) => {
  const ticket = findTicketType(request.params.id)
  if (!ticket) {
    response.status(404).json({ message: '未找到票种' })
    return
  }

  db.prepare('DELETE FROM ticket_types WHERE id = ?').run(request.params.id)
  response.json({ ok: true })
})

app.get('/api/booking-slots', (request, response) => {
  response.json(listBookingSlots(typeof request.query.scenicSpotId === 'string' ? request.query.scenicSpotId : ''))
})

app.post('/api/booking-slots', (request, response) => {
  handleZod(bookingSlotCreateSchema, request, response, (input) => {
    if (!findScenicSpot(input.scenicSpotId)) {
      response.status(400).json({ message: '关联的景点不存在' })
      return
    }

    const booked = input.booked ?? 0
    if (booked > input.capacity) {
      response.status(400).json({ message: '基础已约人数不能超过容量' })
      return
    }

    const id = input.id ?? generateSlotId(input.scenicSpotId, input.date, input.timeRange)
    if (findBookingSlot(id)) {
      response.status(409).json({ message: '相同景点 / 日期 / 时段的入园时段已存在' })
      return
    }

    db.prepare(
      `
        INSERT INTO booking_slots (id, scenic_spot_id, date, time_range, capacity, booked)
        VALUES (@id, @scenicSpotId, @date, @timeRange, @capacity, @booked)
      `,
    ).run({
      id,
      scenicSpotId: input.scenicSpotId,
      date: input.date,
      timeRange: input.timeRange,
      capacity: input.capacity,
      booked,
    })

    response.status(201).json(findBookingSlot(id))
  })
})

app.patch('/api/booking-slots/:id', (request, response) => {
  const slot = findBookingSlot(request.params.id)
  if (!slot) {
    response.status(404).json({ message: '未找到入园时段' })
    return
  }

  handleZod(bookingSlotPatchSchema, request, response, (input) => {
    const nextCapacity = input.capacity ?? slot.capacity
    const nextBooked = input.booked ?? slot.booked
    if (nextBooked > nextCapacity) {
      response.status(400).json({ message: '基础已约人数不能超过容量' })
      return
    }

    db.prepare(
      `
        UPDATE booking_slots SET
          date = COALESCE(@date, date),
          time_range = COALESCE(@timeRange, time_range),
          capacity = COALESCE(@capacity, capacity),
          booked = COALESCE(@booked, booked)
        WHERE id = @id
      `,
    ).run({
      id: request.params.id,
      date: input.date ?? null,
      timeRange: input.timeRange ?? null,
      capacity: input.capacity ?? null,
      booked: input.booked ?? null,
    })

    response.json(findBookingSlot(request.params.id))
  })
})

app.delete('/api/booking-slots/:id', (request, response) => {
  const slot = findBookingSlot(request.params.id)
  if (!slot) {
    response.status(404).json({ message: '未找到入园时段' })
    return
  }

  const activeOrders = countActiveOrdersForSlot(request.params.id)
  if (activeOrders > 0) {
    response.status(409).json({ message: `时段有 ${activeOrders} 条未完成订单，无法删除` })
    return
  }

  db.prepare('DELETE FROM booking_slots WHERE id = ?').run(request.params.id)
  response.json({ ok: true })
})

app.get('/api/orders', (_request, response) => {
  const rows = db
    .prepare('SELECT * FROM booking_orders ORDER BY created_at DESC, id DESC')
    .all() as OrderRow[]
  response.json(rows.map(mapOrderRow))
})

app.post('/api/orders', (request, response) => {
  handleZod(createOrderSchema, request, response, (input) => {
    try {
      const order = createOrder(input)
      response.status(201).json(order)
    } catch (error) {
      response.status(400).json({ message: error instanceof Error ? error.message : '提交失败' })
    }
  })
})

app.patch('/api/orders/:id', (request, response) => {
  handleZod(z.object({ status: orderStatusSchema }), request, response, (input) => {
    const order = updateOrderStatus(request.params.id, input.status)
    if (!order) {
      response.status(404).json({ message: '未找到订单' })
      return
    }
    response.json(order)
  })
})

app.delete('/api/orders/:id', (request, response) => {
  const info = db.prepare('DELETE FROM booking_orders WHERE id = ?').run(request.params.id)
  if (info.changes === 0) {
    response.status(404).json({ message: '未找到订单' })
    return
  }
  response.json({ ok: true })
})

app.post('/api/admin/reset-orders', (_request, response) => {
  resetOrders()
  response.json({ ok: true })
})

app.post('/api/admin/reset-database', (_request, response) => {
  resetDatabase()
  response.json({ ok: true })
})

app.listen(port, () => {
  console.log(`West Lake API listening on http://localhost:${port}`)
})

const handleZod = <T extends z.ZodTypeAny>(
  schema: T,
  request: Request,
  response: Response,
  handler: (input: z.infer<T>) => void,
) => {
  const result = schema.safeParse(request.body)
  if (!result.success) {
    response.status(400).json({
      message: '请求参数无效',
      issues: result.error.flatten().fieldErrors,
    })
    return
  }
  handler(result.data)
}

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const buildWeatherUrl = () => {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(HANGZHOU_COORDINATES.latitude))
  url.searchParams.set('longitude', String(HANGZHOU_COORDINATES.longitude))
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'is_day',
    ].join(','),
  )
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_speed_10m_max',
      'sunrise',
      'sunset',
    ].join(','),
  )
  url.searchParams.set('timezone', 'Asia/Shanghai')
  url.searchParams.set('forecast_days', '3')
  return url
}

const fetchHangzhouWeather = async (): Promise<HangzhouWeatherPayload> => {
  const now = Date.now()
  if (weatherCache && weatherCache.expiresAt > now) {
    return {
      ...weatherCache.payload,
      cacheStatus: 'cached',
    }
  }

  const weatherUrl = buildWeatherUrl()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const upstreamResponse = await fetch(weatherUrl, { signal: controller.signal })

    if (!upstreamResponse.ok) {
      throw new Error(`天气源返回异常：${upstreamResponse.status}`)
    }

    const body = (await upstreamResponse.json()) as Record<string, unknown>
    const current = (body.current ?? {}) as Record<string, unknown>
    const daily = (body.daily ?? {}) as Record<string, unknown>

    const dates = Array.isArray(daily.time) ? daily.time.map(String) : []
    const weatherCodes = Array.isArray(daily.weather_code) ? daily.weather_code : []
    const temperatureMax = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : []
    const temperatureMin = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : []
    const precipitationProbability = Array.isArray(daily.precipitation_probability_max)
      ? daily.precipitation_probability_max
      : []
    const precipitationSum = Array.isArray(daily.precipitation_sum) ? daily.precipitation_sum : []
    const windSpeedMax = Array.isArray(daily.wind_speed_10m_max) ? daily.wind_speed_10m_max : []
    const sunrise = Array.isArray(daily.sunrise) ? daily.sunrise.map(String) : []
    const sunset = Array.isArray(daily.sunset) ? daily.sunset.map(String) : []

    const payload: HangzhouWeatherPayload = {
      location: 'Hangzhou',
      latitude: toNumber(body.latitude, HANGZHOU_COORDINATES.latitude),
      longitude: toNumber(body.longitude, HANGZHOU_COORDINATES.longitude),
      timezone: typeof body.timezone === 'string' ? body.timezone : 'Asia/Shanghai',
      source: 'Open-Meteo',
      sourceUrl: 'https://open-meteo.com/',
      syncedAt: new Date().toISOString(),
      cacheStatus: 'live',
      current: {
        time: typeof current.time === 'string' ? current.time : '',
        temperature: toNumber(current.temperature_2m),
        feelsLike: toNumber(current.apparent_temperature),
        humidity: toNumber(current.relative_humidity_2m),
        precipitation: toNumber(current.precipitation),
        rain: toNumber(current.rain),
        cloudCover: toNumber(current.cloud_cover),
        windSpeed: toNumber(current.wind_speed_10m),
        windDirection: toNumber(current.wind_direction_10m),
        weatherCode: toNumber(current.weather_code),
        isDay: Boolean(current.is_day),
      },
      daily: dates.map((date, index) => ({
        date,
        weatherCode: toNumber(weatherCodes[index]),
        temperatureMax: toNumber(temperatureMax[index]),
        temperatureMin: toNumber(temperatureMin[index]),
        precipitationProbability: toNumber(precipitationProbability[index]),
        precipitationSum: toNumber(precipitationSum[index]),
        windSpeedMax: toNumber(windSpeedMax[index]),
        sunrise: sunrise[index] ?? '',
        sunset: sunset[index] ?? '',
      })),
    }

    weatherCache = {
      expiresAt: now + WEATHER_CACHE_TTL_MS,
      payload,
    }

    return payload
  } catch (error) {
    if (weatherCache) {
      return {
        ...weatherCache.payload,
        cacheStatus: 'stale',
        syncError: error instanceof Error ? error.message : '天气数据同步失败',
      }
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

const mapScenicSpotRow = (row: Record<string, unknown>) => {
  const tagsJson = typeof row.tagsJson === 'string' ? row.tagsJson : '[]'
  let tags: string[] = []
  try {
    const parsed = JSON.parse(tagsJson) as unknown
    if (Array.isArray(parsed)) {
      tags = parsed.filter((item): item is string => typeof item === 'string')
    }
  } catch {
    tags = []
  }

  return {
    id: row.id as string,
    nameZh: row.nameZh as string,
    nameEn: row.nameEn as string,
    area: row.area as string,
    category: row.category as string,
    description: (row.description as string) ?? '',
    address: (row.address as string) ?? '',
    openingHours: (row.openingHours as string) ?? '',
    tags,
    reservationRequired: Boolean(row.reservationRequired),
    paid: Boolean(row.paid),
    featured: Boolean(row.featured),
  }
}

const listScenicSpots = () => {
  const rows = db
    .prepare(
      `
        SELECT
          id, name_zh AS nameZh, name_en AS nameEn, area, category, description,
          address, opening_hours AS openingHours, tags_json AS tagsJson,
          reservation_required AS reservationRequired, paid, featured
        FROM scenic_spots
        ORDER BY
          CASE id
            WHEN 'west-lake' THEN 1
            WHEN 'lingyin-feilaifeng' THEN 2
            WHEN 'xixi-wetland' THEN 3
            WHEN 'liangzhu-ancient-city' THEN 4
            WHEN 'grand-canal-hangzhou' THEN 5
            WHEN 'songcheng' THEN 6
            WHEN 'leifeng-pagoda' THEN 7
            WHEN 'hangzhou-botanical-garden' THEN 8
            WHEN 'hangzhou-zoo' THEN 9
            WHEN 'liuhetower' THEN 10
            WHEN 'hu-xueyan-residence' THEN 11
            WHEN 'guozhuang' THEN 12
            WHEN 'southern-song-imperial-street' THEN 13
            WHEN 'xiaohe-street' THEN 14
            WHEN 'xianghu' THEN 15
            WHEN 'qiandao-lake' THEN 16
            ELSE 99
          END,
          name_zh ASC
      `,
    )
    .all() as Array<Record<string, unknown>>

  return rows.map(mapScenicSpotRow)
}

const findScenicSpot = (id: string) => {
  const row = db
    .prepare(
      `
        SELECT
          id, name_zh AS nameZh, name_en AS nameEn, area, category, description,
          address, opening_hours AS openingHours, tags_json AS tagsJson,
          reservation_required AS reservationRequired, paid, featured
        FROM scenic_spots WHERE id = ?
      `,
    )
    .get(id) as Record<string, unknown> | undefined

  return row ? mapScenicSpotRow(row) : null
}

const listTicketTypes = (scenicSpotId: string) => {
  if (scenicSpotId) {
    return db
      .prepare(
        `
          SELECT id, scenic_spot_id AS scenicSpotId, name, price, description, available_for AS availableFor
          FROM ticket_types
          WHERE scenic_spot_id = ?
          ORDER BY price ASC, name ASC
        `,
      )
      .all(scenicSpotId)
  }

  return db
    .prepare(
      `
        SELECT id, scenic_spot_id AS scenicSpotId, name, price, description, available_for AS availableFor
        FROM ticket_types
        ORDER BY scenic_spot_id ASC, price ASC, name ASC
      `,
    )
    .all()
}

const findTicketType = (id: string) =>
  db
    .prepare(
      `
        SELECT id, scenic_spot_id AS scenicSpotId, name, price, description, available_for AS availableFor
        FROM ticket_types WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: string
        scenicSpotId: string
        name: string
        price: number
        description: string
        availableFor: string
      }
    | undefined

const listBookingSlots = (scenicSpotId: string) => {
  const rows = db
    .prepare(
      `
        SELECT
          bs.id,
          bs.scenic_spot_id,
          bs.date,
          bs.time_range,
          bs.capacity,
          bs.booked,
          ss.name_zh AS spot_name,
          COALESCE(SUM(
            CASE WHEN bo.status != '已取消' THEN COALESCE(bo.visitor_count, 1) ELSE 0 END
          ), 0) AS local_booked,
          MAX(
            bs.capacity - bs.booked - COALESCE(SUM(
              CASE WHEN bo.status != '已取消' THEN COALESCE(bo.visitor_count, 1) ELSE 0 END
            ), 0),
            0
          ) AS remaining
        FROM booking_slots bs
        JOIN scenic_spots ss ON ss.id = bs.scenic_spot_id
        LEFT JOIN booking_orders bo ON bo.slot_id = bs.id
        WHERE (? = '' OR bs.scenic_spot_id = ?)
        GROUP BY bs.id
        ORDER BY bs.date ASC, bs.time_range ASC
      `,
    )
    .all(scenicSpotId, scenicSpotId) as SlotRow[]

  return rows.map((row) => ({
    id: row.id,
    scenicSpotId: row.scenic_spot_id,
    date: row.date,
    timeRange: row.time_range,
    capacity: row.capacity,
    booked: row.booked,
    spotName: row.spot_name,
    localBooked: row.local_booked,
    remaining: row.remaining,
  }))
}

const findBookingSlot = (id: string) =>
  db
    .prepare(
      `
        SELECT id, scenic_spot_id AS scenicSpotId, date, time_range AS timeRange, capacity, booked
        FROM booking_slots WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: string
        scenicSpotId: string
        date: string
        timeRange: string
        capacity: number
        booked: number
      }
    | undefined

const countActiveOrdersForSlot = (slotId: string) =>
  (
    db
      .prepare('SELECT COUNT(*) AS count FROM booking_orders WHERE slot_id = ? AND status != ' + "'已取消'")
      .get(slotId) as { count: number }
  ).count

const countActiveOrdersForSpot = (scenicSpotId: string) =>
  (
    db
      .prepare('SELECT COUNT(*) AS count FROM booking_orders WHERE scenic_spot_id = ? AND status != ' + "'已取消'")
      .get(scenicSpotId) as { count: number }
  ).count

const createOrder = (input: z.infer<typeof createOrderSchema>) =>
  db.transaction(() => {
    const slot = db
      .prepare(
        `
          SELECT
            bs.id, bs.scenic_spot_id, bs.date, bs.time_range, bs.capacity, bs.booked,
            ss.name_zh AS spot_name,
            MAX(
              bs.capacity - bs.booked - COALESCE(SUM(
                CASE WHEN bo.status != '已取消' THEN COALESCE(bo.visitor_count, 1) ELSE 0 END
              ), 0),
              0
            ) AS remaining
          FROM booking_slots bs
          JOIN scenic_spots ss ON ss.id = bs.scenic_spot_id
          LEFT JOIN booking_orders bo ON bo.slot_id = bs.id
          WHERE bs.id = ? AND bs.scenic_spot_id = ?
          GROUP BY bs.id
        `,
      )
      .get(input.slotId, input.scenicSpotId) as
      | (Pick<SlotRow, 'id' | 'scenic_spot_id' | 'date' | 'time_range' | 'capacity' | 'booked' | 'spot_name' | 'remaining'>)
      | undefined

    if (!slot) {
      throw new Error('未找到可用入园时段')
    }

    if (slot.remaining < input.visitorCount) {
      throw new Error('当前时段余量不足')
    }

    const now = new Date()
    const localDate = formatLocalDate(now)
    const createdAt = formatLocalDateTime(now)
    const orderId = `HZ-${localDate.split('-').join('')}-${Date.now().toString().slice(-4)}`
    const qrCodeText = `VERIFY-${orderId}`
    const visitors =
      input.visitorCount > 1 ? [input.visitorName.trim(), `同行 ${input.visitorCount - 1} 人`] : [input.visitorName.trim()]
    const ticket = db
      .prepare(
        `
          SELECT price
          FROM ticket_types
          WHERE scenic_spot_id = ? AND name = ?
          LIMIT 1
        `,
      )
      .get(input.scenicSpotId, input.ticketName) as { price: number } | undefined
    const totalAmount = (ticket?.price ?? 0) * input.visitorCount

    db.prepare(
      `
        INSERT INTO booking_orders (
          id, scenic_spot_id, slot_id, ticket_name, visitor_count, payment_method, payment_status, amount, spot_name,
          visit_date, time_range, visitors_json, status, qr_code_text, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待出行', ?, ?)
      `,
    ).run(
      orderId,
      input.scenicSpotId,
      input.slotId,
      input.ticketName,
      input.visitorCount,
      input.paymentMethod,
      totalAmount > 0 ? '支付完成' : '免费预约',
      totalAmount,
      slot.spot_name,
      slot.date,
      slot.time_range,
      JSON.stringify(visitors),
      qrCodeText,
      createdAt,
    )

    return mapOrderRow(db.prepare('SELECT * FROM booking_orders WHERE id = ?').get(orderId) as OrderRow)
  })()

const updateOrderStatus = (id: string, status: OrderStatus) => {
  const info = db.prepare('UPDATE booking_orders SET status = ? WHERE id = ?').run(status, id)
  if (info.changes === 0) return null
  const row = db.prepare('SELECT * FROM booking_orders WHERE id = ?').get(id) as OrderRow | undefined
  return row ? mapOrderRow(row) : null
}

const resetOrders = () => {
  const insertOrder = db.prepare(`
    INSERT INTO booking_orders (
      id, scenic_spot_id, slot_id, ticket_name, visitor_count, payment_method, payment_status, amount, spot_name,
      visit_date, time_range, visitors_json, status, qr_code_text, created_at
    )
    VALUES (
      @id, @scenicSpotId, @slotId, @ticketName, @visitorCount, @paymentMethod, @paymentStatus, @amount, @spotName,
      @visitDate, @timeRange, @visitorsJson, @status, @qrCodeText, @createdAt
    )
  `)

  db.transaction(() => {
    db.prepare('DELETE FROM booking_orders').run()
    seedOrders.forEach((order) => {
      insertOrder.run({
        ...order,
        visitorsJson: JSON.stringify(order.visitors),
      })
    })
  })()
}

const resetDatabase = () => {
  const spotInsert = db.prepare(`
    INSERT OR REPLACE INTO scenic_spots (
      id, name_zh, name_en, area, category, description, address, opening_hours,
      tags_json, reservation_required, paid, featured
    )
    VALUES (@id, @nameZh, @nameEn, @area, @category, @description, @address, @openingHours,
      @tagsJson, @reservationRequired, @paid, @featured)
  `)
  const ticketInsert = db.prepare(`
    INSERT OR REPLACE INTO ticket_types (
      id, scenic_spot_id, name, price, description, available_for
    )
    VALUES (@id, @scenicSpotId, @name, @price, @description, @availableFor)
  `)
  const slotInsert = db.prepare(`
    INSERT OR REPLACE INTO booking_slots (
      id, scenic_spot_id, date, time_range, capacity, booked
    )
    VALUES (@id, @scenicSpotId, @date, @timeRange, @capacity, @booked)
  `)

  db.transaction(() => {
    db.prepare('DELETE FROM booking_orders').run()
    db.prepare('DELETE FROM booking_slots').run()
    db.prepare('DELETE FROM ticket_types').run()
    db.prepare('DELETE FROM scenic_spots').run()

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
  })()

  resetOrders()
}

const generateSlugId = (base: string) => {
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  const suffix = randomUUID().slice(0, 6)
  return slug ? `${slug}-${suffix}` : suffix
}

const generateSlotId = (scenicSpotId: string, date: string, timeRange: string) => {
  const normalized = timeRange.replace(/[^a-z0-9]+/gi, '').toLowerCase()
  return `${scenicSpotId}-${date.split('-').join('')}-${normalized}`
}

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatLocalDateTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${formatLocalDate(date)} ${hours}:${minutes}`
}
