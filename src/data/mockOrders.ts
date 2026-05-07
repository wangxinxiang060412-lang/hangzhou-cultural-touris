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

export const mockOrders: BookingOrder[] = [
  {
    id: 'HZ-20260502-0211',
    scenicSpotId: 'west-lake',
    slotId: 'west-lake-2-1',
    cityPassId: 'west-lake-day-pass',
    spotName: '西湖风景名胜区',
    visitDate: '2026-05-04',
    timeRange: '08:30-10:30',
    visitors: ['李然', '李小满'],
    status: '待出行',
    paymentMethod: 'alipay',
    paymentStatus: '支付完成',
    amount: 336,
    qrCodeText: 'VERIFY-HZ-20260502-0211',
    createdAt: '2026-05-02 18:15',
    contactPhone: '+86 136 8800 2110',
    contactEmail: 'liran.family@example.com',
    idType: '护照',
    maskedIdNumber: 'P2******11',
    voucherChannels: ['sms', 'email', 'appleWallet'],
    refundStatus: '无需退款',
    supportHotline: '12301',
    supportEmail: 'tickets@hangzhou.example.gov.cn',
    appealStatus: '可发起',
    invoiceStatus: '可申请',
    invoiceTitle: 'Li Family',
    invoiceType: '个人',
    receiptCode: 'RCPT-HZ-20260502-0211',
    companions: [
      { name: '李然', credentialStatus: '已核验', idType: '护照' },
      { name: '李小满', credentialStatus: '待补充', idType: '护照' },
    ],
    lastServiceUpdate: '2026-05-02 18:21',
  },
  {
    id: 'HZ-20260501-0186',
    scenicSpotId: 'lingyin-feilaifeng',
    spotName: '灵隐飞来峰',
    visitDate: '2026-05-03',
    timeRange: '09:00-11:00',
    visitors: ['王一', '林二'],
    status: '待出行',
    paymentMethod: 'free',
    paymentStatus: '免费预约',
    amount: 0,
    qrCodeText: 'VERIFY-LYF-0186',
    createdAt: '2026-05-01 09:42',
    contactPhone: '+86 138 0013 8000',
    contactEmail: 'wangyi@example.com',
    idType: '身份证',
    maskedIdNumber: '3301********0218',
    voucherChannels: ['sms', 'email'],
    refundStatus: '无需退款',
    supportHotline: '12301',
    supportEmail: 'tickets@hangzhou.example.gov.cn',
    appealStatus: '可发起',
    invoiceStatus: '可申请',
    invoiceTitle: '王一',
    invoiceType: '个人',
    receiptCode: 'RCPT-HZ-20260501-0186',
    companions: [
      { name: '王一', credentialStatus: '已核验', idType: '身份证' },
      { name: '林二', credentialStatus: '已核验', idType: '身份证' },
    ],
    lastServiceUpdate: '2026-05-01 09:46',
  },
  {
    id: 'HZ-20260424-0062',
    scenicSpotId: 'liangzhu-ancient-city',
    spotName: '良渚古城遗址公园',
    visitDate: '2026-04-26',
    timeRange: '14:00-16:00',
    visitors: ['陈三'],
    status: '已完成',
    paymentMethod: 'alipay',
    paymentStatus: '支付完成',
    amount: 120,
    qrCodeText: 'VERIFY-LZ-0062',
    createdAt: '2026-04-24 16:08',
    contactPhone: '+86 139 1111 0620',
    contactEmail: 'chen.san@example.com',
    idType: '护照',
    maskedIdNumber: 'E1******62',
    voucherChannels: ['sms', 'email', 'appleWallet', 'googleWallet'],
    refundStatus: '无需退款',
    supportHotline: '12301',
    supportEmail: 'tickets@hangzhou.example.gov.cn',
    appealStatus: '已回复',
    appealSummary: '已完成出行，如需开具增值税普通发票可继续在线提交。',
    invoiceStatus: '已开具',
    invoiceTitle: '陈三',
    invoiceType: '个人',
    receiptCode: 'RCPT-HZ-20260424-0062',
    companions: [{ name: '陈三', credentialStatus: '已核验', idType: '护照' }],
    lastServiceUpdate: '2026-04-26 18:12',
  },
  {
    id: 'HZ-20260418-0127',
    scenicSpotId: 'songcheng',
    spotName: '宋城',
    visitDate: '2026-04-20',
    timeRange: '19:00-21:00',
    visitors: ['周四', '周五', '周六'],
    status: '已取消',
    paymentMethod: 'wechat',
    paymentStatus: '支付完成',
    amount: 900,
    qrCodeText: 'VERIFY-SC-0127',
    createdAt: '2026-04-18 11:20',
    contactPhone: '+86 137 9000 0127',
    contactEmail: 'zhou.group@example.com',
    idType: '身份证',
    maskedIdNumber: '3302********0418',
    voucherChannels: ['sms', 'email'],
    cancellationReason: '同行人临时变更，未能在开演前完成实名调整。',
    refundStatus: '已退款',
    refundAmount: 900,
    refundProgress: '原路退款已完成，到账时间以支付渠道账期为准。',
    supportHotline: '12301',
    supportEmail: 'tickets@hangzhou.example.gov.cn',
    appealStatus: '处理中',
    appealSummary: '已提交订单申诉，服务专席将在 2 小时内通过短信或邮件回复。',
    invoiceStatus: '开票中',
    invoiceTitle: '杭州之旅同行小组',
    invoiceType: '企业',
    receiptCode: 'RCPT-HZ-20260418-0127',
    companions: [
      { name: '周四', credentialStatus: '已核验', idType: '身份证' },
      { name: '周五', credentialStatus: '已核验', idType: '身份证' },
      { name: '周六', credentialStatus: '待补充', idType: '身份证' },
    ],
    lastServiceUpdate: '2026-04-20 10:05',
  },
]
