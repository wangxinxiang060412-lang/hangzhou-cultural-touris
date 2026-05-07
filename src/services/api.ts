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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN ?? ''

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (ADMIN_TOKEN && !headers.has('x-admin-token')) {
    headers.set('x-admin-token', ADMIN_TOKEN)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `API request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const fetchScenicSpots = () => request<ApiScenicSpot[]>('/scenic-spots')

export const fetchScenicSpot = (id: string) =>
  request<ApiScenicSpot>(`/scenic-spots/${encodeURIComponent(id)}`)

export const createScenicSpot = (input: ScenicSpotInput) =>
  request<ApiScenicSpot>('/scenic-spots', { method: 'POST', body: JSON.stringify(input) })

export const updateScenicSpot = (id: string, input: Partial<Omit<ScenicSpotInput, 'id'>>) =>
  request<ApiScenicSpot>(`/scenic-spots/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

export const deleteScenicSpot = (id: string) =>
  request<{ ok: true }>(`/scenic-spots/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const fetchTicketTypes = (scenicSpotId?: string) => {
  const query = scenicSpotId ? `?scenicSpotId=${encodeURIComponent(scenicSpotId)}` : ''
  return request<ApiTicketType[]>(`/ticket-types${query}`)
}

export const fetchCityPasses = () => request<ApiCityPass[]>('/city-passes')
export const fetchNeighborhoods = () => request<ApiNeighborhood[]>('/neighborhoods')
export const fetchCityEvents = () => request<ApiCityEvent[]>('/events')
export const fetchThemeJourneys = () => request<ApiThemeJourney[]>('/theme-journeys')

export const createTicketType = (input: TicketTypeInput) =>
  request<ApiTicketType>('/ticket-types', { method: 'POST', body: JSON.stringify(input) })

export const updateTicketType = (id: string, input: Partial<Omit<TicketTypeInput, 'id'>>) =>
  request<ApiTicketType>(`/ticket-types/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

export const deleteTicketType = (id: string) =>
  request<{ ok: true }>(`/ticket-types/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const fetchBookingSlots = (scenicSpotId?: string) => {
  const query = scenicSpotId ? `?scenicSpotId=${encodeURIComponent(scenicSpotId)}` : ''
  return request<ApiBookingSlot[]>(`/booking-slots${query}`)
}

export const fetchHangzhouWeather = () => request<ApiHangzhouWeather>('/weather/hangzhou')

export const fetchOperations = () => request<ApiOperationsPayload>('/operations/hangzhou')

export const fetchTravelerProfile = (id: string) =>
  request<ApiTravelerProfile>(`/traveler-profiles/${encodeURIComponent(id)}`)

export const saveTravelerProfile = (id: string, profile: ApiTravelerProfile) =>
  request<ApiTravelerProfile>(`/traveler-profiles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(profile),
  })

export const createBookingSlot = (input: BookingSlotInput) =>
  request<ApiBookingSlot>('/booking-slots', { method: 'POST', body: JSON.stringify(input) })

export const updateBookingSlot = (
  id: string,
  input: Partial<Pick<BookingSlotInput, 'date' | 'timeRange' | 'capacity' | 'booked'>>,
) =>
  request<ApiBookingSlot>(`/booking-slots/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

export const deleteBookingSlot = (id: string) =>
  request<{ ok: true }>(`/booking-slots/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const fetchOrders = () => request<BookingOrder[]>('/orders')

export const createBookingOrder = (payload: CreateBookingPayload) =>
  request<BookingOrder>('/orders', { method: 'POST', body: JSON.stringify(payload) })

export const updateOrderStatus = (id: string, status: BookingOrderStatus, cancellationReason?: string) =>
  request<BookingOrder>(`/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, cancellationReason }),
  })

export const deleteOrder = (id: string) =>
  request<{ ok: true }>(`/orders/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const resetOrders = () =>
  request<{ ok: true }>('/admin/reset-orders', { method: 'POST' })

export const resetDatabase = () =>
  request<{ ok: true }>('/admin/reset-database', { method: 'POST' })
