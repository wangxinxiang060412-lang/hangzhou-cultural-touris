import { computed, ref } from 'vue'
import { fetchOperations } from '../services/api'
import type {
  ApiOperationNotice,
  ApiOperationServiceCard,
  ApiOperationTone,
  ApiOperationsPayload,
  ApiSpotOperationStatus,
} from '../services/api'

export type OperationTone = ApiOperationTone
export type OperationNotice = ApiOperationNotice
export type SpotOperationStatus = ApiSpotOperationStatus
export type OperationServiceCard = ApiOperationServiceCard

const operationsPayload = ref<ApiOperationsPayload | null>(null)
export const operationsError = ref('')
export const operationsLoading = ref(false)

let operationsLoadPromise: Promise<ApiOperationsPayload | null> | null = null
let operationSyncTimer = 0

export const spotOperationMap = computed<Record<string, SpotOperationStatus>>(
  () => operationsPayload.value?.spotStatuses ?? {},
)

export const featuredOperationAlerts = computed<OperationNotice[]>(
  () => operationsPayload.value?.featuredAlerts ?? [],
)

export const operationServiceCards = computed<OperationServiceCard[]>(
  () => operationsPayload.value?.serviceCards ?? [],
)

export const getSpotOperationStatus = (spotId: string) => spotOperationMap.value[spotId] ?? null

export const refreshOperationsFeed = async (force = false) => {
  if (operationsLoadPromise && !force) return operationsLoadPromise

  operationsLoading.value = true
  operationsError.value = ''
  operationsLoadPromise = fetchOperations()
    .then((payload) => {
      operationsPayload.value = payload
      return payload
    })
    .catch((error) => {
      operationsError.value = error instanceof Error ? error.message : '运行状态同步失败'
      return null
    })
    .finally(() => {
      operationsLoading.value = false
      operationsLoadPromise = null
    })

  return operationsLoadPromise
}

export const ensureOperationsFeed = async () => {
  if (!operationsPayload.value) {
    await refreshOperationsFeed()
  }

  if (typeof window === 'undefined' || operationSyncTimer) return
  operationSyncTimer = window.setInterval(() => {
    void refreshOperationsFeed(true)
  }, 5 * 60 * 1000)
}

export const stopOperationsFeed = () => {
  if (typeof window === 'undefined' || !operationSyncTimer) return
  window.clearInterval(operationSyncTimer)
  operationSyncTimer = 0
}
