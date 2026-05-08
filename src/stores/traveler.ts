import { computed, ref, watch } from 'vue'
import type { ApiTravelerProfile, ApiTravelerSpotState, ApiTravelerTripItem } from '../services/api'

const STORAGE_KEY = 'hangzhou-traveler-profile-id'
const PROFILE_STORAGE_KEY = 'hangzhou-traveler-profile-data'

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

const loadProfileFromStorage = (): ApiTravelerProfile => {
  const id = readStoredProfileId()
  if (typeof window === 'undefined') return defaultProfile(id)
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ApiTravelerProfile
      if (parsed.id) return parsed
    }
  } catch { /* ignore */ }
  return defaultProfile(id)
}

const saveProfileToStorage = (profile: ApiTravelerProfile) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, profile.id)
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch { /* ignore */ }
}

export const travelerProfile = ref<ApiTravelerProfile>(loadProfileFromStorage())
export const travelerProfileLoading = ref(false)
export const travelerProfileError = ref('')
export const travelerProfileSyncState = ref<'idle' | 'syncing' | 'synced' | 'error'>('synced')

const setProfile = (next: ApiTravelerProfile) => {
  travelerProfile.value = next
  saveProfileToStorage(next)
}

export const ensureTravelerProfile = async () => {
  // 纯前端模式：直接从 localStorage 加载，无需服务端同步
  travelerProfileSyncState.value = 'synced'
  return travelerProfile.value
}

export const syncTravelerProfile = async () => {
  // 纯前端模式：保存到 localStorage
  saveProfileToStorage(travelerProfile.value)
  travelerProfileSyncState.value = 'synced'
  return travelerProfile.value
}

const scheduleSync = () => {
  // 纯前端模式：直接保存到 localStorage，不需要延迟
  saveProfileToStorage(travelerProfile.value)
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
  // 纯前端模式：创建新的默认 profile
  const profile = defaultProfile(id)
  setProfile(profile)
  travelerProfileSyncState.value = 'synced'
  return profile
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
