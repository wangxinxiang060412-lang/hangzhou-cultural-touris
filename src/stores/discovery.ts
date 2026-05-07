import { ref } from 'vue'
import {
  fetchCityEvents,
  fetchNeighborhoods,
  fetchThemeJourneys,
} from '../services/api'
import type { ApiCityEvent, ApiNeighborhood, ApiThemeJourney } from '../services/api'

export const neighborhoods = ref<ApiNeighborhood[]>([])
export const cityEvents = ref<ApiCityEvent[]>([])
export const themeJourneys = ref<ApiThemeJourney[]>([])
export const discoveryError = ref('')
export const discoveryLoaded = ref(false)

const runPromise = async <T>(promise: Promise<T>, onSuccess: (value: T) => void) => {
  try {
    const value = await promise
    onSuccess(value)
    return true
  } catch (error) {
    discoveryError.value = error instanceof Error ? error.message : '发现内容加载失败'
    return false
  }
}

export const refreshDiscovery = async () => {
  discoveryError.value = ''
  await Promise.all([
    runPromise(fetchNeighborhoods(), (value) => {
      neighborhoods.value = value
    }),
    runPromise(fetchCityEvents(), (value) => {
      cityEvents.value = value
    }),
    runPromise(fetchThemeJourneys(), (value) => {
      themeJourneys.value = value
    }),
  ])
  discoveryLoaded.value = true
}

let initialDiscoveryPromise: Promise<void> | null = null

export const ensureDiscovery = () => {
  if (!initialDiscoveryPromise) {
    initialDiscoveryPromise = refreshDiscovery()
  }
  return initialDiscoveryPromise
}
