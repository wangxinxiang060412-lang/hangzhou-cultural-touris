import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

export const useSmartBack = (fallback: RouteLocationRaw) => {
  const router = useRouter()

  const hasPreviousPage = computed(() => {
    if (typeof window === 'undefined') return false
    const back = (window.history.state as { back?: unknown } | null)?.back
    return typeof back === 'string' && back.length > 0
  })

  const goBack = () => {
    if (hasPreviousPage.value) {
      router.back()
      return
    }
    void router.push(fallback)
  }

  return {
    goBack,
    hasPreviousPage,
  }
}
