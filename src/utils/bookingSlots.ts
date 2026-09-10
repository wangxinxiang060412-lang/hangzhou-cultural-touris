import type { ApiBookingSlot } from '../services/api'
import { formatLocalDate } from './date'

export const BOOKING_WINDOW_DAYS = 7

const parseTimeRangeEndMinutes = (timeRange: string) => {
  const match = timeRange.match(/-\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return hours * 60 + minutes
}

export const createBookingDateOptions = (now = new Date(), locale: string = 'zh-CN') =>
  Array.from({ length: BOOKING_WINDOW_DAYS }, (_, index) => {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + index)
    const value = formatLocalDate(date)
    const dayLabel = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date)
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
    return {
      value,
      label:
        index === 0
          ? locale.startsWith('zh')
            ? '今天'
            : 'Today'
          : index === 1
            ? locale.startsWith('zh')
              ? '明天'
              : 'Tomorrow'
            : dayLabel,
      weekday,
    }
  })

export const isSlotWithinBookingWindow = (slot: Pick<ApiBookingSlot, 'date'>, now = new Date()) => {
  const firstDate = formatLocalDate(now)
  const lastDate = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + BOOKING_WINDOW_DAYS - 1))
  return slot.date >= firstDate && slot.date <= lastDate
}

export const isSlotTimeExpired = (
  slot: Pick<ApiBookingSlot, 'date' | 'timeRange'>,
  now = new Date(),
) => {
  if (slot.date !== formatLocalDate(now)) return false
  const endMinutes = parseTimeRangeEndMinutes(slot.timeRange)
  if (endMinutes === null) return false
  return endMinutes <= now.getHours() * 60 + now.getMinutes()
}

export const isSlotSelectable = (slot: Pick<ApiBookingSlot, 'date' | 'timeRange' | 'remaining'>, now = new Date()) =>
  isSlotWithinBookingWindow(slot, now) && !isSlotTimeExpired(slot, now) && slot.remaining > 0
