import { createLocalDateFromOffset, formatLocalDate } from '../utils/date'

export type BookingSlot = {
  id: string
  scenicSpotId: string
  date: string
  timeRange: string
  capacity: number
  booked: number
}

const reservableSpotIds = [
  'west-lake',
  'lingyin-feilaifeng',
  'xixi-wetland',
  'liangzhu-ancient-city',
  'grand-canal-hangzhou',
  'songcheng',
  'leifeng-pagoda',
  'hangzhou-botanical-garden',
  'hangzhou-zoo',
  'hu-xueyan-residence',
  'liuhetower',
  'guozhuang',
  'xiaohe-street',
  'southern-song-imperial-street',
  'xianghu',
  'qiandao-lake',
]

const timeRanges = ['09:00-11:00', '11:00-13:00', '14:00-16:00']

const toDateString = (offset: number) => {
  return formatLocalDate(createLocalDateFromOffset(offset))
}

export const bookingSlots: BookingSlot[] = reservableSpotIds.flatMap((scenicSpotId, spotIndex) =>
  Array.from({ length: 7 }, (_, dayIndex) =>
    timeRanges.map((timeRange, timeIndex) => {
      const capacity = 80 + ((spotIndex + timeIndex) % 4) * 30
      const booked = 18 + ((spotIndex * 17 + dayIndex * 13 + timeIndex * 19) % (capacity - 22))

      return {
        id: `${scenicSpotId}-${dayIndex + 1}-${timeIndex + 1}`,
        scenicSpotId,
        date: toDateString(dayIndex),
        timeRange,
        capacity,
        booked,
      }
    }),
  ).flat(),
)
