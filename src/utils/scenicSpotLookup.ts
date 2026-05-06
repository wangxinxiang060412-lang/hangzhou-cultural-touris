import { scenicSpotsSeed } from '../data/scenicSpots'

const scenicSpotAliases: Record<string, string> = {
  '西湖': 'west-lake',
  '西湖风景名胜区': 'west-lake',
  'west lake': 'west-lake',
  '断桥': 'west-lake',
  '白堤': 'west-lake',
  '孤山': 'west-lake',
  '苏堤': 'west-lake',
  '曲院风荷': 'west-lake',
  '灵隐': 'lingyin-feilaifeng',
  '灵隐寺': 'lingyin-feilaifeng',
  '灵隐飞来峰': 'lingyin-feilaifeng',
  'lingyin': 'lingyin-feilaifeng',
  '飞来峰': 'lingyin-feilaifeng',
  '西溪': 'xixi-wetland',
  '西溪国家湿地公园': 'xixi-wetland',
  '良渚': 'liangzhu-ancient-city',
  '良渚古城遗址公园': 'liangzhu-ancient-city',
  '京杭大运河': 'grand-canal-hangzhou',
  '京杭大运河杭州段': 'grand-canal-hangzhou',
  'grand canal': 'grand-canal-hangzhou',
  '小河直街': 'xiaohe-street',
  '南宋御街': 'southern-song-imperial-street',
  '宋城': 'songcheng',
  '钱塘江': 'liuhetower',
  '六和塔': 'liuhetower',
  '郭庄': 'guozhuang',
  '胡雪岩故居': 'hu-xueyan-residence',
  '湘湖': 'xianghu',
  '千岛湖': 'qiandao-lake',
  '雷峰塔': 'leifeng-pagoda',
  '杭州植物园': 'hangzhou-botanical-garden',
  '杭州动物园': 'hangzhou-zoo',
}

const normalize = (value: string) => value.trim().toLowerCase()

export const findSpotIdFromText = (value: string) => {
  const normalized = normalize(value)
  const alias = scenicSpotAliases[normalized]
  if (alias) return alias

  const direct = scenicSpotsSeed.find((spot) => {
    const values = [spot.id, spot.nameZh, spot.nameEn, ...spot.tags].map(normalize)
    return values.some((entry) => entry === normalized || entry.includes(normalized) || normalized.includes(entry))
  })

  return direct?.id ?? null
}

export const buildSpotDetailPath = (value: string) => {
  const spotId = findSpotIdFromText(value)
  return spotId ? `/scenic-spots/${spotId}` : null
}

export const buildBookingPath = (value: string) => {
  const spotId = findSpotIdFromText(value)
  return spotId ? `/booking?spot=${spotId}` : null
}
