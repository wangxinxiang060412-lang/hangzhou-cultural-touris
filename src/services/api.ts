import type {
  BookingOrder,
  BookingOrderStatus,
  BookingPaymentMethod,
} from '../data/mockOrders'

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
  ticketName: string
  paymentMethod: BookingPaymentMethod
  visitorName: string
  visitorPhone: string
  visitorIdNumber: string
  visitorCount: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
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

export const updateOrderStatus = (id: string, status: BookingOrderStatus) =>
  request<BookingOrder>(`/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const deleteOrder = (id: string) =>
  request<{ ok: true }>(`/orders/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const resetOrders = () =>
  request<{ ok: true }>('/admin/reset-orders', { method: 'POST' })

export const resetDatabase = () =>
  request<{ ok: true }>('/admin/reset-database', { method: 'POST' })
