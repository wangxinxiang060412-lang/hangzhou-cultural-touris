import { routes } from '../data/routes'
import type {
  ApiCityEvent,
  ApiCityPass,
  ApiNeighborhood,
  ApiScenicSpot,
  ApiThemeJourney,
} from '../services/api'

export type DiscoveryResult = {
  id: string
  kind: 'spot' | 'pass' | 'route' | 'neighborhood' | 'event' | 'journey'
  title: string
  subtitle: string
  summary: string
  tags: string[]
  to: string
}

const normalize = (value: string) => value.trim().toLowerCase()
const journeyFilterLabels: Record<string, string> = {
  family: '亲子',
  photography: '摄影',
  food: '美食',
  accessible: '无障碍',
  heritage: '文化',
  night: '夜游',
}

export const searchDiscovery = (
  query: string,
  scenicSpots: ApiScenicSpot[],
  cityPasses: ApiCityPass[] = [],
  neighborhoods: ApiNeighborhood[] = [],
  cityEvents: ApiCityEvent[] = [],
  themeJourneys: ApiThemeJourney[] = [],
): DiscoveryResult[] => {
  const normalized = normalize(query)
  if (!normalized) return []

  const spotResults: DiscoveryResult[] = scenicSpots
    .filter((spot) =>
      [spot.nameZh, spot.nameEn, spot.area, spot.category, spot.description, ...spot.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
    .map((spot) => ({
      id: spot.id,
      kind: 'spot',
      title: spot.nameZh,
      subtitle: spot.nameEn,
      summary: spot.description,
      tags: [spot.area, spot.category, ...spot.tags].slice(0, 4),
      to: `/scenic-spots/${spot.id}`,
    }))

  const passResults: DiscoveryResult[] = cityPasses
    .filter((pass) =>
      [
        pass.name['zh-CN'],
        pass.name['en-US'],
        pass.shortLabel['zh-CN'],
        pass.description['zh-CN'],
        pass.suitableFor['zh-CN'],
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
    .map((pass) => ({
      id: pass.id,
      kind: 'pass',
      title: pass.name['zh-CN'],
      subtitle: pass.name['en-US'],
      summary: pass.description['zh-CN'],
      tags: [pass.shortLabel['zh-CN'], pass.duration['zh-CN'], `¥${pass.price}`],
      to: `/booking?pass=${pass.id}`,
    }))

  const routeResults: DiscoveryResult[] = routes
    .filter((route) =>
      [
        route.title['zh-CN'],
        route.titleEn,
        route.description['zh-CN'],
        route.audience['zh-CN'],
        ...route.stops['zh-CN'],
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
    .map((route) => ({
      id: route.id,
      kind: 'route',
      title: route.title['zh-CN'],
      subtitle: route.titleEn,
      summary: route.description['zh-CN'],
      tags: [route.duration['zh-CN'], route.pace['zh-CN']],
      to: `/routes#route-${route.id}`,
    }))

  const neighborhoodResults: DiscoveryResult[] = neighborhoods
    .filter((item) =>
      [
        item.name['zh-CN'],
        item.name['en-US'],
        item.nameEn,
        item.theme['zh-CN'],
        item.description['zh-CN'],
        item.district['zh-CN'],
        ...item.highlights.map((highlight) => highlight['zh-CN']),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
    .map((item) => ({
      id: item.id,
      kind: 'neighborhood',
      title: item.name['zh-CN'],
      subtitle: item.nameEn,
      summary: item.description['zh-CN'],
      tags: [item.district['zh-CN'], item.theme['zh-CN'], ...item.highlights.slice(0, 2).map((item) => item['zh-CN'])],
      to: `/neighborhoods#neighborhood-${item.id}`,
    }))

  const eventResults: DiscoveryResult[] = cityEvents
    .filter((event) =>
      [
        event.name['zh-CN'],
        event.name['en-US'],
        event.nameEn,
        event.category['zh-CN'],
        event.monthLabel['zh-CN'],
        event.description['zh-CN'],
        event.district['zh-CN'],
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
    .map((event) => ({
      id: event.id,
      kind: 'event',
      title: event.name['zh-CN'],
      subtitle: event.nameEn,
      summary: event.description['zh-CN'],
      tags: [event.category['zh-CN'], event.monthLabel['zh-CN'], event.district['zh-CN']],
      to: `/events#event-${event.id}`,
    }))

  const themeJourneyResults: DiscoveryResult[] = themeJourneys
    .filter((journey) =>
      [
        journey.title['zh-CN'],
        journey.titleEn,
        journey.summary['zh-CN'],
        journey.audience['zh-CN'],
        ...journey.dayPlans.map((item) => item.plan['zh-CN']),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
    .map((journey) => ({
      id: journey.id,
      kind: 'journey',
      title: journey.title['zh-CN'],
      subtitle: journey.titleEn,
      summary: journey.summary['zh-CN'],
      tags: [journey.duration['zh-CN'], ...journey.filters.slice(0, 2).map((item) => journeyFilterLabels[item] ?? item)],
      to: `/routes#journey-${journey.id}`,
    }))

  return [
    ...spotResults,
    ...passResults,
    ...routeResults,
    ...neighborhoodResults,
    ...eventResults,
    ...themeJourneyResults,
  ]
}
