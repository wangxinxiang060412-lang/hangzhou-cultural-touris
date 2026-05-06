import { bookingSlots } from '../src/data/bookingSlots'
import { mockOrders } from '../src/data/mockOrders'
import { scenicSpotsSeed } from '../src/data/scenicSpots'
import { ticketTypes } from '../src/data/ticketTypes'

export const seedScenicSpots = scenicSpotsSeed
export const seedTicketTypes = ticketTypes
export const seedBookingSlots = bookingSlots
export const seedOrders = mockOrders.map((order) => ({
  ...order,
  scenicSpotId:
    order.scenicSpotId ?? scenicSpotsSeed.find((spot) => spot.nameZh === order.spotName)?.id ?? null,
  slotId: order.slotId ?? null,
  ticketName: order.ticketName ?? null,
  visitorCount: order.visitorCount ?? order.visitors.length,
  paymentMethod: order.paymentMethod ?? (order.ticketName ? 'wechat' : 'free'),
  paymentStatus: order.paymentStatus ?? (order.ticketName ? '支付完成' : '免费预约'),
  amount: order.amount ?? 0,
}))
