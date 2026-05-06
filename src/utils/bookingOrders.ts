import type { BookingOrder } from '../data/mockOrders'

export const getOrderVisitorCount = (order: BookingOrder) => {
  if (typeof order.visitorCount === 'number' && Number.isFinite(order.visitorCount)) {
    return Math.max(order.visitorCount, 1)
  }

  const companionEntry = order.visitors.find((visitor) => visitor.startsWith('同行 '))
  const companionCount = companionEntry ? Number(companionEntry.replace(/\D/g, '')) : 0

  if (companionEntry) {
    return Math.max(1 + companionCount, 1)
  }

  return Math.max(order.visitors.length, 1)
}
