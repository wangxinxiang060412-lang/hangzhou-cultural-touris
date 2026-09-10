<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import BookingSlotForm from '../components/admin/BookingSlotForm.vue'
import ScenicSpotForm from '../components/admin/ScenicSpotForm.vue'
import TicketTypeForm from '../components/admin/TicketTypeForm.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { databaseMeta } from '../config/database'
import type { BookingOrder } from '../types/booking'
import {
  createBookingSlot,
  createScenicSpot,
  createTicketType,
  createUserAccount,
  deleteBookingSlot,
  deleteOrder,
  deleteScenicSpot,
  deleteTicketType,
  deleteUserAccount,
  resetDatabase as resetDatabaseRequest,
  resetOrders,
  updateBookingSlot,
  updateOrderStatus,
  updateScenicSpot,
  updateTicketType,
  updateUserAccount,
} from '../services/api'
import type {
  ApiBookingSlot,
  ApiScenicSpot,
  ApiTicketType,
  ApiUserAccount,
  BookingSlotInput,
  ScenicSpotInput,
  TicketTypeInput,
  UserAccountInput,
} from '../services/api'
import {
  auditLogs,
  bookingSlots,
  catalogError,
  orders,
  refreshAll,
  refreshAuditLogs,
  refreshBookingSlots,
  refreshOrders as refreshOrdersStore,
  refreshScenicSpots,
  refreshTicketTypes,
  refreshUserAccounts,
  scenicSpots,
  ticketTypes,
  userAccounts,
} from '../stores/catalog'
import { currentUser } from '../stores/auth'
import {
  countOrdersByStatus,
  filterOrdersByStatus,
  getActiveOrders,
  getOrderVisitorCount,
  isCanceledOrder,
  isPendingOrder,
  ORDER_STATUS,
  ORDER_STATUS_ALL,
  ORDER_STATUS_OPTIONS,
  type OrderStatusFilter,
} from '../utils/bookingOrders'
import { formatLocalDate } from '../utils/date'

type AdminPanelId = 'orders' | 'capacity' | 'spots' | 'tickets' | 'security' | 'maintenance'

type SlotEditor = { mode: 'create' | 'edit'; spotId?: string; slot?: ApiBookingSlot | null } | null
type SpotEditor = { mode: 'create' | 'edit'; spot?: ApiScenicSpot | null } | null
type TicketEditor = { mode: 'create' | 'edit'; spotId?: string; ticket?: ApiTicketType | null } | null
type UserEditor = { mode: 'create' | 'edit'; user?: ApiUserAccount | null } | null
type FeedbackTone = 'success' | 'info' | 'warning'

const today = formatLocalDate(new Date())

const activePanel = ref<AdminPanelId>('orders')
const adminPanels: Array<{ id: AdminPanelId; label: string }> = [
  { id: 'orders', label: '订单管理' },
  { id: 'capacity', label: '时段管理' },
  { id: 'spots', label: '景点管理' },
  { id: 'tickets', label: '票种管理' },
  { id: 'security', label: '账号权限' },
  { id: 'maintenance', label: '系统维护' },
]
const orderStatusOptions: OrderStatusFilter[] = [ORDER_STATUS_ALL, ...ORDER_STATUS_OPTIONS]

const selectedOrderStatus = ref<OrderStatusFilter>(ORDER_STATUS_ALL)
const orderSearch = ref('')
const selectedTicketSpotId = ref('全部')
const selectedCapacitySpotId = ref('全部')
const pendingResetOrders = ref(false)
const pendingResetDatabase = ref(false)
const pendingDeleteId = ref('')
const actionError = ref('')
const activeAction = ref('')
const feedback = ref<{ tone: FeedbackTone; message: string } | null>(null)
const editorRevision = ref(0)
const keepCreating = ref(false)
let feedbackTimer: number | undefined

const spotEditor = ref<SpotEditor>(null)
const ticketEditor = ref<TicketEditor>(null)
const slotEditor = ref<SlotEditor>(null)
const userEditor = ref<UserEditor>(null)
const userDraft = reactive<UserAccountInput>({
  username: '',
  displayName: '',
  role: '普通用户',
  status: '启用',
  phoneMasked: '',
  avatarColor: '#0a6e5c',
  password: '',
})

const activeEditorKind = computed<'spot' | 'ticket' | 'slot' | 'user' | null>(() => {
  if (spotEditor.value) return 'spot'
  if (ticketEditor.value) return 'ticket'
  if (slotEditor.value) return 'slot'
  if (userEditor.value) return 'user'
  return null
})

const editorIsOpen = computed(() => activeEditorKind.value !== null)

const editorTitle = computed(() => {
  if (spotEditor.value) return spotEditor.value.mode === 'create' ? '新增景点' : `编辑 ${spotEditor.value.spot?.nameZh ?? ''}`
  if (ticketEditor.value) return ticketEditor.value.mode === 'create' ? '新增票种' : `编辑 ${ticketEditor.value.ticket?.name ?? ''}`
  if (slotEditor.value) return slotEditor.value.mode === 'create' ? '新增时段' : `编辑 ${slotEditor.value.slot?.date ?? ''}`
  if (userEditor.value) return userEditor.value.mode === 'create' ? '新增账号' : `编辑 ${userEditor.value.user?.username ?? ''}`
  return ''
})

const editorKicker = computed(() => {
  if (spotEditor.value) return 'Scenic Spot'
  if (ticketEditor.value) return 'Ticket Type'
  if (slotEditor.value) return 'Booking Slot'
  if (userEditor.value) return 'Access Control'
  return 'Editor'
})

const editorContext = computed(() => {
  if (ticketEditor.value?.spotId) return `默认关联：${getSpotNameById(ticketEditor.value.spotId)}`
  if (slotEditor.value?.spotId) return `默认关联：${getSpotNameById(slotEditor.value.spotId)}`
  if (spotEditor.value?.mode === 'create') return '创建后可直接继续补票种和时段。'
  if (userEditor.value?.mode === 'create') return '新账号保存后立即进入账号权限列表。'
  return '保存后会同步刷新列表和操作审计。'
})

const primaryQuickAction = computed(() => {
  if (activePanel.value === 'spots') return '新增景点'
  if (activePanel.value === 'tickets') return '新增票种'
  if (activePanel.value === 'capacity') return '新增时段'
  if (activePanel.value === 'security') return '新增账号'
  return '快速新增'
})

const activeOrders = computed(() => getActiveOrders(orders.value))
const visibleTodayReservations = computed(
  () => activeOrders.value.filter((order) => order.createdAt.startsWith(today)).length,
)
const pendingVerify = computed(() => countOrdersByStatus(orders.value, ORDER_STATUS.pending))
const completedOrders = computed(() => countOrdersByStatus(orders.value, ORDER_STATUS.completed))
const canceledOrders = computed(() => countOrdersByStatus(orders.value, ORDER_STATUS.canceled))
const enabledAdminCount = computed(
  () => userAccounts.value.filter((user) => user.role === '管理员' && user.status === '启用').length,
)
const recentAuditLogs = computed(() => auditLogs.value.slice(0, 12))
const maintenanceRows = computed(() => [
  { label: '景点主数据', value: `${scenicSpots.value.length} 条`, note: '前台导览与预约入口' },
  { label: '票种配置', value: `${ticketTypes.value.length} 条`, note: '价格、适用人群与免费登记' },
  { label: '预约时段', value: `${bookingSlots.value.length} 条`, note: '容量、基础已约与实时余量' },
  { label: '订单记录', value: `${orders.value.length} 条`, note: '预约、核销、取消与恢复' },
  { label: '账号权限', value: `${userAccounts.value.length} 个`, note: `${enabledAdminCount.value} 个启用管理员` },
  { label: '操作审计', value: `${auditLogs.value.length} 条`, note: '记录关键写操作' },
])

const managedOrders = computed(() => {
  const query = orderSearch.value.trim().toLowerCase()
  const source = filterOrdersByStatus(orders.value, selectedOrderStatus.value)

  return source.filter((order) => {
    const matchesQuery =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.spotName.toLowerCase().includes(query) ||
      order.qrCodeText.toLowerCase().includes(query) ||
      order.visitors.some((visitor) => visitor.toLowerCase().includes(query)) ||
      (order.contactPhone ?? '').toLowerCase().includes(query)

    return matchesQuery
  })
})

const hasOrderFilters = computed(
  () => selectedOrderStatus.value !== ORDER_STATUS_ALL || orderSearch.value.trim().length > 0,
)

const orderFilterSummary = computed(() => {
  if (!hasOrderFilters.value) return '全部订单'
  const parts = []
  if (selectedOrderStatus.value !== ORDER_STATUS_ALL) parts.push(selectedOrderStatus.value)
  if (orderSearch.value.trim()) parts.push(`检索：${orderSearch.value.trim()}`)
  return parts.join(' · ')
})

const capacitySpotOptions = computed(() => [
  { id: '全部', name: '全部景点' },
  ...scenicSpots.value.map((spot) => ({ id: spot.id, name: spot.nameZh })),
])

const filteredCapacityRows = computed(() => {
  const spotId = selectedCapacitySpotId.value
  const source =
    spotId === '全部'
      ? bookingSlots.value
      : bookingSlots.value.filter((slot) => slot.scenicSpotId === spotId)

  return [...source]
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeRange.localeCompare(b.timeRange))
    .slice(0, 60)
})

const lowStockSlots = computed(() =>
  [...bookingSlots.value]
    .filter((slot) => slot.remaining < 18)
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 4),
)

const popularSpots = computed(() => {
  const counts = new Map<string, number>()
  activeOrders.value.forEach((order) => {
    counts.set(order.spotName, (counts.get(order.spotName) ?? 0) + getOrderVisitorCount(order))
  })

  return [...scenicSpots.value]
    .sort((a, b) => (counts.get(b.nameZh) ?? 0) - (counts.get(a.nameZh) ?? 0))
    .slice(0, 5)
})

const recentOrders = computed(() => orders.value.slice(0, 3))

const ticketSpotOptions = computed(() => [
  { id: '全部', name: '全部景点' },
  ...scenicSpots.value.map((spot) => ({ id: spot.id, name: spot.nameZh })),
])

const filteredTickets = computed(() =>
  selectedTicketSpotId.value === '全部'
    ? ticketTypes.value
    : ticketTypes.value.filter((ticket) => ticket.scenicSpotId === selectedTicketSpotId.value),
)

const spotRows = computed(() =>
  scenicSpots.value.map((spot) => ({
    ...spot,
    ticketCount: ticketTypes.value.filter((ticket) => ticket.scenicSpotId === spot.id).length,
    slotCount: bookingSlots.value.filter((slot) => slot.scenicSpotId === spot.id).length,
    orderCount: activeOrders.value.filter((order) => order.spotName === spot.nameZh).length,
  })),
)

const getSpotNameById = (scenicSpotId: string) =>
  scenicSpots.value.find((spot) => spot.id === scenicSpotId)?.nameZh ?? scenicSpotId

const clearFeedbackTimer = () => {
  if (feedbackTimer) {
    window.clearTimeout(feedbackTimer)
    feedbackTimer = undefined
  }
}

const clearFeedback = () => {
  clearFeedbackTimer()
  feedback.value = null
}

const showFeedback = (message: string, tone: FeedbackTone = 'success') => {
  clearFeedbackTimer()
  feedback.value = { message, tone }
  feedbackTimer = window.setTimeout(() => {
    feedback.value = null
    feedbackTimer = undefined
  }, tone === 'warning' ? 7200 : 4200)
}

const isActionRunning = (key?: string) => (key ? activeAction.value === key : Boolean(activeAction.value))

const runAdminAction = async (key: string, successMessage: string, task: () => Promise<void>) => {
  if (activeAction.value) return

  try {
    actionError.value = ''
    clearFeedback()
    activeAction.value = key
    await task()
    if (successMessage) showFeedback(successMessage)
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : '操作失败'
  } finally {
    activeAction.value = ''
  }
}

const cancelPendingResets = () => {
  pendingResetOrders.value = false
  pendingResetDatabase.value = false
}

const handleCancelPendingResets = () => {
  cancelPendingResets()
  showFeedback('已放弃危险操作确认', 'info')
}

const clearOrderFilters = () => {
  selectedOrderStatus.value = ORDER_STATUS_ALL
  orderSearch.value = ''
}

const closeAnyEditor = () => {
  spotEditor.value = null
  ticketEditor.value = null
  slotEditor.value = null
  userEditor.value = null
  keepCreating.value = false
}

const prepareEditor = () => {
  cancelRemove()
  cancelPendingResets()
  clearFeedback()
  keepCreating.value = false
  editorRevision.value += 1
}

const setActivePanel = (panel: AdminPanelId) => {
  activePanel.value = panel
  closeAnyEditor()
  pendingDeleteId.value = ''
  cancelPendingResets()
  actionError.value = ''
  clearFeedback()
}

const beginRemove = (id: string, label: string) => {
  cancelPendingResets()
  pendingDeleteId.value = id
  showFeedback(`再次点击“确认删除”将删除 ${label}。`, 'warning')
}

const confirmRemove = (id: string) => pendingDeleteId.value === id

const cancelRemove = () => {
  pendingDeleteId.value = ''
}

const handleRefreshAll = () =>
  runAdminAction('refresh', '后台数据已刷新', async () => {
    cancelRemove()
    cancelPendingResets()
    await refreshAll()
  })

const handleVerifyOrder = (order: BookingOrder) => {
  cancelRemove()
  return runAdminAction(`order:verify:${order.id}`, `订单 ${order.id} 已核销`, async () => {
    if (!isPendingOrder(order)) return
    await updateOrderStatus(order.id, ORDER_STATUS.completed)
    await Promise.all([refreshOrdersStore(), refreshAuditLogs()])
  })
}

const handleCancelOrder = (order: BookingOrder) => {
  cancelRemove()
  return runAdminAction(`order:cancel:${order.id}`, `订单 ${order.id} 已取消`, async () => {
    if (!isPendingOrder(order)) return
    await updateOrderStatus(order.id, ORDER_STATUS.canceled)
    await refreshAll()
  })
}

const handleRestoreOrder = (order: BookingOrder) => {
  cancelRemove()
  return runAdminAction(`order:restore:${order.id}`, `订单 ${order.id} 已恢复为待出行`, async () => {
    if (!isCanceledOrder(order)) return
    await updateOrderStatus(order.id, ORDER_STATUS.pending)
    await refreshAll()
  })
}

const handleDeleteOrder = (order: BookingOrder) => {
  if (!confirmRemove(order.id)) {
    beginRemove(order.id, `订单 ${order.id}`)
    return
  }

  void runAdminAction(`order:delete:${order.id}`, `订单 ${order.id} 已删除`, async () => {
    await deleteOrder(order.id)
    cancelRemove()
    await refreshAll()
  })
}

const handleResetOrders = () => {
  if (activeAction.value) return

  if (!pendingResetOrders.value) {
    cancelRemove()
    pendingResetDatabase.value = false
    pendingResetOrders.value = true
    showFeedback('订单表将恢复为种子数据。再次点击确认按钮执行，或点击“放弃”。', 'warning')
    return
  }

  void runAdminAction('orders:reset', '订单表已恢复为种子数据', async () => {
    await resetOrders()
    pendingResetOrders.value = false
    await refreshAll()
  })
}

const handleResetDatabase = () => {
  if (activeAction.value) return

  if (!pendingResetDatabase.value) {
    cancelRemove()
    pendingResetOrders.value = false
    pendingResetDatabase.value = true
    showFeedback('整库恢复会覆盖景点、票种、时段、订单、账号和日志。再次点击确认按钮执行，或点击“放弃”。', 'warning')
    return
  }

  void runAdminAction('database:reset', '整库已恢复为种子数据', async () => {
    await resetDatabaseRequest()
    pendingResetDatabase.value = false
    await refreshAll()
  })
}

const handlePrimaryQuickAction = () => {
  if (activePanel.value === 'spots') {
    openCreateSpot()
    return
  }
  if (activePanel.value === 'tickets') {
    openCreateTicket(selectedTicketSpotId.value === '全部' ? undefined : selectedTicketSpotId.value)
    return
  }
  if (activePanel.value === 'capacity') {
    openCreateSlot(selectedCapacitySpotId.value === '全部' ? undefined : selectedCapacitySpotId.value)
    return
  }
  if (activePanel.value === 'security') {
    openCreateUser()
    return
  }
  openCreateSpot()
}

const openCreateSpot = () => {
  prepareEditor()
  ticketEditor.value = null
  slotEditor.value = null
  userEditor.value = null
  spotEditor.value = { mode: 'create', spot: null }
}

const openEditSpot = (spot: ApiScenicSpot) => {
  prepareEditor()
  ticketEditor.value = null
  slotEditor.value = null
  userEditor.value = null
  spotEditor.value = { mode: 'edit', spot }
}

const closeSpotEditor = () => {
  closeAnyEditor()
}

const handleSaveSpot = (payload: ScenicSpotInput) => {
  const editor = spotEditor.value
  if (!editor) return

  void runAdminAction('spot:save', editor.mode === 'create' ? '景点已创建' : '景点已保存', async () => {
    if (editor.mode === 'create') {
      await createScenicSpot(payload)
    } else if (editor.spot) {
      await updateScenicSpot(editor.spot.id, payload)
    }
    if (editor.mode === 'create' && keepCreating.value) {
      spotEditor.value = { mode: 'create', spot: null }
      editorRevision.value += 1
    } else {
      closeSpotEditor()
    }
    await Promise.all([refreshScenicSpots(), refreshAuditLogs()])
  })
}

const handleDeleteSpot = (spot: ApiScenicSpot) => {
  if (!confirmRemove(spot.id)) {
    beginRemove(spot.id, `景点 ${spot.nameZh}`)
    return
  }

  void runAdminAction(`spot:delete:${spot.id}`, `景点 ${spot.nameZh} 已删除`, async () => {
    await deleteScenicSpot(spot.id)
    cancelRemove()
    await refreshAll()
  })
}

const openCreateTicket = (spotId?: string) => {
  prepareEditor()
  activePanel.value = 'tickets'
  if (spotId) {
    selectedTicketSpotId.value = spotId
  }
  spotEditor.value = null
  slotEditor.value = null
  userEditor.value = null
  ticketEditor.value = { mode: 'create', spotId, ticket: null }
}

const openEditTicket = (ticket: ApiTicketType) => {
  prepareEditor()
  spotEditor.value = null
  slotEditor.value = null
  userEditor.value = null
  ticketEditor.value = { mode: 'edit', ticket }
}

const closeTicketEditor = () => {
  closeAnyEditor()
}

const handleSaveTicket = (payload: TicketTypeInput) => {
  const editor = ticketEditor.value
  if (!editor) return

  void runAdminAction('ticket:save', editor.mode === 'create' ? '票种已创建' : '票种已保存', async () => {
    if (editor.mode === 'create') {
      await createTicketType(payload)
    } else if (editor.ticket) {
      await updateTicketType(editor.ticket.id, payload)
    }
    if (editor.mode === 'create' && keepCreating.value) {
      ticketEditor.value = { mode: 'create', spotId: payload.scenicSpotId, ticket: null }
      selectedTicketSpotId.value = payload.scenicSpotId
      editorRevision.value += 1
    } else {
      closeTicketEditor()
    }
    await Promise.all([refreshTicketTypes(), refreshAuditLogs()])
  })
}

const handleDeleteTicket = (ticket: ApiTicketType) => {
  if (!confirmRemove(ticket.id)) {
    beginRemove(ticket.id, `票种 ${ticket.name}`)
    return
  }

  void runAdminAction(`ticket:delete:${ticket.id}`, `票种 ${ticket.name} 已删除`, async () => {
    await deleteTicketType(ticket.id)
    cancelRemove()
    await Promise.all([refreshTicketTypes(), refreshAuditLogs()])
  })
}

const openCreateSlot = (spotId?: string) => {
  prepareEditor()
  activePanel.value = 'capacity'
  if (spotId) {
    selectedCapacitySpotId.value = spotId
  }
  spotEditor.value = null
  ticketEditor.value = null
  userEditor.value = null
  slotEditor.value = { mode: 'create', spotId, slot: null }
}

const openEditSlot = (slot: ApiBookingSlot) => {
  prepareEditor()
  spotEditor.value = null
  ticketEditor.value = null
  userEditor.value = null
  slotEditor.value = { mode: 'edit', slot }
}

const closeSlotEditor = () => {
  closeAnyEditor()
}

const handleSaveSlot = (payload: BookingSlotInput) => {
  const editor = slotEditor.value
  if (!editor) return

  void runAdminAction('slot:save', editor.mode === 'create' ? '时段已创建' : '时段已保存', async () => {
    if (editor.mode === 'create') {
      await createBookingSlot(payload)
    } else if (editor.slot) {
      await updateBookingSlot(editor.slot.id, {
        date: payload.date,
        timeRange: payload.timeRange,
        capacity: payload.capacity,
        booked: payload.booked,
      })
    }
    if (editor.mode === 'create' && keepCreating.value) {
      slotEditor.value = { mode: 'create', spotId: payload.scenicSpotId, slot: null }
      selectedCapacitySpotId.value = payload.scenicSpotId
      editorRevision.value += 1
    } else {
      closeSlotEditor()
    }
    await Promise.all([refreshBookingSlots(), refreshAuditLogs()])
  })
}

const handleDeleteSlot = (slot: ApiBookingSlot) => {
  if (!confirmRemove(slot.id)) {
    beginRemove(slot.id, `${slot.spotName} ${slot.date} ${slot.timeRange} 时段`)
    return
  }

  void runAdminAction(`slot:delete:${slot.id}`, '时段已删除', async () => {
    await deleteBookingSlot(slot.id)
    cancelRemove()
    await Promise.all([refreshBookingSlots(), refreshAuditLogs()])
  })
}

const hydrateUserDraft = (user?: ApiUserAccount | null) => {
  userDraft.username = user?.username ?? ''
  userDraft.displayName = user?.displayName ?? ''
  userDraft.role = user?.role ?? '普通用户'
  userDraft.status = user?.status ?? '启用'
  userDraft.phoneMasked = user?.phoneMasked ?? ''
  userDraft.avatarColor = user?.avatarColor ?? '#0a6e5c'
  userDraft.password = ''
}

const openCreateUser = () => {
  prepareEditor()
  spotEditor.value = null
  ticketEditor.value = null
  slotEditor.value = null
  hydrateUserDraft(null)
  userEditor.value = { mode: 'create', user: null }
}

const openEditUser = (user: ApiUserAccount) => {
  prepareEditor()
  spotEditor.value = null
  ticketEditor.value = null
  slotEditor.value = null
  hydrateUserDraft(user)
  userEditor.value = { mode: 'edit', user }
}

const closeUserEditor = () => {
  closeAnyEditor()
  hydrateUserDraft(null)
}

const userDraftIsValid = computed(
  () =>
    userDraft.username.trim().length >= 3 &&
    userDraft.displayName.trim().length >= 2 &&
    userDraft.phoneMasked.trim().length >= 4 &&
    (userEditor.value?.mode === 'edit' || ((userDraft.password ?? '').length >= 8 && /[A-Za-z]/.test(userDraft.password ?? '') && /\d/.test(userDraft.password ?? ''))),
)

const handleSaveUser = () => {
  const editor = userEditor.value
  if (!editor || !userDraftIsValid.value) return

  void runAdminAction('user:save', editor.mode === 'create' ? '账号已创建' : '账号已保存', async () => {
    if (editor.mode === 'create') {
      await createUserAccount({ ...userDraft })
    } else if (editor.user) {
      await updateUserAccount(editor.user.id, { ...userDraft })
    }
    if (editor.mode === 'create' && keepCreating.value) {
      hydrateUserDraft(null)
      userEditor.value = { mode: 'create', user: null }
      editorRevision.value += 1
    } else {
      closeUserEditor()
    }
    await Promise.all([refreshUserAccounts(), refreshAuditLogs()])
  })
}

const handleDeleteUser = (user: ApiUserAccount) => {
  if (!confirmRemove(user.id)) {
    beginRemove(user.id, `账号 ${user.username}`)
    return
  }

  void runAdminAction(`user:delete:${user.id}`, `账号 ${user.username} 已删除`, async () => {
    await deleteUserAccount(user.id)
    cancelRemove()
    await Promise.all([refreshUserAccounts(), refreshAuditLogs()])
  })
}

const errorMessage = computed(() => actionError.value || catalogError.value)

onMounted(() => {
  void refreshAll()
})

onBeforeUnmount(() => {
  clearFeedbackTimer()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="admin-page" tabindex="-1">
      <section class="admin-hero" aria-labelledby="admin-title" data-reveal>
        <div class="admin-hero__meta">
          <span>杭州文旅运营后台</span>
          <span>Operations Console</span>
        </div>

        <h1 id="admin-title">运营管理</h1>
        <p>集中维护景点、票种、预约时段、订单核销、账号权限和数据恢复，让前台预约、订单中心与运营后台使用同一套业务数据。</p>

        <div class="admin-hero__actions">
          <RouterLink to="/scenic-spots">查看前台预约</RouterLink>
          <RouterLink to="/orders">查看预约记录</RouterLink>
          <RouterLink to="/">回到首页</RouterLink>
        </div>
      </section>

      <section class="admin-command-strip" aria-label="管理员权限与快捷操作" data-reveal>
        <div class="admin-identity">
          <span class="admin-identity__dot" aria-hidden="true"></span>
          <div>
            <p>{{ currentUser?.displayName ?? '管理员' }}</p>
            <small>{{ currentUser?.role ?? '管理员' }} · 写操作已接入审计日志</small>
          </div>
        </div>
        <div class="admin-quick-actions">
          <button type="button" :disabled="isActionRunning()" @click="handlePrimaryQuickAction">
            {{ primaryQuickAction }}
          </button>
          <button type="button" :disabled="isActionRunning()" @click="openCreateSpot">景点</button>
          <button type="button" :disabled="scenicSpots.length === 0 || isActionRunning()" @click="openCreateTicket(selectedTicketSpotId === '全部' ? undefined : selectedTicketSpotId)">票种</button>
          <button type="button" :disabled="scenicSpots.length === 0 || isActionRunning()" @click="openCreateSlot(selectedCapacitySpotId === '全部' ? undefined : selectedCapacitySpotId)">时段</button>
          <button type="button" :disabled="isActionRunning()" @click="openCreateUser">账号</button>
        </div>
      </section>

      <section class="admin-metrics" aria-label="核心指标" data-reveal>
        <article>
          <span>今日预约数</span>
          <strong>{{ visibleTodayReservations }}</strong>
        </article>
        <article>
          <span>待核销</span>
          <strong>{{ pendingVerify }}</strong>
        </article>
        <article>
          <span>已核销</span>
          <strong>{{ completedOrders }}</strong>
        </article>
        <article>
          <span>已取消</span>
          <strong>{{ canceledOrders }}</strong>
        </article>
        <article>
          <span>景点数量</span>
          <strong>{{ scenicSpots.length }}</strong>
        </article>
        <article>
          <span>票种数量</span>
          <strong>{{ ticketTypes.length }}</strong>
        </article>
      </section>

      <section class="admin-toolbar" aria-label="后台数据管理入口" data-reveal>
        <div class="admin-tabs" role="tablist" aria-label="后台管理区块">
          <button
            v-for="panel in adminPanels"
            :key="panel.id"
            type="button"
            :class="{ 'is-active': activePanel === panel.id }"
            role="tab"
            :aria-selected="activePanel === panel.id"
            :aria-controls="`admin-panel-${panel.id}`"
            :disabled="isActionRunning()"
            @click="setActivePanel(panel.id)"
          >
            {{ panel.label }}
          </button>
        </div>

        <div class="admin-tools">
          <button type="button" :disabled="isActionRunning()" @click="handleRefreshAll">
            {{ isActionRunning('refresh') ? '刷新中' : '刷新' }}
          </button>
          <button type="button" class="is-danger" :disabled="isActionRunning()" @click="handleResetOrders">
            {{ isActionRunning('orders:reset') ? '重置中' : pendingResetOrders ? '确认重置订单' : '重置订单表' }}
          </button>
          <button type="button" class="is-danger" :disabled="isActionRunning()" @click="handleResetDatabase">
            {{ isActionRunning('database:reset') ? '重置中' : pendingResetDatabase ? '确认重置数据库' : '重置整库' }}
          </button>
          <button
            v-if="pendingResetOrders || pendingResetDatabase"
            type="button"
            :disabled="isActionRunning()"
            @click="handleCancelPendingResets"
          >
            放弃
          </button>
        </div>
      </section>

      <section v-if="feedback" class="admin-manage admin-manage--inline" data-reveal>
        <article
          class="admin-panel admin-panel--wide admin-feedback"
          :class="`admin-feedback--${feedback.tone}`"
          role="status"
          aria-live="polite"
        >
          <p>{{ feedback.message }}</p>
          <button type="button" @click="clearFeedback">知道了</button>
        </article>
      </section>

      <section v-if="errorMessage" class="admin-manage admin-manage--inline" data-reveal>
        <article class="admin-panel admin-panel--wide admin-error" role="alert">
          <p>{{ errorMessage }}</p>
        </article>
      </section>

      <section class="admin-grid" data-reveal>
        <article class="admin-panel">
          <header>
            <p>热门景点</p>
            <span>Top Scenic Spots</span>
          </header>
          <ol class="admin-list">
            <li v-for="spot in popularSpots" :key="spot.id">
              <span>{{ spot.nameZh }}</span>
              <small>{{ spot.area }} · {{ spot.category }}</small>
            </li>
            <li v-if="popularSpots.length === 0">
              <span>暂无景点</span>
              <small>请先新增景点</small>
            </li>
          </ol>
        </article>

        <article class="admin-panel">
          <header>
            <p>余票预警</p>
            <span>Low Availability</span>
          </header>
          <ol class="admin-list">
            <li v-for="slot in lowStockSlots" :key="slot.id">
              <span>{{ slot.date }} {{ slot.timeRange }}</span>
              <small>剩余 {{ slot.remaining }} · {{ slot.spotName }}</small>
            </li>
            <li v-if="lowStockSlots.length === 0">
              <span>暂无告警</span>
              <small>所有时段余量充足</small>
            </li>
          </ol>
        </article>

        <article class="admin-panel admin-panel--wide">
          <header>
            <p>最近预约</p>
            <span>Recent Reservations</span>
          </header>
          <div class="admin-orders">
            <div v-for="order in recentOrders" :key="order.id">
              <span>{{ order.id }}</span>
              <strong>{{ order.spotName }}</strong>
              <small>{{ order.visitDate }} · {{ order.status }}</small>
              <button
                v-if="isPendingOrder(order)"
                type="button"
                :disabled="isActionRunning()"
                @click="handleVerifyOrder(order)"
              >
                {{ isActionRunning(`order:verify:${order.id}`) ? '核销中' : '核销' }}
              </button>
            </div>
            <div v-if="recentOrders.length === 0">
              <span>暂无预约</span>
              <strong>等待首单</strong>
              <small>—</small>
            </div>
          </div>
        </article>
      </section>

      <section class="admin-manage" data-reveal>
        <article
          v-if="activePanel === 'orders'"
          id="admin-panel-orders"
          class="admin-panel admin-panel--wide"
          role="tabpanel"
        >
          <header>
            <p>订单管理</p>
            <span>{{ managedOrders.length }} Records · {{ orderFilterSummary }}</span>
          </header>

          <div class="admin-controls admin-controls--three">
            <label>
              <span>状态</span>
              <select v-model="selectedOrderStatus">
                <option v-for="status in orderStatusOptions" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </label>
            <label>
              <span>检索</span>
              <input v-model="orderSearch" type="search" placeholder="预约编号 / 景点 / 游客 / 手机 / 核销码" />
            </label>
            <label class="admin-controls__add">
              <span>筛选</span>
              <button type="button" :disabled="!hasOrderFilters || isActionRunning()" @click="clearOrderFilters">
                清除筛选
              </button>
            </label>
          </div>

          <div class="admin-table admin-table--orders">
            <div class="admin-table__head">
              <span>编号</span>
              <span>景点</span>
              <span>日期</span>
              <span>游客</span>
              <span>状态</span>
              <span>操作</span>
            </div>
            <div v-for="order in managedOrders" :key="order.id" class="admin-table__row">
              <span>{{ order.id }}</span>
              <span>{{ order.spotName }}</span>
              <span>{{ order.visitDate }} · {{ order.timeRange }}</span>
              <span>{{ getOrderVisitorCount(order) }} 人</span>
              <span>{{ order.status }}</span>
              <span class="admin-row-actions">
                <button
                  v-if="isPendingOrder(order)"
                  type="button"
                  :disabled="isActionRunning()"
                  @click="handleVerifyOrder(order)"
                >
                  {{ isActionRunning(`order:verify:${order.id}`) ? '核销中' : '核销' }}
                </button>
                <button
                  v-if="isPendingOrder(order)"
                  type="button"
                  :disabled="isActionRunning()"
                  @click="handleCancelOrder(order)"
                >
                  {{ isActionRunning(`order:cancel:${order.id}`) ? '取消中' : '取消' }}
                </button>
                <button
                  v-if="isCanceledOrder(order)"
                  type="button"
                  :disabled="isActionRunning()"
                  @click="handleRestoreOrder(order)"
                >
                  {{ isActionRunning(`order:restore:${order.id}`) ? '恢复中' : '恢复' }}
                </button>
                <button
                  type="button"
                  class="is-danger"
                  :disabled="isActionRunning()"
                  @click="handleDeleteOrder(order)"
                >
                  {{ isActionRunning(`order:delete:${order.id}`) ? '删除中' : confirmRemove(order.id) ? '确认删除' : '删除' }}
                </button>
              </span>
            </div>
            <div v-if="managedOrders.length === 0" class="admin-table__row">
              <span>—</span>
              <span>暂无订单</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          </div>
        </article>

        <article
          v-else-if="activePanel === 'capacity'"
          id="admin-panel-capacity"
          class="admin-panel admin-panel--wide"
          role="tabpanel"
        >
          <header>
            <p>时段管理</p>
            <span>{{ bookingSlots.length }} Slots</span>
          </header>

          <div class="admin-controls">
            <label>
              <span>景点</span>
              <select v-model="selectedCapacitySpotId">
                <option v-for="spot in capacitySpotOptions" :key="spot.id" :value="spot.id">
                  {{ spot.name }}
                </option>
              </select>
            </label>
            <label class="admin-controls__add">
              <span>新增</span>
              <button
                type="button"
                :disabled="isActionRunning()"
                @click="openCreateSlot(selectedCapacitySpotId === '全部' ? undefined : selectedCapacitySpotId)"
              >
                + 新增时段
              </button>
            </label>
          </div>

          <div class="admin-table admin-table--capacity">
            <div class="admin-table__head">
              <span>景点</span>
              <span>日期</span>
              <span>时段</span>
              <span>基础已约</span>
              <span>订单占用</span>
              <span>剩余</span>
              <span>操作</span>
            </div>
            <div v-for="slot in filteredCapacityRows" :key="slot.id" class="admin-table__row">
              <span>{{ slot.spotName }}</span>
              <span>{{ slot.date }}</span>
              <span>{{ slot.timeRange }}</span>
              <span>{{ slot.booked }}</span>
              <span>{{ slot.localBooked }}</span>
              <span>{{ slot.remaining }} / {{ slot.capacity }}</span>
              <span class="admin-row-actions">
                <button type="button" :disabled="isActionRunning()" @click="openEditSlot(slot)">编辑</button>
                <button
                  type="button"
                  class="is-danger"
                  :disabled="isActionRunning()"
                  @click="handleDeleteSlot(slot)"
                >
                  {{ isActionRunning(`slot:delete:${slot.id}`) ? '删除中' : confirmRemove(slot.id) ? '确认删除' : '删除' }}
                </button>
              </span>
            </div>
            <div v-if="filteredCapacityRows.length === 0" class="admin-table__row">
              <span>—</span>
              <span>暂无时段</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          </div>
        </article>

        <article
          v-else-if="activePanel === 'spots'"
          id="admin-panel-spots"
          class="admin-panel admin-panel--wide"
          role="tabpanel"
        >
          <header>
            <p>景点管理</p>
            <span>{{ scenicSpots.length }} Scenic Spots</span>
          </header>

          <div class="admin-controls">
            <label class="admin-controls__add">
              <span>新增</span>
              <button type="button" :disabled="isActionRunning()" @click="openCreateSpot">+ 新增景点</button>
            </label>
            <label>
              <span>关联时段</span>
              <span class="admin-controls__readonly">共 {{ bookingSlots.length }} 个时段</span>
            </label>
          </div>

          <div class="admin-table admin-table--spots">
            <div class="admin-table__head">
              <span>景点</span>
              <span>区域</span>
              <span>分类</span>
              <span>预约</span>
              <span>票种</span>
              <span>时段</span>
              <span>操作</span>
            </div>
            <div v-for="spot in spotRows" :key="spot.id" class="admin-table__row">
              <span>
                <strong>{{ spot.nameZh }}</strong>
                <small>{{ spot.nameEn }}</small>
              </span>
              <span>{{ spot.area }}</span>
              <span>{{ spot.category }}</span>
              <span>{{ spot.reservationRequired ? '购票/分时' : '开放参观' }}{{ spot.featured ? ' · 推荐' : '' }}</span>
              <span>{{ spot.ticketCount }}</span>
              <span>{{ spot.slotCount }}</span>
              <span class="admin-row-actions">
                <button type="button" :disabled="isActionRunning()" @click="openEditSpot(spot)">编辑</button>
                <button type="button" :disabled="isActionRunning()" @click="openCreateTicket(spot.id)">+票种</button>
                <button type="button" :disabled="isActionRunning()" @click="openCreateSlot(spot.id)">+时段</button>
                <button
                  type="button"
                  class="is-danger"
                  :disabled="isActionRunning()"
                  @click="handleDeleteSpot(spot)"
                >
                  {{ isActionRunning(`spot:delete:${spot.id}`) ? '删除中' : confirmRemove(spot.id) ? '确认删除' : '删除' }}
                </button>
              </span>
            </div>
            <div v-if="spotRows.length === 0" class="admin-table__row">
              <span>暂无景点</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          </div>
        </article>

        <article
          v-else-if="activePanel === 'tickets'"
          id="admin-panel-tickets"
          class="admin-panel admin-panel--wide"
          role="tabpanel"
        >
          <header>
            <p>票种管理</p>
            <span>{{ filteredTickets.length }} Ticket Types</span>
          </header>

          <div class="admin-controls">
            <label>
              <span>景点</span>
              <select v-model="selectedTicketSpotId">
                <option v-for="spot in ticketSpotOptions" :key="spot.id" :value="spot.id">
                  {{ spot.name }}
                </option>
              </select>
            </label>
            <label class="admin-controls__add">
              <span>新增</span>
              <button
                type="button"
                :disabled="scenicSpots.length === 0 || isActionRunning()"
                @click="openCreateTicket(selectedTicketSpotId === '全部' ? undefined : selectedTicketSpotId)"
              >
                + 新增票种
              </button>
            </label>
          </div>

          <div class="admin-table admin-table--tickets">
            <div class="admin-table__head">
              <span>票种</span>
              <span>景点</span>
              <span>价格</span>
              <span>适用人群</span>
              <span>操作</span>
            </div>
            <div v-for="ticket in filteredTickets" :key="ticket.id" class="admin-table__row">
              <span>{{ ticket.name }}</span>
              <span>{{ getSpotNameById(ticket.scenicSpotId) }}</span>
              <span>{{ ticket.price === 0 ? '免费入园登记' : `¥${ticket.price}` }}</span>
              <span>{{ ticket.availableFor || '—' }}</span>
              <span class="admin-row-actions">
                <button type="button" :disabled="isActionRunning()" @click="openEditTicket(ticket)">编辑</button>
                <button
                  type="button"
                  class="is-danger"
                  :disabled="isActionRunning()"
                  @click="handleDeleteTicket(ticket)"
                >
                  {{ isActionRunning(`ticket:delete:${ticket.id}`) ? '删除中' : confirmRemove(ticket.id) ? '确认删除' : '删除' }}
                </button>
              </span>
            </div>
            <div v-if="filteredTickets.length === 0" class="admin-table__row">
              <span>暂无票种</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          </div>
        </article>

        <article
          v-else-if="activePanel === 'security'"
          id="admin-panel-security"
          class="admin-panel admin-panel--wide"
          role="tabpanel"
        >
          <header>
            <p>账号权限</p>
            <span>{{ userAccounts.length }} Users · {{ auditLogs.length }} Logs</span>
          </header>

          <div class="admin-controls">
            <label>
              <span>权限状态</span>
              <span class="admin-controls__readonly">{{ enabledAdminCount }} 个启用管理员</span>
            </label>
            <label class="admin-controls__add">
              <span>新增</span>
              <button type="button" :disabled="isActionRunning()" @click="openCreateUser">+ 新增账号</button>
            </label>
          </div>

          <div class="admin-table admin-table--users">
            <div class="admin-table__head">
              <span>账号</span>
              <span>角色</span>
              <span>状态</span>
              <span>手机号</span>
              <span>最近登录</span>
              <span>操作</span>
            </div>
            <div v-for="user in userAccounts" :key="user.id" class="admin-table__row">
              <span>
                <strong>{{ user.displayName }}</strong>
                <small>{{ user.username }}</small>
              </span>
              <span>{{ user.role }}</span>
              <span>{{ user.status }}</span>
              <span>{{ user.phoneMasked }}</span>
              <span>{{ user.lastLoginAt ?? '—' }}</span>
              <span class="admin-row-actions">
                <button type="button" :disabled="isActionRunning()" @click="openEditUser(user)">编辑</button>
                <button
                  type="button"
                  class="is-danger"
                  :disabled="isActionRunning()"
                  @click="handleDeleteUser(user)"
                >
                  {{ isActionRunning(`user:delete:${user.id}`) ? '删除中' : confirmRemove(user.id) ? '确认删除' : '删除' }}
                </button>
              </span>
            </div>
          </div>

          <div class="audit-panel">
            <header>
              <p>最近操作</p>
              <span>Audit Trail</span>
            </header>
            <div class="admin-table admin-table--audit">
              <div class="admin-table__head">
                <span>时间</span>
                <span>操作者</span>
                <span>动作</span>
                <span>对象</span>
                <span>说明</span>
              </div>
              <div v-for="log in recentAuditLogs" :key="log.id" class="admin-table__row">
                <span>{{ log.createdAt }}</span>
                <span>{{ log.actor }} · {{ log.role }}</span>
                <span>{{ log.action }}</span>
                <span>{{ log.targetTable }} / {{ log.targetId }}</span>
                <span>{{ log.detail }}</span>
              </div>
              <div v-if="recentAuditLogs.length === 0" class="admin-table__row">
                <span>—</span>
                <span>暂无操作日志</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
              </div>
            </div>
          </div>
        </article>

        <article
          v-else
          id="admin-panel-maintenance"
          class="admin-panel admin-panel--wide"
          role="tabpanel"
        >
          <header>
            <p>系统维护</p>
            <span>{{ databaseMeta.version }} · {{ databaseMeta.persistence }}</span>
          </header>

          <div class="database-meta">
            <p>{{ databaseMeta.name }}</p>
            <small>{{ databaseMeta.note }}</small>
            <small>Storage Key · {{ databaseMeta.storageKey }}</small>
          </div>

          <div class="admin-table admin-table--maintenance">
            <div class="admin-table__head">
              <span>数据域</span>
              <span>当前规模</span>
              <span>用途</span>
            </div>
            <div v-for="row in maintenanceRows" :key="row.label" class="admin-table__row">
              <span>{{ row.label }}</span>
              <span>{{ row.value }}</span>
              <span>{{ row.note }}</span>
            </div>
          </div>

          <div class="maintenance-actions">
            <button type="button" :disabled="isActionRunning()" @click="handleRefreshAll">
              {{ isActionRunning('refresh') ? '刷新中' : '刷新全部数据' }}
            </button>
            <button type="button" class="is-danger" :disabled="isActionRunning()" @click="handleResetOrders">
              {{ isActionRunning('orders:reset') ? '重置中' : pendingResetOrders ? '确认重置订单' : '恢复订单种子数据' }}
            </button>
            <button type="button" class="is-danger" :disabled="isActionRunning()" @click="handleResetDatabase">
              {{ isActionRunning('database:reset') ? '重置中' : pendingResetDatabase ? '确认重置整库' : '恢复全部种子数据' }}
            </button>
            <button
              v-if="pendingResetOrders || pendingResetDatabase"
              type="button"
              :disabled="isActionRunning()"
              @click="handleCancelPendingResets"
            >
              放弃
            </button>
          </div>
        </article>
      </section>

      <Transition name="admin-drawer">
        <aside
          v-if="editorIsOpen"
          class="admin-editor-drawer"
          role="dialog"
          aria-modal="false"
          :aria-label="editorTitle"
        >
          <div class="admin-editor-drawer__bar">
            <div>
              <span>{{ editorKicker }}</span>
              <h2>{{ editorTitle }}</h2>
              <p>{{ editorContext }}</p>
            </div>
            <button type="button" aria-label="关闭编辑器" :disabled="isActionRunning()" @click="closeAnyEditor">×</button>
          </div>

          <label v-if="activeEditorKind && activeEditorKind !== 'user'" class="admin-editor-drawer__continue">
            <input v-model="keepCreating" type="checkbox" :disabled="activeEditorKind === null || isActionRunning()" />
            <span>保存后继续新增同类项目</span>
          </label>

          <ScenicSpotForm
            v-if="spotEditor"
            :key="`spot-${editorRevision}`"
            :mode="spotEditor.mode"
            :value="spotEditor.spot ?? null"
            :submitting="isActionRunning('spot:save')"
            @submit="handleSaveSpot"
            @cancel="closeSpotEditor"
          />

          <TicketTypeForm
            v-else-if="ticketEditor"
            :key="`ticket-${editorRevision}`"
            :mode="ticketEditor.mode"
            :value="ticketEditor.ticket ?? null"
            :spots="scenicSpots"
            :default-spot-id="ticketEditor.spotId"
            :submitting="isActionRunning('ticket:save')"
            @submit="handleSaveTicket"
            @cancel="closeTicketEditor"
          />

          <BookingSlotForm
            v-else-if="slotEditor"
            :key="`slot-${editorRevision}`"
            :mode="slotEditor.mode"
            :value="slotEditor.slot ?? null"
            :spots="scenicSpots"
            :default-spot-id="slotEditor.spotId"
            :submitting="isActionRunning('slot:save')"
            @submit="handleSaveSlot"
            @cancel="closeSlotEditor"
          />

          <form
            v-else-if="userEditor"
            :key="`user-${editorRevision}`"
            class="entity-form"
            @submit.prevent="handleSaveUser"
          >
            <header>
              <p>{{ userEditor.mode === 'create' ? '新增账号' : `编辑 ${userEditor.user?.username ?? ''}` }}</p>
              <small>Access Control</small>
            </header>
            <div class="entity-form__grid">
              <label>
                <span>用户名</span>
                <input v-model="userDraft.username" type="text" autocomplete="off" required />
              </label>
              <label>
                <span>显示名称</span>
                <input v-model="userDraft.displayName" type="text" required />
              </label>
              <label>
                <span>角色</span>
                <select v-model="userDraft.role">
                  <option value="管理员">管理员</option>
                  <option value="普通用户">普通用户</option>
                </select>
              </label>
              <label>
                <span>状态</span>
                <select v-model="userDraft.status">
                  <option value="启用">启用</option>
                  <option value="停用">停用</option>
                </select>
              </label>
              <label>
                <span>头像色</span>
                <input v-model="userDraft.avatarColor" type="color" />
              </label>
              <label>
                <span>手机号</span>
                <input v-model="userDraft.phoneMasked" type="text" placeholder="如：138****2026" required />
              </label>
              <label class="entity-form__wide">
                <span>{{ userEditor.mode === 'create' ? '初始密码' : '重置密码' }}</span>
                <input
                  v-model="userDraft.password"
                  type="password"
                  :required="userEditor.mode === 'create'"
                  placeholder="至少8位，含字母和数字；编辑时留空则不修改"
                />
              </label>
            </div>
            <label v-if="userEditor.mode === 'create'" class="admin-editor-drawer__continue">
              <input v-model="keepCreating" type="checkbox" :disabled="isActionRunning('user:save')" />
              <span>保存后继续新增账号</span>
            </label>
            <div class="entity-form__actions">
              <button
                type="button"
                class="entity-form__cancel"
                :disabled="isActionRunning('user:save')"
                @click="closeUserEditor"
              >
                取消
              </button>
              <button type="submit" class="entity-form__submit" :disabled="!userDraftIsValid || isActionRunning('user:save')">
                {{ isActionRunning('user:save') ? '保存中' : userEditor.mode === 'create' ? '创建账号' : '保存账号' }}
              </button>
            </div>
          </form>
        </aside>
      </Transition>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.admin-page {
  background:
    radial-gradient(circle at 82% 12%, rgba(127, 156, 141, 0.1), transparent 26%),
    var(--paper-light);
  color: var(--ink);
}

.admin-hero,
.admin-metrics,
.admin-toolbar,
.admin-grid,
.admin-manage {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.admin-hero {
  padding-top: clamp(80px, 12vw, 140px);
  padding-bottom: clamp(42px, 6vw, 72px);
}

.admin-hero__meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: clamp(34px, 5vw, 56px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.admin-hero h1 {
  font-family: var(--font-serif);
  font-size: clamp(44px, 6vw, 86px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
}

.admin-hero p {
  max-width: 38rem;
  margin-top: 24px;
  color: rgba(16, 20, 18, 0.62);
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.2vw, 20px);
  letter-spacing: 0.04em;
  line-height: 1.85;
}

.admin-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.admin-hero__actions a {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  color: var(--deep-green);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.admin-command-strip {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(20px, 3vw, 48px) clamp(26px, 4vw, 44px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: stretch;
}

.admin-identity,
.admin-quick-actions {
  border: 1px solid rgba(16, 20, 18, 0.09);
  background: rgba(250, 247, 240, 0.78);
}

.admin-identity {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
}

.admin-identity__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--westlake-green);
  box-shadow: 0 0 0 6px rgba(127, 156, 141, 0.13);
}

.admin-identity p {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 18px;
  letter-spacing: 0.06em;
}

.admin-identity small {
  color: rgba(16, 20, 18, 0.48);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.admin-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  padding: 1px;
  background: rgba(16, 20, 18, 0.08);
}

.admin-quick-actions button {
  min-height: 100%;
  border: 0;
  background: rgba(250, 247, 240, 0.9);
  color: rgba(16, 20, 18, 0.62);
  cursor: pointer;
  padding: 12px 14px;
  font-size: 11px;
  letter-spacing: 0.2em;
  transition: background 180ms ease, color 180ms ease;
}

.admin-quick-actions button:first-child {
  background: var(--deep-green);
  color: var(--paper-light);
}

.admin-quick-actions button:hover:not(:disabled),
.admin-quick-actions button:focus-visible {
  background: rgba(232, 239, 233, 0.94);
  color: var(--deep-green);
  outline: none;
}

.admin-quick-actions button:first-child:hover:not(:disabled),
.admin-quick-actions button:first-child:focus-visible {
  background: #16302b;
  color: var(--paper-light);
}

.admin-quick-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}

.admin-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1px;
  padding-bottom: clamp(30px, 5vw, 58px);
}

.admin-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding-bottom: clamp(30px, 4vw, 54px);
}

.admin-tabs,
.admin-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
}

.admin-tabs button,
.admin-tools button,
.admin-row-actions button {
  border: 1px solid rgba(16, 20, 18, 0.09);
  background: rgba(250, 247, 240, 0.84);
  color: rgba(16, 20, 18, 0.58);
  cursor: pointer;
  padding: 10px 13px;
  font-size: 11px;
  letter-spacing: 0.22em;
  transition: background 180ms ease, color 180ms ease;
}

.admin-tabs button:disabled,
.admin-tools button:disabled,
.admin-row-actions button:disabled,
.maintenance-actions button:disabled {
  cursor: wait;
  opacity: 0.48;
}

.admin-tabs button.is-active,
.admin-tabs button:hover:not(:disabled),
.admin-tabs button:focus-visible,
.admin-tools button:hover:not(:disabled),
.admin-tools button:focus-visible,
.admin-row-actions button:hover:not(:disabled),
.admin-row-actions button:focus-visible {
  background: rgba(232, 239, 233, 0.94);
  color: var(--deep-green);
  outline: none;
}

.admin-tools button.is-danger,
.admin-row-actions button.is-danger {
  color: rgba(138, 106, 79, 0.82);
}

.admin-row-actions button.is-danger:hover:not(:disabled),
.admin-row-actions button.is-danger:focus-visible {
  background: rgba(232, 220, 208, 0.94);
  color: rgba(138, 106, 79, 1);
}

.admin-metrics article {
  padding: clamp(22px, 3vw, 34px);
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(250, 247, 240, 0.9);
}

.admin-metrics span,
.admin-panel header span,
.admin-list small,
.admin-orders small {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.admin-metrics strong {
  display: block;
  margin-top: 18px;
  font-family: var(--font-serif);
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 400;
  letter-spacing: 0.06em;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  padding-bottom: 18px;
}

.admin-manage {
  padding-bottom: clamp(86px, 11vw, 150px);
}

.admin-manage--inline {
  padding-bottom: 18px;
}

.admin-panel {
  padding: clamp(24px, 3vw, 38px);
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(250, 247, 240, 0.9);
}

.admin-panel--wide {
  grid-column: 1 / -1;
}

.admin-panel header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 16px;
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.09);
}

.admin-panel header p {
  font-family: var(--font-serif);
  font-size: 24px;
  letter-spacing: 0.06em;
}

.admin-error p {
  color: rgba(138, 106, 79, 0.88);
  font-size: 13px;
  letter-spacing: 0.04em;
}

.admin-feedback {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.admin-feedback p {
  margin: 0;
  color: rgba(16, 20, 18, 0.68);
  font-size: 13px;
  letter-spacing: 0.04em;
}

.admin-feedback button {
  flex: 0 0 auto;
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: transparent;
  color: var(--deep-green);
  cursor: pointer;
  padding: 8px 12px;
  font-size: 10px;
  letter-spacing: 0.22em;
}

.admin-feedback--success {
  border-color: rgba(89, 124, 103, 0.22);
  background: rgba(232, 239, 233, 0.9);
}

.admin-feedback--info {
  border-color: rgba(16, 20, 18, 0.1);
}

.admin-feedback--warning {
  border-color: rgba(138, 106, 79, 0.28);
  background: rgba(244, 235, 224, 0.88);
}

.admin-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-list li,
.admin-orders div {
  display: grid;
  gap: 6px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.admin-list span,
.admin-orders strong {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.05em;
}

.admin-orders {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.admin-orders span {
  color: rgba(16, 20, 18, 0.44);
  font-size: 11px;
  letter-spacing: 0.24em;
}

.admin-orders button {
  justify-self: start;
  border: 0;
  background: transparent;
  color: var(--deep-green);
  cursor: pointer;
  padding: 0;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.admin-controls {
  display: grid;
  grid-template-columns: minmax(13rem, 0.35fr) minmax(0, 1fr);
  gap: 1px;
  margin-bottom: 18px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.admin-controls--three {
  grid-template-columns: minmax(12rem, 0.28fr) minmax(16rem, 1fr) minmax(10rem, 0.24fr);
}

.admin-controls label {
  display: grid;
  gap: 10px;
  padding: 14px;
  background: rgba(250, 247, 240, 0.9);
}

.admin-controls span {
  color: rgba(16, 20, 18, 0.42);
  font-size: 10px;
  letter-spacing: 0.26em;
}

.admin-controls input,
.admin-controls select {
  width: 100%;
  min-width: 0;
  border: 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.14);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-size: 14px;
  outline: none;
}

.admin-controls__add button {
  justify-self: start;
  align-self: start;
  border: 1px solid var(--deep-green);
  background: var(--deep-green);
  color: var(--paper-light);
  cursor: pointer;
  padding: 10px 18px;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  transition: opacity 180ms ease;
}

.admin-controls__add button:hover:not(:disabled),
.admin-controls__add button:focus-visible {
  opacity: 0.88;
  outline: none;
}

.admin-controls__add button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.admin-editor-anchor {
  scroll-margin-top: 92px;
}

.admin-editor-drawer {
  position: fixed;
  z-index: 60;
  top: clamp(18px, 3vw, 32px);
  right: clamp(18px, 3vw, 32px);
  bottom: clamp(18px, 3vw, 32px);
  width: min(560px, calc(100vw - 36px));
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  background:
    linear-gradient(180deg, rgba(250, 247, 240, 0.98), rgba(244, 239, 230, 0.98));
  box-shadow: 0 30px 82px rgba(16, 20, 18, 0.2);
  overflow: auto;
}

.admin-editor-drawer__bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.09);
}

.admin-editor-drawer__bar span {
  color: rgba(16, 20, 18, 0.42);
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.admin-editor-drawer__bar h2 {
  margin: 6px 0 8px;
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.06em;
}

.admin-editor-drawer__bar p {
  margin: 0;
  color: rgba(16, 20, 18, 0.52);
  font-size: 12px;
  letter-spacing: 0.04em;
  line-height: 1.6;
}

.admin-editor-drawer__bar button {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  border-radius: 50%;
  background: rgba(250, 247, 240, 0.8);
  color: rgba(16, 20, 18, 0.54);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.admin-editor-drawer__bar button:hover:not(:disabled),
.admin-editor-drawer__bar button:focus-visible {
  color: var(--deep-green);
  outline: none;
}

.admin-editor-drawer__continue {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: rgba(16, 20, 18, 0.62);
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.admin-editor-drawer :deep(.entity-form) {
  margin-bottom: 0;
  padding: 0;
  border: 0;
  background: transparent;
}

.admin-editor-drawer :deep(.entity-form header) {
  display: none;
}

.admin-editor-drawer :deep(.entity-form__grid) {
  grid-template-columns: 1fr 1fr;
}

.admin-drawer-enter-active,
.admin-drawer-leave-active {
  transition: opacity 180ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.admin-drawer-enter-from,
.admin-drawer-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.admin-controls__readonly {
  color: rgba(16, 20, 18, 0.46);
  font-size: 13px;
  letter-spacing: 0.04em;
}

.admin-table {
  display: grid;
  border-top: 1px solid rgba(16, 20, 18, 0.1);
}

.admin-table__head,
.admin-table__row {
  display: grid;
  gap: 16px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.admin-table__head {
  color: rgba(16, 20, 18, 0.42);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.admin-table__row {
  color: rgba(16, 20, 18, 0.66);
  font-size: 13px;
  letter-spacing: 0.04em;
  line-height: 1.6;
}

.admin-table__row > span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.admin-table__row strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.05em;
}

.admin-table__row small {
  display: block;
  color: rgba(16, 20, 18, 0.42);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.admin-table--orders .admin-table__head,
.admin-table--orders .admin-table__row {
  grid-template-columns: minmax(9rem, 1fr) minmax(9rem, 0.9fr) minmax(10rem, 1fr) 70px 70px minmax(12rem, 0.9fr);
}

.admin-table--capacity .admin-table__head,
.admin-table--capacity .admin-table__row {
  grid-template-columns:
    minmax(9rem, 1fr)
    minmax(6rem, 0.6fr)
    minmax(6rem, 0.6fr)
    minmax(4rem, 0.4fr)
    minmax(4rem, 0.4fr)
    minmax(6rem, 0.5fr)
    minmax(11rem, 0.9fr);
}

.admin-table--spots .admin-table__head,
.admin-table--spots .admin-table__row {
  grid-template-columns:
    minmax(10rem, 1.1fr)
    minmax(6rem, 0.65fr)
    minmax(6rem, 0.65fr)
    minmax(7rem, 0.7fr)
    minmax(4rem, 0.4fr)
    minmax(4rem, 0.4fr)
    minmax(14rem, 1fr);
}

.admin-table--tickets .admin-table__head,
.admin-table--tickets .admin-table__row {
  grid-template-columns:
    minmax(8rem, 0.8fr)
    minmax(9rem, 0.9fr)
    minmax(6rem, 0.4fr)
    minmax(9rem, 0.9fr)
    minmax(11rem, 0.8fr);
}

.admin-table--users .admin-table__head,
.admin-table--users .admin-table__row {
  grid-template-columns:
    minmax(10rem, 1fr)
    minmax(5rem, 0.45fr)
    minmax(5rem, 0.45fr)
    minmax(7rem, 0.6fr)
    minmax(9rem, 0.8fr)
    minmax(10rem, 0.8fr);
}

.admin-table--audit .admin-table__head,
.admin-table--audit .admin-table__row {
  grid-template-columns:
    minmax(8rem, 0.75fr)
    minmax(8rem, 0.75fr)
    minmax(7rem, 0.55fr)
    minmax(11rem, 1fr)
    minmax(14rem, 1.2fr);
}

.admin-table--maintenance .admin-table__head,
.admin-table--maintenance .admin-table__row {
  grid-template-columns:
    minmax(10rem, 0.9fr)
    minmax(8rem, 0.6fr)
    minmax(14rem, 1.4fr);
}

.admin-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.admin-row-actions button {
  padding: 7px 9px;
  letter-spacing: 0.16em;
}

.database-meta {
  display: grid;
  gap: 8px;
  padding: 16px;
  margin-bottom: 18px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(244, 239, 230, 0.52);
}

.database-meta p,
.database-relations > p {
  font-family: var(--font-serif);
  font-size: 20px;
  letter-spacing: 0.06em;
}

.database-meta small,
.database-table > p,
.database-table dd,
.database-relations span {
  color: rgba(16, 20, 18, 0.56);
  font-size: 12px;
  letter-spacing: 0.05em;
  line-height: 1.75;
}

.audit-panel {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(16, 20, 18, 0.09);
}

.audit-panel header {
  margin-bottom: 10px;
}

.maintenance-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.maintenance-actions button {
  border: 1px solid rgba(16, 20, 18, 0.09);
  background: rgba(250, 247, 240, 0.84);
  color: rgba(16, 20, 18, 0.62);
  cursor: pointer;
  padding: 10px 13px;
  font-size: 11px;
  letter-spacing: 0.22em;
}

.maintenance-actions button:hover:not(:disabled),
.maintenance-actions button:focus-visible {
  background: rgba(232, 239, 233, 0.94);
  color: var(--deep-green);
  outline: none;
}

.maintenance-actions button.is-danger {
  color: rgba(138, 106, 79, 0.82);
}

.database-schema {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.database-table {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid rgba(16, 20, 18, 0.09);
  background: rgba(250, 247, 240, 0.72);
}

.database-table header {
  padding: 0 0 12px;
  margin: 0;
}

.database-table header p {
  margin-bottom: 4px;
  font-size: 18px;
}

.database-table header strong {
  color: rgba(16, 20, 18, 0.44);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.24em;
}

.database-table dl {
  display: grid;
  gap: 0;
  margin: 0;
  border-top: 1px solid rgba(16, 20, 18, 0.08);
}

.database-table dl div,
.database-relations div {
  display: grid;
  gap: 5px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.database-table dt,
.database-relations strong {
  color: rgba(16, 20, 18, 0.7);
  font-family: var(--font-serif);
  font-size: 14px;
  letter-spacing: 0.04em;
}

@media (max-width: 1180px) {
  .admin-command-strip {
    grid-template-columns: 1fr;
  }

  .admin-quick-actions {
    justify-content: stretch;
  }

  .admin-quick-actions button {
    flex: 1 1 120px;
  }

  .admin-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .admin-grid,
  .database-schema {
    grid-template-columns: 1fr;
  }

  .admin-orders {
    grid-template-columns: 1fr;
  }

  .admin-table__head {
    display: none;
  }

  .admin-table__row {
    grid-template-columns: 1fr !important;
    gap: 6px;
    padding: 18px 0;
  }

  .admin-table__row > span {
    font-size: 12px;
  }

  .admin-row-actions {
    margin-top: 6px;
  }
}

@media (max-width: 720px) {
  .admin-hero,
  .admin-command-strip,
  .admin-metrics,
  .admin-toolbar,
  .admin-grid,
  .admin-manage {
    padding-inline: 18px;
  }

  .admin-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-toolbar {
    grid-template-columns: 1fr;
  }

  .admin-controls {
    grid-template-columns: 1fr;
  }

  .admin-feedback {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-editor-drawer {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    width: auto;
    max-height: 88vh;
    border-right: 0;
    border-bottom: 0;
  }

  .admin-editor-drawer :deep(.entity-form__grid) {
    grid-template-columns: 1fr;
  }

  .admin-drawer-enter-from,
  .admin-drawer-leave-to {
    transform: translateY(24px);
  }
}
</style>
