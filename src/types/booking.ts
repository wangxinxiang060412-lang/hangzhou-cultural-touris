export type BookingOrderStatus = '待出行' | '已完成' | '已取消'
export type BookingPaymentMethod = 'free' | 'alipay' | 'wechat' | 'unionpay'
export type BookingPaymentStatus = '免费预约' | '支付完成'
export type BookingRefundStatus = '无需退款' | '待处理' | '退款中' | '已退款'
export type BookingInvoiceStatus = '可申请' | '开票中' | '已开具'
export type BookingAppealStatus = '可发起' | '处理中' | '已回复'
export type BookingVoucherChannel = 'sms' | 'email' | 'appleWallet' | 'googleWallet'

export type BookingCompanion = {
  name: string
  credentialStatus: '已核验' | '待补充'
  idType?: '身份证' | '护照'
}

export type BookingOrder = {
  id: string
  scenicSpotId?: string
  slotId?: string
  userId?: string
  cityPassId?: string
  ticketName?: string
  visitorCount?: number
  paymentMethod?: BookingPaymentMethod
  paymentStatus?: BookingPaymentStatus
  amount?: number
  spotName: string
  visitDate: string
  timeRange: string
  visitors: string[]
  status: BookingOrderStatus
  qrCodeText: string
  createdAt: string
  contactPhone?: string
  contactEmail?: string
  idType?: '身份证' | '护照'
  maskedIdNumber?: string
  voucherChannels?: BookingVoucherChannel[]
  cancellationReason?: string
  refundStatus?: BookingRefundStatus
  refundAmount?: number
  refundProgress?: string
  supportHotline?: string
  supportEmail?: string
  appealStatus?: BookingAppealStatus
  appealSummary?: string
  invoiceStatus?: BookingInvoiceStatus
  invoiceTitle?: string
  invoiceType?: '个人' | '企业'
  receiptCode?: string
  companions?: BookingCompanion[]
  lastServiceUpdate?: string
}
