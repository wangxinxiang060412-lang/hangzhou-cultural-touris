import { cityPasses as contentCityPasses } from '../content/cityPasses'
import { cityEvents as contentCityEvents } from '../content/eventsCalendar'
import { neighborhoods as contentNeighborhoods } from '../content/neighborhoods'
import { staticWeather } from '../content/staticWeather'
import type { ThemeJourneyFilter } from '../content/themeJourneys'
import { themeJourneys as contentThemeJourneys } from '../content/themeJourneys'
import type { LocalizedText } from '../i18n/site'
import type {
  BookingOrder,
  BookingOrderStatus,
  BookingPaymentMethod,
} from '../types/booking'
import type { AuditLog, AuthUser, LoginCredentials, RegisterPayload, UserAccount, UserRole, UserStatus } from '../types/security'
import { buildOperationsPayload } from '../utils/operations'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '')

let authToken = ''
export const setAuthToken = (token: string) => { authToken = token }
export const getAuthToken = () => authToken

const remoteJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
  const payload = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) {
    throw new Error(payload.error || `请求失败：${response.status}`)
  }
  return payload as T
}

const jsonBody = (method: 'POST' | 'PUT' | 'PATCH', body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
})

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
  imageUrl: string
  imagePosition: string
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
  longitude: string | number
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

export type ApiUserRole = UserRole
export type ApiUserStatus = UserStatus
export type ApiUserAccount = UserAccount
export type ApiAuditLog = AuditLog

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

export type UserAccountInput = {
  id?: string
  username: string
  displayName: string
  role: ApiUserRole
  status: ApiUserStatus
  phoneMasked: string
  avatarColor?: string
  password?: string
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

export const fetchScenicSpots = () => remoteJson<ApiScenicSpot[]>('/scenic-spots')

export const fetchScenicSpot = (id: string) =>
  remoteJson<ApiScenicSpot>(`/scenic-spots/${encodeURIComponent(id)}`)

export const createScenicSpot = (input: ScenicSpotInput) =>
  remoteJson<ApiScenicSpot>('/scenic-spots', jsonBody('POST', input))

export const updateScenicSpot = (id: string, input: Partial<Omit<ScenicSpotInput, 'id'>>) =>
  remoteJson<ApiScenicSpot>(`/scenic-spots/${encodeURIComponent(id)}`, jsonBody('PUT', input))

export const deleteScenicSpot = (id: string) =>
  remoteJson<{ ok: true }>(`/scenic-spots/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const uploadScenicSpotImage = (input: {
  fileName: string
  mimeType: string
  dataBase64: string
}) => remoteJson<{ imageUrl: string }>('/uploads/scenic-spot-image', jsonBody('POST', input))

export const fetchTicketTypes = (scenicSpotId?: string) => {
  const query = scenicSpotId ? `?scenicSpotId=${encodeURIComponent(scenicSpotId)}` : ''
  return remoteJson<ApiTicketType[]>(`/ticket-types${query}`)
}

export const createTicketType = (input: TicketTypeInput) =>
  remoteJson<ApiTicketType>('/ticket-types', jsonBody('POST', input))

export const updateTicketType = (id: string, input: Partial<Omit<TicketTypeInput, 'id'>>) =>
  remoteJson<ApiTicketType>(`/ticket-types/${encodeURIComponent(id)}`, jsonBody('PUT', input))

export const deleteTicketType = (id: string) =>
  remoteJson<{ ok: true }>(`/ticket-types/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const fetchBookingSlots = (scenicSpotId?: string) => {
  const query = scenicSpotId ? `?scenicSpotId=${encodeURIComponent(scenicSpotId)}` : ''
  return remoteJson<ApiBookingSlot[]>(`/booking-slots${query}`)
}

export const createBookingSlot = (input: BookingSlotInput) =>
  remoteJson<ApiBookingSlot>('/booking-slots', jsonBody('POST', input))

export const updateBookingSlot = (
  id: string,
  input: Partial<Pick<BookingSlotInput, 'date' | 'timeRange' | 'capacity' | 'booked'>>,
) => remoteJson<ApiBookingSlot>(`/booking-slots/${encodeURIComponent(id)}`, jsonBody('PUT', input))

export const deleteBookingSlot = (id: string) =>
  remoteJson<{ ok: true }>(`/booking-slots/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const fetchOrders = () => remoteJson<BookingOrder[]>('/orders')

export const createBookingOrder = (payload: CreateBookingPayload) =>
  remoteJson<BookingOrder>('/orders', jsonBody('POST', payload))

export const updateOrderStatus = (id: string, status: BookingOrderStatus, cancellationReason?: string) =>
  remoteJson<BookingOrder>(
    `/orders/${encodeURIComponent(id)}/status`,
    jsonBody('PATCH', { status, cancellationReason }),
  )

export const deleteOrder = (id: string) =>
  remoteJson<{ ok: true }>(`/orders/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const fetchUserAccounts = () => remoteJson<ApiUserAccount[]>('/users')

export const createUserAccount = (input: UserAccountInput) =>
  remoteJson<ApiUserAccount>('/users', jsonBody('POST', input))

export const updateUserAccount = (id: string, input: Partial<Omit<UserAccountInput, 'id'>>) =>
  remoteJson<ApiUserAccount>(`/users/${encodeURIComponent(id)}`, jsonBody('PUT', input))

export const deleteUserAccount = (id: string) =>
  remoteJson<{ ok: true }>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const fetchAuditLogs = () => remoteJson<ApiAuditLog[]>('/audit-logs')

export const resetOrders = () => remoteJson<{ ok: true }>('/reset/orders', { method: 'POST' })

export const resetDatabase = () => remoteJson<{ ok: true }>('/reset/database', { method: 'POST' })

export const fetchCityPasses = () => Promise.resolve(contentCityPasses as ApiCityPass[])
export const fetchNeighborhoods = () => Promise.resolve(contentNeighborhoods as ApiNeighborhood[])
export const fetchCityEvents = () => Promise.resolve(contentCityEvents as ApiCityEvent[])
export const fetchThemeJourneys = () => Promise.resolve(contentThemeJourneys as ApiThemeJourney[])

export const fetchHangzhouWeather = (force = false) => {
  const query = force ? '?force=1' : ''
  return remoteJson<ApiHangzhouWeather>(`/weather/hangzhou${query}`)
}

export const fetchOperations = async () => {
  const [spots, slots, weather] = await Promise.all([
    fetchScenicSpots(),
    fetchBookingSlots(),
    fetchHangzhouWeather().catch(() => staticWeather),
  ])
  const payload = buildOperationsPayload(
    spots.map((spot) => ({
      id: spot.id,
      nameZh: spot.nameZh,
      nameEn: spot.nameEn,
      featured: spot.featured,
    })),
    slots.map((slot) => ({
      scenicSpotId: slot.scenicSpotId,
      date: slot.date,
      timeRange: slot.timeRange,
      capacity: slot.capacity,
      remaining: slot.remaining,
    })),
    weather,
  )
  return payload as ApiOperationsPayload
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
  return Promise.resolve(profile)
}

export const saveTravelerProfile = (_id: string, profile: ApiTravelerProfile) => Promise.resolve(profile)

export type LoginResponse = { token: string; user: AuthUser }

export const loginUser = (credentials: LoginCredentials) =>
  remoteJson<LoginResponse>('/auth/login', jsonBody('POST', credentials))

export const registerUser = (payload: RegisterPayload) =>
  remoteJson<LoginResponse>('/auth/register', jsonBody('POST', payload))

export const fetchCurrentUser = () =>
  remoteJson<AuthUser>('/auth/me')

export const logoutUser = () =>
  remoteJson<{ ok: true }>('/auth/logout', { method: 'POST' })
