import { bookingSlots } from '../src/data/bookingSlots'
import { cityPasses } from '../src/data/cityPasses'
import { cityEvents } from '../src/data/eventsCalendar'
import { mockOrders } from '../src/data/mockOrders'
import { neighborhoods } from '../src/data/neighborhoods'
import { scenicSpotsSeed } from '../src/data/scenicSpots'
import { ticketTypes } from '../src/data/ticketTypes'
import { themeJourneys } from '../src/data/themeJourneys'

export const seedScenicSpots = scenicSpotsSeed
export const seedTicketTypes = ticketTypes
export const seedBookingSlots = bookingSlots
export const seedCityPasses = cityPasses
export const seedNeighborhoods = neighborhoods
export const seedCityEvents = cityEvents
export const seedThemeJourneys = themeJourneys
export const seedOrders = mockOrders.map((order) => ({
  ...order,
  scenicSpotId:
    order.scenicSpotId ?? scenicSpotsSeed.find((spot) => spot.nameZh === order.spotName)?.id ?? null,
  slotId: order.slotId ?? null,
  cityPassId: order.cityPassId ?? null,
  ticketName: order.ticketName ?? null,
  visitorCount: order.visitorCount ?? order.visitors.length,
  paymentMethod: order.paymentMethod ?? (order.ticketName ? 'wechat' : 'free'),
  paymentStatus: order.paymentStatus ?? (order.ticketName ? '支付完成' : '免费预约'),
  amount: order.amount ?? 0,
}))
