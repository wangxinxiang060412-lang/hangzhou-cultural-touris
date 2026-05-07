import { scenicSpotsSeed } from './scenicSpots'

export type SpotImageContext = 'list' | 'featured' | 'detail'

type SpotImageEntry = {
  src: string
  position?: Partial<Record<SpotImageContext, string>>
}

const registry: Record<string, SpotImageEntry> = Object.fromEntries(
  scenicSpotsSeed
    .filter((spot) => Boolean(spot.image))
    .map((spot) => [spot.id, { src: spot.image as string }]),
)

const positionRegistry: Record<string, SpotImageEntry['position']> = {
  'west-lake': {
    list: '50% 68%',
    featured: '58% 52%',
    detail: '58% 50%',
  },
  'lingyin-feilaifeng': {
    list: '52% 58%',
    featured: '50% 58%',
    detail: '52% 56%',
  },
  'xixi-wetland': {
    list: '54% 48%',
    featured: '56% 46%',
    detail: '56% 48%',
  },
  'liangzhu-ancient-city': {
    list: '48% 56%',
    featured: '50% 54%',
    detail: '50% 52%',
  },
  'grand-canal-hangzhou': {
    list: '50% 58%',
    featured: '52% 56%',
    detail: '52% 54%',
  },
  'southern-song-imperial-street': {
    list: '50% 44%',
    featured: '52% 42%',
    detail: '52% 44%',
  },
  'xiaohe-street': {
    list: '50% 56%',
    featured: '54% 54%',
    detail: '54% 56%',
  },
  'hangzhou-botanical-garden': {
    list: '50% 48%',
    featured: '52% 46%',
    detail: '52% 48%',
  },
  'hangzhou-zoo': {
    list: '52% 46%',
    featured: '54% 44%',
    detail: '54% 46%',
  },
  'leifeng-pagoda': {
    list: '50% 42%',
    featured: '52% 40%',
    detail: '52% 42%',
  },
  guozhuang: {
    list: '50% 52%',
    featured: '54% 50%',
    detail: '54% 52%',
  },
}

export const getSpotImage = (id: string): string | null => {
  const image = registry[id]
  return image?.src ?? null
}

export const getSpotImagePosition = (id: string, context: SpotImageContext): string =>
  positionRegistry[id]?.[context] ?? '50% 50%'
