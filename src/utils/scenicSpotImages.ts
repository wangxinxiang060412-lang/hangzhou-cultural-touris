import type { ApiScenicSpot } from '../services/api'

export type SpotImageContext = 'list' | 'featured' | 'detail'

const assetModules = import.meta.glob('../assets/images/scenic-*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const assetUrlByPublicPath = Object.fromEntries(
  Object.entries(assetModules).map(([path, url]) => [
    path.replace('../assets/images/', '/src/assets/images/'),
    url,
  ]),
)

const apiOrigin = (() => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '')
  try {
    return new URL(baseUrl).origin
  } catch {
    return ''
  }
})()

export const getScenicSpotImage = (spot?: Pick<ApiScenicSpot, 'imageUrl'> | null): string | null => {
  const imageUrl = spot?.imageUrl?.trim()
  if (!imageUrl) return null
  if (imageUrl.startsWith('/src/assets/images/')) return assetUrlByPublicPath[imageUrl] ?? null
  if (imageUrl.startsWith('/uploads/')) return `${apiOrigin}${imageUrl}`
  return imageUrl
}

export const getScenicSpotImagePosition = (
  spot?: Pick<ApiScenicSpot, 'imagePosition'> | null,
  _context?: SpotImageContext,
): string => spot?.imagePosition?.trim() || '50% 50%'
