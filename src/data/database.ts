import { bookingSlots } from './bookingSlots'
import { mockOrders } from './mockOrders'
import { scenicSpotsSeed } from './scenicSpots'
import { ticketTypes } from './ticketTypes'

const scenicSpots = scenicSpotsSeed

export type DatabaseField = {
  name: string
  type: string
  note: string
}

export type DatabaseRelation = {
  from: string
  to: string
  note: string
}

export type DatabaseTable = {
  id: string
  name: string
  title: string
  source: 'SQLite seed' | 'SQLite table'
  description: string
  recordCount: number
  fields: DatabaseField[]
}

export const databaseTables: DatabaseTable[] = [
  {
    id: 'scenic_spots',
    name: 'scenic_spots',
    title: '景点主表',
    source: 'SQLite seed',
    description: '承载全市景点开放信息与票务状态的基础档案，是列表、详情、后台景点数据的主数据来源；后端启动时会写入种子数据。',
    recordCount: scenicSpots.length,
    fields: [
      { name: 'id', type: 'string', note: '景点唯一标识，用于路由与关联。' },
      { name: 'nameZh / nameEn', type: 'string', note: '中英文展示名。' },
      { name: 'area', type: 'string', note: '所属区域。' },
      { name: 'category', type: 'string', note: '景点分类。' },
      { name: 'reservationRequired', type: 'boolean', note: '是否涉及购票、分时或容量管理。' },
      { name: 'paid', type: 'boolean', note: '是否含收费票种。' },
      { name: 'featured', type: 'boolean', note: '是否进入首页重点景点。' },
    ],
  },
  {
    id: 'ticket_types',
    name: 'ticket_types',
    title: '票种表',
    source: 'SQLite seed',
    description: '定义景点可选择的票种与价格，后续可替换为真实票务/支付系统返回的商品数据。',
    recordCount: ticketTypes.length,
    fields: [
      { name: 'id', type: 'string', note: '票种唯一标识。' },
      { name: 'scenicSpotId', type: 'string', note: '关联 scenic_spots.id。' },
      { name: 'name', type: 'string', note: '成人票、儿童票、免费入园登记等。' },
      { name: 'price', type: 'number', note: '当前票务价格，0 表示免费入园登记。' },
      { name: 'availableFor', type: 'string', note: '适用人群说明。' },
    ],
  },
  {
    id: 'booking_slots',
    name: 'booking_slots',
    title: '办理时段表',
    source: 'SQLite seed',
    description: '保存可办理日期、时段和基础容量，余量会叠加数据库订单动态计算。',
    recordCount: bookingSlots.length,
    fields: [
      { name: 'id', type: 'string', note: '时段唯一标识。' },
      { name: 'scenicSpotId', type: 'string', note: '关联 scenic_spots.id。' },
      { name: 'date', type: 'YYYY-MM-DD', note: '本地日期。' },
      { name: 'timeRange', type: 'string', note: '可办理时间段。' },
      { name: 'capacity', type: 'number', note: '基础容量。' },
      { name: 'booked', type: 'number', note: '种子基础占用人数。' },
    ],
  },
  {
    id: 'booking_orders',
    name: 'booking_orders',
    title: '票务订单表',
    source: 'SQLite table',
    description: '保存真实提交的办理记录，是订单页、后台核销、取消与余量占用的状态来源。',
    recordCount: mockOrders.length,
    fields: [
      { name: 'id', type: 'string', note: '办理编号。' },
      { name: 'scenicSpotId', type: 'string?', note: '关联 scenic_spots.id，本地新订单会写入。' },
      { name: 'slotId', type: 'string?', note: '关联 booking_slots.id，用于动态余量。' },
      { name: 'ticketName', type: 'string?', note: '用户选择的票种名称。' },
      { name: 'visitorCount', type: 'number?', note: '游客人数。' },
      { name: 'paymentMethod', type: 'free | alipay | wechat | unionpay', note: '支付方式标识。' },
      { name: 'paymentStatus', type: '免费预约 | 支付完成', note: '支付状态，免费预约兼容历史订单。' },
      { name: 'amount', type: 'number?', note: '订单总金额。' },
      { name: 'status', type: '待出行 | 已完成 | 已取消', note: '订单状态。' },
      { name: 'qrCodeText', type: 'string', note: '核销码占位文本。' },
    ],
  },
]

export const databaseRelations: DatabaseRelation[] = [
  {
    from: 'ticket_types.scenicSpotId',
    to: 'scenic_spots.id',
    note: '每个票种归属于一个景点。',
  },
  {
    from: 'booking_slots.scenicSpotId',
    to: 'scenic_spots.id',
    note: '每个办理时段归属于一个景点。',
  },
  {
    from: 'booking_orders.scenicSpotId',
    to: 'scenic_spots.id',
    note: '本地新订单可回溯到对应景点。',
  },
  {
    from: 'booking_orders.slotId',
    to: 'booking_slots.id',
    note: '本地订单按时段占用余量，取消后释放。',
  },
]

export const databaseMeta = {
  name: 'Hangzhou Scenic Ticketing DB',
  version: 'api-v2',
  persistence: 'SQLite',
  storageKey: 'data/west-lake.sqlite',
  note: '当前已具备真实后端 API 与 SQLite 持久化，支付、实名校验和线上数据库可在同一接口边界继续替换接入。',
}
