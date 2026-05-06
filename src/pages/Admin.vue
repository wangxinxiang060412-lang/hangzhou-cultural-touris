<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BookingSlotForm from '../components/admin/BookingSlotForm.vue'
import ScenicSpotForm from '../components/admin/ScenicSpotForm.vue'
import TicketTypeForm from '../components/admin/TicketTypeForm.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { databaseMeta, databaseRelations, databaseTables } from '../data/database'
import type { BookingOrder, BookingOrderStatus } from '../data/mockOrders'
import {
  createBookingSlot,
  createScenicSpot,
  createTicketType,
  deleteBookingSlot,
  deleteOrder,
  deleteScenicSpot,
  deleteTicketType,
  resetDatabase as resetDatabaseRequest,
  resetOrders,
  updateBookingSlot,
  updateOrderStatus,
  updateScenicSpot,
  updateTicketType,
} from '../services/api'
import type {
  ApiBookingSlot,
  ApiScenicSpot,
  ApiTicketType,
  BookingSlotInput,
  ScenicSpotInput,
  TicketTypeInput,
} from '../services/api'
import {
  bookingSlots,
  catalogError,
  orders,
  refreshAll,
  refreshBookingSlots,
  refreshOrders as refreshOrdersStore,
  refreshScenicSpots,
  refreshTicketTypes,
  scenicSpots,
  ticketTypes,
} from '../stores/catalog'
import { getOrderVisitorCount } from '../utils/bookingOrders'
import { formatLocalDate } from '../utils/date'

type AdminPanelId = 'orders' | 'capacity' | 'spots' | 'tickets' | 'database'

type SlotEditor = { mode: 'create' | 'edit'; spotId?: string; slot?: ApiBookingSlot | null } | null
type SpotEditor = { mode: 'create' | 'edit'; spot?: ApiScenicSpot | null } | null
type TicketEditor = { mode: 'create' | 'edit'; spotId?: string; ticket?: ApiTicketType | null } | null

const today = formatLocalDate(new Date())

const activePanel = ref<AdminPanelId>('orders')
const adminPanels: Array<{ id: AdminPanelId; label: string }> = [
  { id: 'orders', label: '订单管理' },
  { id: 'capacity', label: '时段管理' },
  { id: 'spots', label: '景点管理' },
  { id: 'tickets', label: '票种管理' },
  { id: 'database', label: '数据模型' },
]

const selectedOrderStatus = ref<'全部' | BookingOrderStatus>('全部')
const orderSearch = ref('')
const selectedTicketSpotId = ref('全部')
const selectedCapacitySpotId = ref('全部')
const pendingResetOrders = ref(false)
const pendingResetDatabase = ref(false)
const pendingDeleteId = ref('')
const actionError = ref('')

const spotEditor = ref<SpotEditor>(null)
const ticketEditor = ref<TicketEditor>(null)
const slotEditor = ref<SlotEditor>(null)

const activeOrders = computed(() => orders.value.filter((order) => order.status !== '已取消'))
const visibleTodayReservations = computed(
  () => activeOrders.value.filter((order) => order.createdAt.startsWith(today)).length,
)
const pendingVerify = computed(() => orders.value.filter((order) => order.status === '待出行').length)
const completedOrders = computed(() => orders.value.filter((order) => order.status === '已完成').length)
const canceledOrders = computed(() => orders.value.filter((order) => order.status === '已取消').length)

const managedOrders = computed(() => {
  const query = orderSearch.value.trim().toLowerCase()

  return orders.value.filter((order) => {
    const matchesStatus =
      selectedOrderStatus.value === '全部' || order.status === selectedOrderStatus.value
    const matchesQuery =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.spotName.toLowerCase().includes(query) ||
      order.qrCodeText.toLowerCase().includes(query)

    return matchesStatus && matchesQuery
  })
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

const wrap = async (task: () => Promise<void>) => {
  try {
    actionError.value = ''
    await task()
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : '操作失败'
  }
}

const cancelPendingResets = () => {
  pendingResetOrders.value = false
  pendingResetDatabase.value = false
}

const setActivePanel = (panel: AdminPanelId) => {
  activePanel.value = panel
  spotEditor.value = null
  ticketEditor.value = null
  slotEditor.value = null
  pendingDeleteId.value = ''
  cancelPendingResets()
  actionError.value = ''
}

const beginRemove = (id: string) => {
  pendingDeleteId.value = id
}

const confirmRemove = (id: string) => pendingDeleteId.value === id

const cancelRemove = () => {
  pendingDeleteId.value = ''
}

const handleVerifyOrder = (order: BookingOrder) => {
  cancelRemove()
  return wrap(async () => {
    if (order.status !== '待出行') return
    await updateOrderStatus(order.id, '已完成')
    await refreshOrdersStore()
  })
}

const handleCancelOrder = (order: BookingOrder) => {
  cancelRemove()
  return wrap(async () => {
    if (order.status !== '待出行') return
    await updateOrderStatus(order.id, '已取消')
    await refreshAll()
  })
}

const handleRestoreOrder = (order: BookingOrder) => {
  cancelRemove()
  return wrap(async () => {
    if (order.status !== '已取消') return
    await updateOrderStatus(order.id, '待出行')
    await refreshAll()
  })
}

const handleDeleteOrder = (order: BookingOrder) => {
  if (!confirmRemove(order.id)) {
    beginRemove(order.id)
    return
  }

  void wrap(async () => {
    await deleteOrder(order.id)
    cancelRemove()
    await refreshAll()
  })
}

const handleResetOrders = () => {
  if (!pendingResetOrders.value) {
    pendingResetDatabase.value = false
    pendingResetOrders.value = true
    return
  }

  void wrap(async () => {
    await resetOrders()
    pendingResetOrders.value = false
    await refreshAll()
  })
}

const handleResetDatabase = () => {
  if (!pendingResetDatabase.value) {
    pendingResetOrders.value = false
    pendingResetDatabase.value = true
    return
  }

  void wrap(async () => {
    await resetDatabaseRequest()
    pendingResetDatabase.value = false
    await refreshAll()
  })
}

const openCreateSpot = () => {
  cancelRemove()
  spotEditor.value = { mode: 'create', spot: null }
}

const openEditSpot = (spot: ApiScenicSpot) => {
  cancelRemove()
  spotEditor.value = { mode: 'edit', spot }
}

const closeSpotEditor = () => {
  spotEditor.value = null
}

const handleSaveSpot = (payload: ScenicSpotInput) => {
  const editor = spotEditor.value
  if (!editor) return

  void wrap(async () => {
    if (editor.mode === 'create') {
      await createScenicSpot(payload)
    } else if (editor.spot) {
      await updateScenicSpot(editor.spot.id, payload)
    }
    closeSpotEditor()
    await refreshScenicSpots()
  })
}

const handleDeleteSpot = (spot: ApiScenicSpot) => {
  if (!confirmRemove(spot.id)) {
    beginRemove(spot.id)
    return
  }

  void wrap(async () => {
    await deleteScenicSpot(spot.id)
    cancelRemove()
    await refreshAll()
  })
}

const openCreateTicket = (spotId?: string) => {
  cancelRemove()
  ticketEditor.value = { mode: 'create', spotId, ticket: null }
}

const openEditTicket = (ticket: ApiTicketType) => {
  cancelRemove()
  ticketEditor.value = { mode: 'edit', ticket }
}

const closeTicketEditor = () => {
  ticketEditor.value = null
}

const handleSaveTicket = (payload: TicketTypeInput) => {
  const editor = ticketEditor.value
  if (!editor) return

  void wrap(async () => {
    if (editor.mode === 'create') {
      await createTicketType(payload)
    } else if (editor.ticket) {
      await updateTicketType(editor.ticket.id, payload)
    }
    closeTicketEditor()
    await refreshTicketTypes()
  })
}

const handleDeleteTicket = (ticket: ApiTicketType) => {
  if (!confirmRemove(ticket.id)) {
    beginRemove(ticket.id)
    return
  }

  void wrap(async () => {
    await deleteTicketType(ticket.id)
    cancelRemove()
    await refreshTicketTypes()
  })
}

const openCreateSlot = (spotId?: string) => {
  cancelRemove()
  slotEditor.value = { mode: 'create', spotId, slot: null }
}

const openEditSlot = (slot: ApiBookingSlot) => {
  cancelRemove()
  slotEditor.value = { mode: 'edit', slot }
}

const closeSlotEditor = () => {
  slotEditor.value = null
}

const handleSaveSlot = (payload: BookingSlotInput) => {
  const editor = slotEditor.value
  if (!editor) return

  void wrap(async () => {
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
    closeSlotEditor()
    await refreshBookingSlots()
  })
}

const handleDeleteSlot = (slot: ApiBookingSlot) => {
  if (!confirmRemove(slot.id)) {
    beginRemove(slot.id)
    return
  }

  void wrap(async () => {
    await deleteBookingSlot(slot.id)
    cancelRemove()
    await refreshBookingSlots()
  })
}

const errorMessage = computed(() => actionError.value || catalogError.value)

onMounted(() => {
  void refreshAll()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="admin-page" tabindex="-1">
      <section class="admin-hero" aria-labelledby="admin-title" data-reveal>
        <div class="admin-hero__meta">
          <span>票务管理后台</span>
          <span>CRUD Dashboard</span>
        </div>

        <h1 id="admin-title">票务管理</h1>
        <p>后台与后端 API + SQLite 同步，可直接新增、修改、删除景点 / 票种 / 时段 / 订单，所有操作实时写入数据库。</p>

        <div class="admin-hero__actions">
          <RouterLink to="/scenic-spots">查看前台预约</RouterLink>
          <RouterLink to="/orders">查看预约记录</RouterLink>
          <RouterLink to="/">回到首页</RouterLink>
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
            @click="setActivePanel(panel.id)"
          >
            {{ panel.label }}
          </button>
        </div>

        <div class="admin-tools">
          <button type="button" @click="refreshAll">刷新</button>
          <button type="button" class="is-danger" @click="handleResetOrders">
            {{ pendingResetOrders ? '确认重置订单' : '重置订单表' }}
          </button>
          <button type="button" class="is-danger" @click="handleResetDatabase">
            {{ pendingResetDatabase ? '确认重置数据库' : '重置整库' }}
          </button>
          <button
            v-if="pendingResetOrders || pendingResetDatabase"
            type="button"
            @click="cancelPendingResets"
          >
            放弃
          </button>
        </div>
      </section>

      <section v-if="errorMessage" class="admin-manage admin-manage--inline" data-reveal>
        <article class="admin-panel admin-panel--wide admin-error">
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
              <button v-if="order.status === '待出行'" type="button" @click="handleVerifyOrder(order)">核销</button>
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
        <article v-if="activePanel === 'orders'" class="admin-panel admin-panel--wide">
          <header>
            <p>订单管理</p>
            <span>{{ managedOrders.length }} Records</span>
          </header>

          <div class="admin-controls">
            <label>
              <span>状态</span>
              <select v-model="selectedOrderStatus">
                <option>全部</option>
                <option>待出行</option>
                <option>已完成</option>
                <option>已取消</option>
              </select>
            </label>
            <label>
              <span>检索</span>
              <input v-model="orderSearch" type="search" placeholder="预约编号 / 景点 / 核销码" />
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
                <button v-if="order.status === '待出行'" type="button" @click="handleVerifyOrder(order)">核销</button>
                <button v-if="order.status === '待出行'" type="button" @click="handleCancelOrder(order)">取消</button>
                <button v-if="order.status === '已取消'" type="button" @click="handleRestoreOrder(order)">恢复</button>
                <button type="button" class="is-danger" @click="handleDeleteOrder(order)">
                  {{ confirmRemove(order.id) ? '确认删除' : '删除' }}
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

        <article v-else-if="activePanel === 'capacity'" class="admin-panel admin-panel--wide">
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
              <button type="button" @click="openCreateSlot(selectedCapacitySpotId === '全部' ? undefined : selectedCapacitySpotId)">
                + 新增时段
              </button>
            </label>
          </div>

          <BookingSlotForm
            v-if="slotEditor"
            :mode="slotEditor.mode"
            :value="slotEditor.slot ?? null"
            :spots="scenicSpots"
            :default-spot-id="slotEditor.spotId"
            @submit="handleSaveSlot"
            @cancel="closeSlotEditor"
          />

          <div class="admin-table admin-table--capacity">
            <div class="admin-table__head">
              <span>景点</span>
              <span>日期</span>
              <span>时段</span>
              <span>基础已约</span>
              <span>数据库占用</span>
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
                <button type="button" @click="openEditSlot(slot)">编辑</button>
                <button type="button" class="is-danger" @click="handleDeleteSlot(slot)">
                  {{ confirmRemove(slot.id) ? '确认删除' : '删除' }}
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

        <article v-else-if="activePanel === 'spots'" class="admin-panel admin-panel--wide">
          <header>
            <p>景点管理</p>
            <span>{{ scenicSpots.length }} Scenic Spots</span>
          </header>

          <div class="admin-controls">
            <label class="admin-controls__add">
              <span>新增</span>
              <button type="button" @click="openCreateSpot">+ 新增景点</button>
            </label>
            <label>
              <span>关联时段</span>
              <span class="admin-controls__readonly">共 {{ bookingSlots.length }} 个时段</span>
            </label>
          </div>

          <ScenicSpotForm
            v-if="spotEditor"
            :mode="spotEditor.mode"
            :value="spotEditor.spot ?? null"
            @submit="handleSaveSpot"
            @cancel="closeSpotEditor"
          />

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
                <button type="button" @click="openEditSpot(spot)">编辑</button>
                <button type="button" @click="openCreateTicket(spot.id)">+票种</button>
                <button type="button" @click="openCreateSlot(spot.id)">+时段</button>
                <button type="button" class="is-danger" @click="handleDeleteSpot(spot)">
                  {{ confirmRemove(spot.id) ? '确认删除' : '删除' }}
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

        <article v-else-if="activePanel === 'tickets'" class="admin-panel admin-panel--wide">
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
                :disabled="scenicSpots.length === 0"
                @click="openCreateTicket(selectedTicketSpotId === '全部' ? undefined : selectedTicketSpotId)"
              >
                + 新增票种
              </button>
            </label>
          </div>

          <TicketTypeForm
            v-if="ticketEditor"
            :mode="ticketEditor.mode"
            :value="ticketEditor.ticket ?? null"
            :spots="scenicSpots"
            :default-spot-id="ticketEditor.spotId"
            @submit="handleSaveTicket"
            @cancel="closeTicketEditor"
          />

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
                <button type="button" @click="openEditTicket(ticket)">编辑</button>
                <button type="button" class="is-danger" @click="handleDeleteTicket(ticket)">
                  {{ confirmRemove(ticket.id) ? '确认删除' : '删除' }}
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

        <article v-else class="admin-panel admin-panel--wide">
          <header>
            <p>数据模型</p>
            <span>{{ databaseMeta.version }} · {{ databaseMeta.persistence }}</span>
          </header>

          <div class="database-meta">
            <p>{{ databaseMeta.name }}</p>
            <small>{{ databaseMeta.note }}</small>
            <small>Storage Key · {{ databaseMeta.storageKey }}</small>
          </div>

          <div class="database-schema">
            <article v-for="table in databaseTables" :key="table.id" class="database-table">
              <header>
                <div>
                  <p>{{ table.title }}</p>
                  <strong>{{ table.name }}</strong>
                </div>
                <span>{{ table.source }}</span>
              </header>
              <p>{{ table.description }}</p>
              <dl>
                <div v-for="field in table.fields" :key="field.name">
                  <dt>{{ field.name }}</dt>
                  <dd>{{ field.type }} · {{ field.note }}</dd>
                </div>
              </dl>
            </article>
          </div>

          <div class="database-relations">
            <p>关系</p>
            <div v-for="relation in databaseRelations" :key="`${relation.from}-${relation.to}`">
              <strong>{{ relation.from }} → {{ relation.to }}</strong>
              <span>{{ relation.note }}</span>
            </div>
          </div>
        </article>
      </section>
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

.admin-tabs button.is-active,
.admin-tabs button:hover,
.admin-tabs button:focus-visible,
.admin-tools button:hover,
.admin-tools button:focus-visible,
.admin-row-actions button:hover,
.admin-row-actions button:focus-visible {
  background: rgba(232, 239, 233, 0.94);
  color: var(--deep-green);
  outline: none;
}

.admin-tools button.is-danger,
.admin-row-actions button.is-danger {
  color: rgba(138, 106, 79, 0.82);
}

.admin-row-actions button.is-danger:hover,
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
}
</style>
