import type { BookingPaymentMethod } from '../types/booking'

export const BOOKING_VISITOR_LIMITS = {
  min: 1,
  max: 8,
} as const

type QueryParamValue = string | Array<string | null> | null | undefined

// 预约页的入口可能来自详情页、通票页或浏览器回退，这里统一把查询参数收敛成单个字符串。
export const readQueryParam = (value: QueryParamValue) =>
  Array.isArray(value) ? value[0] ?? '' : value ?? ''

export const hasBookingQueryChanged = (
  currentQuery: Record<string, unknown>,
  nextQuery: Record<string, string | undefined>,
) =>
  readQueryParam(currentQuery.spot as QueryParamValue) !== readQueryParam(nextQuery.spot) ||
  readQueryParam(currentQuery.pass as QueryParamValue) !== readQueryParam(nextQuery.pass) ||
  readQueryParam(currentQuery.ticket as QueryParamValue) !== readQueryParam(nextQuery.ticket) ||
  readQueryParam(currentQuery.slot as QueryParamValue) !== readQueryParam(nextQuery.slot)

// 预约表单校验集中维护，页面只关心“是否能继续/提交”，方便答辩展示前端校验边界。
export const isValidVisitorCount = (count: number) =>
  Number.isFinite(count) &&
  count >= BOOKING_VISITOR_LIMITS.min &&
  count <= BOOKING_VISITOR_LIMITS.max

export const isValidPhone = (phone: string) => /^[0-9+\-\s]{7,20}$/.test(phone.trim())

export const isValidEmail = (email: string) => {
  const value = email.trim()
  return value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const isValidIdNumber = (idNumber: string) => idNumber.trim().length >= 4

export const getDefaultPaymentMethod = (amount: number): BookingPaymentMethod =>
  amount > 0 ? 'alipay' : 'free'
