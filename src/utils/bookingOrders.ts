import type { BookingOrder, BookingOrderStatus } from '../types/booking'

export const ORDER_STATUS = {
  pending: '待出行',
  completed: '已完成',
  canceled: '已取消',
} as const satisfies Record<string, BookingOrderStatus>

export const ORDER_STATUS_ALL = '全部'

export const ORDER_STATUS_OPTIONS: BookingOrderStatus[] = [
  ORDER_STATUS.pending,
  ORDER_STATUS.completed,
  ORDER_STATUS.canceled,
]

export type OrderStatusFilter = typeof ORDER_STATUS_ALL | BookingOrderStatus

type OrderStatusSource = BookingOrder | BookingOrderStatus

const readOrderStatus = (source: OrderStatusSource) =>
  typeof source === 'string' ? source : source.status

// 订单状态集中放在这里，页面和服务层都复用同一套判断，答辩时可说明这是为了避免状态字面量散落。
export const isPendingOrder = (source: OrderStatusSource) =>
  readOrderStatus(source) === ORDER_STATUS.pending

export const isCompletedOrder = (source: OrderStatusSource) =>
  readOrderStatus(source) === ORDER_STATUS.completed

export const isCanceledOrder = (source: OrderStatusSource) =>
  readOrderStatus(source) === ORDER_STATUS.canceled

export const getActiveOrders = <T extends BookingOrder>(orders: T[]) =>
  orders.filter((order) => !isCanceledOrder(order))

export const filterOrdersByStatus = <T extends BookingOrder>(
  orders: T[],
  selectedStatus: OrderStatusFilter,
) =>
  selectedStatus === ORDER_STATUS_ALL
    ? orders
    : orders.filter((order) => order.status === selectedStatus)

export const countOrdersByStatus = (
  orders: BookingOrder[],
  status: BookingOrderStatus,
) => orders.filter((order) => order.status === status).length

export const getOrderVisitorCount = (order: BookingOrder) => {
  if (typeof order.visitorCount === 'number' && Number.isFinite(order.visitorCount)) {
    return Math.max(order.visitorCount, 1)
  }

  // 兼容早期 mock 数据里“同行 N 人”的文本格式，避免旧订单在人次统计中被漏算。
  const companionEntry = order.visitors.find((visitor) => visitor.startsWith('同行 '))
  const companionCount = companionEntry ? Number(companionEntry.replace(/\D/g, '')) : 0

  if (companionEntry) {
    return Math.max(1 + companionCount, 1)
  }

  return Math.max(order.visitors.length, 1)
}
