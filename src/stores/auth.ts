import { computed, ref } from 'vue'
import type { AuthUser } from '../types/security'
import {
  fetchCurrentUser,
  loginUser,
  logoutUser as apiLogout,
  registerUser,
  setAuthToken,
} from '../services/api'

const STORAGE_KEY = 'hz-auth-token'

export const currentUser = ref<AuthUser | null>(null)
export const authLoading = ref(false)
export const authError = ref('')

export const isLoggedIn = computed(() => currentUser.value !== null)
export const isAdmin = computed(() => currentUser.value?.role === '管理员')
export const loginModalOpen = ref(false)
export const authReady = ref(false)
export const pendingAuthRedirect = ref<string | null>(null)

export const userInitial = computed(() => {
  const name = currentUser.value?.displayName || ''
  return name.charAt(0) || '?'
})

export const userAvatarColor = computed(() => {
  if (currentUser.value?.avatarColor) return currentUser.value.avatarColor
  // Fallback: generate from username
  const username = currentUser.value?.username || 'u'
  let hash = 0
  for (const c of username) hash = (hash * 31 + c.charCodeAt(0)) >>> 0
  const hue = hash % 360
  return `hsl(${hue}, 35%, 42%)`
})

export const openLoginModal = (redirectTo?: string) => {
  authError.value = ''
  pendingAuthRedirect.value = redirectTo ?? null
  loginModalOpen.value = true
}

export const closeLoginModal = () => {
  loginModalOpen.value = false
  authError.value = ''
}

export const login = async (username: string, password: string) => {
  authError.value = ''
  authLoading.value = true
  try {
    const { token, user } = await loginUser({ username, password })
    setAuthToken(token)
    localStorage.setItem(STORAGE_KEY, token)
    currentUser.value = user
    loginModalOpen.value = false
    return true
  } catch (error) {
    authError.value = error instanceof Error ? error.message : '登录失败'
    return false
  } finally {
    authLoading.value = false
  }
}

export const register = async (username: string, password: string, displayName: string, phone: string) => {
  authError.value = ''
  authLoading.value = true
  try {
    const { token, user } = await registerUser({ username, password, displayName, phone })
    setAuthToken(token)
    localStorage.setItem(STORAGE_KEY, token)
    currentUser.value = user
    loginModalOpen.value = false
    return true
  } catch (error) {
    authError.value = error instanceof Error ? error.message : '注册失败'
    return false
  } finally {
    authLoading.value = false
  }
}

export const logout = async () => {
  try {
    await apiLogout()
  } catch (_) {
    // Ignore logout API errors
  }
  setAuthToken('')
  localStorage.removeItem(STORAGE_KEY)
  currentUser.value = null
}

export const restoreSession = async () => {
  const token = localStorage.getItem(STORAGE_KEY)
  if (!token) return
  setAuthToken(token)
  try {
    const user = await fetchCurrentUser()
    currentUser.value = user
  } catch (_) {
    // Token expired or invalid
    setAuthToken('')
    localStorage.removeItem(STORAGE_KEY)
  }
  authReady.value = true
}
