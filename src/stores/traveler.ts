import { computed, ref, watch } from 'vue'
import { fetchTravelerProfile, saveTravelerProfile } from '../services/api'
import type { ApiTravelerProfile, ApiTravelerSpotState, ApiTravelerTripItem } from '../services/api'

const STORAGE_KEY = 'hangzhou-traveler-profile-id'

const createTravelerId = () =>
  `traveler-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`

const nowIso = () => new Date().toISOString()

const defaultProfile = (id: string): ApiTravelerProfile => {
  const timestamp = nowIso()
  return {
    id,
    displayName: '杭州旅人',
    spotStates: {},
    tripItems: [],
    searchHistory: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

const readStoredProfileId = () => {
  if (typeof window === 'undefined') return createTravelerId()
  const existing = window.localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const next = createTravelerId()
  window.localStorage.setItem(STORAGE_KEY, next)
  return next
}

export const travelerProfile = ref<ApiTravelerProfile>(defaultProfile(readStoredProfileId()))
export const travelerProfileLoading = ref(false)
export const travelerProfileError = ref('')
export const travelerProfileSyncState = ref<'idle' | 'syncing' | 'synced' | 'error'>('idle')

let loadPromise: Promise<ApiTravelerProfile> | null = null
let writeTimer = 0

const setProfile = (next: ApiTravelerProfile) => {
  travelerProfile.value = next
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, next.id)
  }
}

export const ensureTravelerProfile = async () => {
  if (loadPromise) return loadPromise

  travelerProfileLoading.value = true
  travelerProfileError.value = ''
  loadPromise = fetchTravelerProfile(travelerProfile.value.id)
    .then((remote) => {
      setProfile(remote)
      travelerProfileSyncState.value = 'synced'
      return remote
    })
    .catch(() => {
      travelerProfileSyncState.value = 'idle'
      return travelerProfile.value
    })
    .finally(() => {
      travelerProfileLoading.value = false
      loadPromise = null
    })

  return loadPromise
}

export const syncTravelerProfile = async () => {
  try {
    travelerProfileSyncState.value = 'syncing'
    const saved = await saveTravelerProfile(travelerProfile.value.id, travelerProfile.value)
    setProfile(saved)
    travelerProfileSyncState.value = 'synced'
    return saved
  } catch (error) {
    travelerProfileError.value = error instanceof Error ? error.message : '旅行档案同步失败'
    travelerProfileSyncState.value = 'error'
    throw error
  }
}

const scheduleSync = () => {
  if (typeof window === 'undefined') return
  window.clearTimeout(writeTimer)
  writeTimer = window.setTimeout(() => {
    void syncTravelerProfile()
  }, 500)
}

const updateSpotState = (
  scenicSpotId: string,
  updater: (current: ApiTravelerSpotState | undefined) => ApiTravelerSpotState | null,
) => {
  const current = travelerProfile.value.spotStates[scenicSpotId]
  const next = updater(current)
  const spotStates = { ...travelerProfile.value.spotStates }
  if (next) {
    spotStates[scenicSpotId] = next
  } else {
    delete spotStates[scenicSpotId]
  }
  travelerProfile.value = {
    ...travelerProfile.value,
    spotStates,
    updatedAt: nowIso(),
  }
  scheduleSync()
}

export const renameTravelerProfile = (displayName: string) => {
  travelerProfile.value = {
    ...travelerProfile.value,
    displayName: displayName.trim() || undefined,
    updatedAt: nowIso(),
  }
  scheduleSync()
}

export const loadTravelerProfileById = async (id: string) => {
  const remote = await fetchTravelerProfile(id)
  setProfile(remote)
  travelerProfileSyncState.value = 'synced'
  return remote
}

export const markSpotViewed = (scenicSpotId: string) => {
  updateSpotState(scenicSpotId, (current) => ({
    favorite: current?.favorite ?? false,
    status: current?.status ?? null,
    lastViewedAt: nowIso(),
    updatedAt: nowIso(),
  }))
}

export const toggleFavoriteSpot = (scenicSpotId: string) => {
  updateSpotState(scenicSpotId, (current) => {
    const favorite = !(current?.favorite ?? false)
    if (!favorite && !current?.status && !current?.lastViewedAt) {
      return null
    }
    return {
      favorite,
      status: current?.status ?? null,
      lastViewedAt: current?.lastViewedAt,
      updatedAt: nowIso(),
    }
  })
}

export const setSpotTravelStatus = (scenicSpotId: string, status: 'wish' | 'visited' | null) => {
  updateSpotState(scenicSpotId, (current) => {
    if (!status && !(current?.favorite ?? false) && !current?.lastViewedAt) {
      return null
    }
    return {
      favorite: current?.favorite ?? false,
      status,
      lastViewedAt: current?.lastViewedAt,
      updatedAt: nowIso(),
    }
  })
}

export const addTripItem = (item: Omit<ApiTravelerTripItem, 'id' | 'createdAt'>) => {
  const nextItem: ApiTravelerTripItem = {
    id: `trip-${Math.random().toString(36).slice(2, 8)}`,
    ...item,
    createdAt: nowIso(),
  }
  travelerProfile.value = {
    ...travelerProfile.value,
    tripItems: [...travelerProfile.value.tripItems, nextItem],
    updatedAt: nowIso(),
  }
  scheduleSync()
}

export const updateTripItem = (id: string, patch: Partial<Omit<ApiTravelerTripItem, 'id' | 'createdAt'>>) => {
  travelerProfile.value = {
    ...travelerProfile.value,
    tripItems: travelerProfile.value.tripItems.map((item) =>
      item.id === id
        ? {
            ...item,
            ...patch,
          }
        : item,
    ),
    updatedAt: nowIso(),
  }
  scheduleSync()
}

export const removeTripItem = (id: string) => {
  travelerProfile.value = {
    ...travelerProfile.value,
    tripItems: travelerProfile.value.tripItems.filter((item) => item.id !== id),
    updatedAt: nowIso(),
  }
  scheduleSync()
}

export const reorderTripItems = (draggedId: string, targetId: string) => {
  const current = [...travelerProfile.value.tripItems]
  const fromIndex = current.findIndex((item) => item.id === draggedId)
  const toIndex = current.findIndex((item) => item.id === targetId)
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
  const [dragged] = current.splice(fromIndex, 1)
  current.splice(toIndex, 0, dragged)
  travelerProfile.value = {
    ...travelerProfile.value,
    tripItems: current,
    updatedAt: nowIso(),
  }
  scheduleSync()
}

export const pushSearchHistory = (query: string) => {
  const normalized = query.trim()
  if (!normalized) return
  const next = [normalized, ...travelerProfile.value.searchHistory.filter((item) => item !== normalized)].slice(0, 12)
  travelerProfile.value = {
    ...travelerProfile.value,
    searchHistory: next,
    updatedAt: nowIso(),
  }
  scheduleSync()
}

export const favoriteSpotIds = computed(() =>
  Object.entries(travelerProfile.value.spotStates)
    .filter(([, state]) => state.favorite)
    .map(([spotId]) => spotId),
)

export const wishedSpotIds = computed(() =>
  Object.entries(travelerProfile.value.spotStates)
    .filter(([, state]) => state.status === 'wish')
    .map(([spotId]) => spotId),
)

export const visitedSpotIds = computed(() =>
  Object.entries(travelerProfile.value.spotStates)
    .filter(([, state]) => state.status === 'visited')
    .map(([spotId]) => spotId),
)

export const recentlyViewedSpotIds = computed(() =>
  Object.entries(travelerProfile.value.spotStates)
    .filter(([, state]) => Boolean(state.lastViewedAt))
    .sort((a, b) => (b[1].lastViewedAt ?? '').localeCompare(a[1].lastViewedAt ?? ''))
    .map(([spotId]) => spotId)
    .slice(0, 6),
)

watch(
  () => travelerProfile.value.id,
  () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, travelerProfile.value.id)
    }
  },
)
