import { computed, ref } from 'vue'
import {
  fetchBookingSlots,
  fetchCityPasses,
  fetchOrders,
  fetchScenicSpots,
  fetchTicketTypes,
} from '../services/api'
import type { ApiBookingSlot, ApiCityPass, ApiScenicSpot, ApiTicketType } from '../services/api'
import type { BookingOrder } from '../data/mockOrders'

export const scenicSpots = ref<ApiScenicSpot[]>([])
export const ticketTypes = ref<ApiTicketType[]>([])
export const bookingSlots = ref<ApiBookingSlot[]>([])
export const cityPasses = ref<ApiCityPass[]>([])
export const orders = ref<BookingOrder[]>([])
export const catalogError = ref('')
export const catalogLoaded = ref(false)

export const featuredScenicSpots = computed(() => scenicSpots.value.filter((spot) => spot.featured))

const runPromise = async <T>(promise: Promise<T>, onSuccess: (value: T) => void) => {
  try {
    const value = await promise
    onSuccess(value)
    return true
  } catch (error) {
    catalogError.value = error instanceof Error ? error.message : '数据加载失败'
    return false
  }
}

export const refreshScenicSpots = () =>
  runPromise(fetchScenicSpots(), (value) => {
    scenicSpots.value = value
  })

export const refreshTicketTypes = () =>
  runPromise(fetchTicketTypes(), (value) => {
    ticketTypes.value = value
  })

export const refreshCityPasses = () =>
  runPromise(fetchCityPasses(), (value) => {
    cityPasses.value = value
  })

export const refreshBookingSlots = () =>
  runPromise(fetchBookingSlots(), (value) => {
    bookingSlots.value = value
  })

export const refreshOrders = () =>
  runPromise(fetchOrders(), (value) => {
    orders.value = value
  })

export const refreshCatalog = async () => {
  catalogError.value = ''
  await Promise.all([
    refreshScenicSpots(),
    refreshTicketTypes(),
    refreshBookingSlots(),
    refreshCityPasses(),
  ])
  catalogLoaded.value = true
}

export const refreshAll = async () => {
  catalogError.value = ''
  await Promise.all([
    refreshScenicSpots(),
    refreshTicketTypes(),
    refreshBookingSlots(),
    refreshCityPasses(),
    refreshOrders(),
  ])
  catalogLoaded.value = true
}

let initialLoadPromise: Promise<void> | null = null

export const ensureCatalog = () => {
  if (!initialLoadPromise) {
    initialLoadPromise = refreshCatalog()
  }
  return initialLoadPromise
}

export const findScenicSpot = (id: string) => scenicSpots.value.find((spot) => spot.id === id)
