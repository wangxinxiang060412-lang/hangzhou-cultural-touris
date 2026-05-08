import type {
  BookingOrder,
  BookingOrderStatus,
  BookingPaymentMethod,
} from '../data/mockOrders'
import type { ThemeJourneyFilter } from '../data/themeJourneys'
import type { LocalizedText } from '../i18n/site'

export type ApiScenicSpot = {
  id: string
  nameZh: string
  nameEn: string
  area: string
  category: string
  description: string
  address: string
  openingHours: string
  tags: string[]
  reservationRequired: boolean
  paid: boolean
  featured: boolean
}

export type ApiTicketType = {
  id: string
  scenicSpotId: string
  name: string
  price: number
  description: string
  availableFor: string
}

export type ApiCityPass = {
  id: string
  name: LocalizedText
  shortLabel: LocalizedText
  description: LocalizedText
  duration: LocalizedText
  suitableFor: LocalizedText
  transportNote: LocalizedText
  activationNote: LocalizedText
  routeNote: LocalizedText
  price: number
  marketPrice: number
  primarySpotId: string
  coverSpotId: string
  suggestedRouteId?: string
  includedSpotIds: string[]
  includedBenefits: LocalizedText[]
  serviceHighlights: LocalizedText[]
}

export type ApiBookingSlot = {
  id: string
  scenicSpotId: string
  date: string
  timeRange: string
  capacity: number
  booked: number
  spotName: string
  localBooked: number
  remaining: number
}

export type ApiHangzhouWeather = {
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

export type ApiOperationTone = 'normal' | 'watch' | 'limited' | 'closed'

export type ApiOperationNotice = {
  id: string
  spotId?: string
  tone: ApiOperationTone
  tag: LocalizedText
  title: LocalizedText
  detail: LocalizedText
}

export type ApiSpotOperationStatus = {
  spotId: string
  openTone: ApiOperationTone
  openLabel: LocalizedText
  openDetail: LocalizedText
  crowdTone: ApiOperationTone
  crowdLabel: LocalizedText
  crowdDetail: LocalizedText
  highlight: LocalizedText
  alerts: ApiOperationNotice[]
}

export type ApiOperationServiceCard = {
  id: string
  label: LocalizedText
  value: string
  detail: LocalizedText
  href?: string
}

export type ApiOperationsPayload = {
  syncedAt: string
  spotStatuses: Record<string, ApiSpotOperationStatus>
  featuredAlerts: ApiOperationNotice[]
  serviceCards: ApiOperationServiceCard[]
}

export type ApiTravelerTripItem = {
  id: string
  scenicSpotId: string
  cityPassId?: string
  dateLabel?: string
  timeLabel?: string
  note?: string
  createdAt: string
}

export type ApiTravelerSpotState = {
  favorite: boolean
  status: 'wish' | 'visited' | null
  lastViewedAt?: string
  updatedAt: string
}

export type ApiTravelerProfile = {
  id: string
  displayName?: string
  spotStates: Record<string, ApiTravelerSpotState>
  tripItems: ApiTravelerTripItem[]
  searchHistory: string[]
  createdAt: string
  updatedAt: string
}

export type ApiNeighborhood = {
  id: string
  name: LocalizedText
  nameEn: string
  district: LocalizedText
  theme: LocalizedText
  description: LocalizedText
  moodLine: LocalizedText
  bestArrival: LocalizedText
  foodHint: LocalizedText
  walkingHint: LocalizedText
  bestFor: LocalizedText[]
  highlights: LocalizedText[]
  leadSpotId: string
  featuredSpotIds: string[]
  suggestedRouteId?: string
  suggestedPassId?: string
}

export type ApiCityEvent = {
  id: string
  name: LocalizedText
  nameEn: string
  category: LocalizedText
  monthLabel: LocalizedText
  district: LocalizedText
  description: LocalizedText
  bestFor: LocalizedText
  bookingAlert: LocalizedText
  weatherPlan: LocalizedText
  statusNote: LocalizedText
  relatedNeighborhoodId?: string
  relatedSpotIds: string[]
  leadSpotId: string
}

export type ApiThemeJourney = {
  id: string
  title: LocalizedText
  titleEn: string
  duration: LocalizedText
  audience: LocalizedText
  summary: LocalizedText
  filters: ThemeJourneyFilter[]
  neighborhoodIds: string[]
  routeIds: string[]
  spotIds: string[]
  cityPassId?: string
  accessibilityNote: LocalizedText
  rainyPlan: LocalizedText
  dayPlans: Array<{
    label: LocalizedText
    plan: LocalizedText
  }>
}

export type ScenicSpotInput = Omit<ApiScenicSpot, 'id'> & { id?: string }
export type TicketTypeInput = Omit<ApiTicketType, 'id'> & { id?: string }
export type BookingSlotInput = {
  id?: string
  scenicSpotId: string
  date: string
  timeRange: string
  capacity: number
  booked?: number
}

export type CreateBookingPayload = {
  scenicSpotId: string
  slotId: string
  ticketName?: string
  cityPassId?: string
  paymentMethod: BookingPaymentMethod
  visitorName: string
  visitorPhone: string
  visitorEmail?: string
  visitorIdNumber: string
  visitorCount: number
}

/* ------------------------------------------------------------------ */
/*  静态数据导入                                                        */
/* ------------------------------------------------------------------ */

import { scenicSpotsSeed } from '../data/scenicSpots'
import { ticketTypes as seedTicketTypes } from '../data/ticketTypes'
import { bookingSlots as seedBookingSlots } from '../data/bookingSlots'
import { cityPasses as seedCityPasses } from '../data/cityPasses'
import { neighborhoods as seedNeighborhoods } from '../data/neighborhoods'
import { cityEvents as seedCityEvents } from '../data/eventsCalendar'
import { themeJourneys as seedThemeJourneys } from '../data/themeJourneys'
import { mockOrders } from '../data/mockOrders'
import { staticWeather } from '../data/staticWeather'
import { buildOperationsPayload } from '../utils/operations'

/* ------------------------------------------------------------------ */
/*  内存数据存储（模拟后端状态）                                          */
/* ------------------------------------------------------------------ */

const ORDERS_STORAGE_KEY = 'hangzhou-static-orders'

const loadOrdersFromStorage = (): BookingOrder[] => {
  if (typeof window === 'undefined') return [...mockOrders]
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as BookingOrder[]
  } catch { /* ignore */ }
  return [...mockOrders]
}

const saveOrdersToStorage = (orders: BookingOrder[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch { /* ignore */ }
}

let inMemoryOrders: BookingOrder[] = loadOrdersFromStorage()

/* ------------------------------------------------------------------ */
/*  将种子数据转换为 API 类型                                            */
/* ------------------------------------------------------------------ */

const toApiScenicSpot = (seed: (typeof scenicSpotsSeed)[number]): ApiScenicSpot => ({
  id: seed.id,
  nameZh: seed.nameZh,
  nameEn: seed.nameEn,
  area: seed.area,
  category: seed.category,
  description: seed.description,
  address: seed.address,
  openingHours: seed.openingHours,
  tags: seed.tags,
  reservationRequired: seed.reservationRequired,
  paid: seed.paid,
  featured: seed.featured,
})

const spotNameMap = Object.fromEntries(
  scenicSpotsSeed.map((spot) => [spot.id, spot.nameZh]),
)

const toApiBookingSlot = (seed: (typeof seedBookingSlots)[number]): ApiBookingSlot => ({
  id: seed.id,
  scenicSpotId: seed.scenicSpotId,
  date: seed.date,
  timeRange: seed.timeRange,
  capacity: seed.capacity,
  booked: seed.booked,
  spotName: spotNameMap[seed.scenicSpotId] ?? '',
  localBooked: 0,
  remaining: Math.max(seed.capacity - seed.booked, 0),
})

/* ------------------------------------------------------------------ */
/*  静态 API 函数 — 保持原有签名不变                                      */
/* ------------------------------------------------------------------ */

const delay = <T>(value: T): Promise<T> => Promise.resolve(value)

export const fetchScenicSpots = () =>
  delay(scenicSpotsSeed.map(toApiScenicSpot))

export const fetchScenicSpot = (id: string) => {
  const spot = scenicSpotsSeed.find((s) => s.id === id)
  if (!spot) return Promise.reject(new Error('景点不存在'))
  return delay(toApiScenicSpot(spot))
}

export const createScenicSpot = (input: ScenicSpotInput) =>
  delay({ ...input, id: input.id ?? `spot-${Date.now()}` } as ApiScenicSpot)

export const updateScenicSpot = (id: string, input: Partial<Omit<ScenicSpotInput, 'id'>>) => {
  const spot = scenicSpotsSeed.find((s) => s.id === id)
  if (!spot) return Promise.reject(new Error('景点不存在'))
  return delay({ ...toApiScenicSpot(spot), ...input } as ApiScenicSpot)
}

export const deleteScenicSpot = (_id: string) => delay({ ok: true as const })

export const fetchTicketTypes = (scenicSpotId?: string) => {
  const filtered = scenicSpotId
    ? seedTicketTypes.filter((t) => t.scenicSpotId === scenicSpotId)
    : seedTicketTypes
  return delay(filtered as ApiTicketType[])
}

export const fetchCityPasses = () => delay(seedCityPasses as ApiCityPass[])
export const fetchNeighborhoods = () => delay(seedNeighborhoods as ApiNeighborhood[])
export const fetchCityEvents = () => delay(seedCityEvents as ApiCityEvent[])
export const fetchThemeJourneys = () => delay(seedThemeJourneys as ApiThemeJourney[])

export const createTicketType = (input: TicketTypeInput) =>
  delay({ ...input, id: input.id ?? `ticket-${Date.now()}` } as ApiTicketType)

export const updateTicketType = (id: string, input: Partial<Omit<TicketTypeInput, 'id'>>) => {
  const ticket = seedTicketTypes.find((t) => t.id === id)
  if (!ticket) return Promise.reject(new Error('票种不存在'))
  return delay({ ...ticket, ...input } as ApiTicketType)
}

export const deleteTicketType = (_id: string) => delay({ ok: true as const })

export const fetchBookingSlots = (scenicSpotId?: string) => {
  const all = seedBookingSlots.map(toApiBookingSlot)
  const filtered = scenicSpotId ? all.filter((s) => s.scenicSpotId === scenicSpotId) : all
  return delay(filtered)
}

export const fetchHangzhouWeather = () =>
  delay({ ...staticWeather, syncedAt: new Date().toISOString() })

export const fetchOperations = () => {
  const spots = scenicSpotsSeed.map((s) => ({
    id: s.id,
    nameZh: s.nameZh,
    nameEn: s.nameEn,
    featured: s.featured,
  }))
  const slots = seedBookingSlots.map((s) => ({
    scenicSpotId: s.scenicSpotId,
    date: s.date,
    timeRange: s.timeRange,
    capacity: s.capacity,
    remaining: Math.max(s.capacity - s.booked, 0),
  }))
  const payload = buildOperationsPayload(spots, slots, staticWeather)
  return delay(payload as ApiOperationsPayload)
}

export const fetchTravelerProfile = (id: string) => {
  const timestamp = new Date().toISOString()
  const profile: ApiTravelerProfile = {
    id,
    displayName: '杭州旅人',
    spotStates: {},
    tripItems: [],
    searchHistory: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  return delay(profile)
}

export const saveTravelerProfile = (_id: string, profile: ApiTravelerProfile) =>
  delay(profile)

export const createBookingSlot = (input: BookingSlotInput) =>
  delay({
    ...input,
    id: input.id ?? `slot-${Date.now()}`,
    booked: input.booked ?? 0,
    spotName: spotNameMap[input.scenicSpotId] ?? '',
    localBooked: 0,
    remaining: (input.capacity) - (input.booked ?? 0),
  } as ApiBookingSlot)

export const updateBookingSlot = (
  id: string,
  input: Partial<Pick<BookingSlotInput, 'date' | 'timeRange' | 'capacity' | 'booked'>>,
) => {
  const slot = seedBookingSlots.find((s) => s.id === id)
  if (!slot) return Promise.reject(new Error('时段不存在'))
  const merged = { ...slot, ...input }
  return delay(toApiBookingSlot(merged))
}

export const deleteBookingSlot = (_id: string) => delay({ ok: true as const })

export const fetchOrders = () => delay(inMemoryOrders)

export const createBookingOrder = (payload: CreateBookingPayload) => {
  const spot = scenicSpotsSeed.find((s) => s.id === payload.scenicSpotId)
  const slot = seedBookingSlots.find((s) => s.id === payload.slotId)
  const now = new Date()
  const orderId = `HZ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

  const order: BookingOrder = {
    id: orderId,
    scenicSpotId: payload.scenicSpotId,
    slotId: payload.slotId,
    cityPassId: payload.cityPassId,
    ticketName: payload.ticketName,
    spotName: spot?.nameZh ?? '',
    visitDate: slot?.date ?? '',
    timeRange: slot?.timeRange ?? '',
    visitors: [payload.visitorName],
    status: '待出行',
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'free' ? '免费预约' : '支付完成',
    amount: 0,
    visitorCount: payload.visitorCount,
    qrCodeText: `VERIFY-${orderId}`,
    createdAt: now.toISOString(),
    contactPhone: payload.visitorPhone,
    contactEmail: payload.visitorEmail,
    maskedIdNumber: payload.visitorIdNumber.replace(/.(?=.{4})/g, '*'),
    voucherChannels: ['sms', 'email'],
    refundStatus: '无需退款',
    supportHotline: '12301',
    supportEmail: 'tickets@hangzhou.example.gov.cn',
    appealStatus: '可发起',
    invoiceStatus: '可申请',
  }

  inMemoryOrders = [order, ...inMemoryOrders]
  saveOrdersToStorage(inMemoryOrders)
  return delay(order)
}

export const updateOrderStatus = (id: string, status: BookingOrderStatus, cancellationReason?: string) => {
  const idx = inMemoryOrders.findIndex((o) => o.id === id)
  if (idx < 0) return Promise.reject(new Error('订单不存在'))

  const updated = {
    ...inMemoryOrders[idx],
    status,
    ...(cancellationReason ? { cancellationReason } : {}),
    ...(status === '已取消' ? {
      refundStatus: inMemoryOrders[idx].amount && inMemoryOrders[idx].amount! > 0 ? '待处理' as const : '无需退款' as const,
    } : {}),
  }
  inMemoryOrders = inMemoryOrders.map((o, i) => (i === idx ? updated : o))
  saveOrdersToStorage(inMemoryOrders)
  return delay(updated)
}

export const deleteOrder = (id: string) => {
  inMemoryOrders = inMemoryOrders.filter((o) => o.id !== id)
  saveOrdersToStorage(inMemoryOrders)
  return delay({ ok: true as const })
}

export const resetOrders = () => {
  inMemoryOrders = [...mockOrders]
  saveOrdersToStorage(inMemoryOrders)
  return delay({ ok: true as const })
}

export const resetDatabase = () => {
  inMemoryOrders = [...mockOrders]
  saveOrdersToStorage(inMemoryOrders)
  return delay({ ok: true as const })
}
