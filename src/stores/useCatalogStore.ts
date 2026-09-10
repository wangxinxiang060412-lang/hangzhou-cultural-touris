import { computed } from 'vue'
import { defineStore } from 'pinia'
import {
  bookingSlots,
  auditLogs,
  catalogError,
  catalogLoaded,
  cityPasses,
  ensureCatalog,
  featuredScenicSpots,
  findScenicSpot,
  orders,
  refreshAll,
  refreshAuditLogs,
  refreshBookingSlots,
  refreshCatalog,
  refreshCityPasses,
  refreshOrders,
  refreshScenicSpots,
  refreshTicketTypes,
  refreshUserAccounts,
  scenicSpots,
  ticketTypes,
  userAccounts,
} from './catalog'

export const useCatalogStore = defineStore('catalog', () => {
  const reservableScenicSpots = computed(() =>
    scenicSpots.value.filter((spot) => spot.reservationRequired || spot.paid),
  )

  const dashboardStats = computed(() => ({
    scenicSpotCount: scenicSpots.value.length,
    ticketTypeCount: ticketTypes.value.length,
    slotCount: bookingSlots.value.length,
    orderCount: orders.value.length,
    userCount: userAccounts.value.length,
    auditLogCount: auditLogs.value.length,
  }))

  return {
    scenicSpots,
    ticketTypes,
    bookingSlots,
    cityPasses,
    orders,
    userAccounts,
    auditLogs,
    catalogError,
    catalogLoaded,
    featuredScenicSpots,
    reservableScenicSpots,
    dashboardStats,
    ensureCatalog,
    findScenicSpot,
    refreshAll,
    refreshAuditLogs,
    refreshBookingSlots,
    refreshCatalog,
    refreshCityPasses,
    refreshOrders,
    refreshScenicSpots,
    refreshTicketTypes,
    refreshUserAccounts,
  }
})
