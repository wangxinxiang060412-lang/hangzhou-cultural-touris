export type BookingOrderStatus = '待出行' | '已完成' | '已取消'
export type BookingPaymentMethod = 'free' | 'alipay' | 'wechat' | 'unionpay'
export type BookingPaymentStatus = '免费预约' | '支付完成'

export type BookingOrder = {
  id: string
  scenicSpotId?: string
  slotId?: string
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
}

export const mockOrders: BookingOrder[] = [
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
  },
]
