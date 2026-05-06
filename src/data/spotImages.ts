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
    list: '56% 52%',
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
}

export const getSpotImage = (id: string): string | null => {
  const image = registry[id]
  return image?.src ?? null
}

export const getSpotImagePosition = (id: string, context: SpotImageContext): string =>
  positionRegistry[id]?.[context] ?? '50% 50%'
