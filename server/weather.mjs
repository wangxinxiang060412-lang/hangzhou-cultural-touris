const HANGZHOU_COORDINATES = {
  latitude: 30.27,
  longitude: 120.15,
}

const WEATHER_SOURCE = {
  name: 'Open-Meteo',
  url: 'https://open-meteo.com/',
}

const CACHE_TTL_MS = 10 * 60 * 1000

let weatherCache = null

const currentVariables = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'rain',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m',
  'weather_code',
  'is_day',
]

const dailyVariables = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_speed_10m_max',
  'sunrise',
  'sunset',
]

const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const buildOpenMeteoUrl = () => {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(HANGZHOU_COORDINATES.latitude))
  url.searchParams.set('longitude', String(HANGZHOU_COORDINATES.longitude))
  url.searchParams.set('timezone', 'Asia/Shanghai')
  url.searchParams.set('forecast_days', '3')
  url.searchParams.set('current', currentVariables.join(','))
  url.searchParams.set('daily', dailyVariables.join(','))
  return url.toString()
}

export const mapOpenMeteoWeather = (payload, syncedAt, cacheStatus = 'live', syncError) => {
  const current = payload.current ?? {}
  const daily = payload.daily ?? {}
  const dates = Array.isArray(daily.time) ? daily.time : []

  return {
    location: '杭州',
    latitude: toNumber(payload.latitude, HANGZHOU_COORDINATES.latitude),
    longitude: toNumber(payload.longitude, HANGZHOU_COORDINATES.longitude),
    timezone: payload.timezone || 'Asia/Shanghai',
    source: WEATHER_SOURCE.name,
    sourceUrl: WEATHER_SOURCE.url,
    syncedAt,
    cacheStatus,
    ...(syncError ? { syncError } : {}),
    current: {
      time: current.time || syncedAt,
      temperature: toNumber(current.temperature_2m),
      feelsLike: toNumber(current.apparent_temperature),
      humidity: toNumber(current.relative_humidity_2m),
      precipitation: toNumber(current.precipitation),
      rain: toNumber(current.rain),
      cloudCover: toNumber(current.cloud_cover),
      windSpeed: toNumber(current.wind_speed_10m),
      windDirection: toNumber(current.wind_direction_10m),
      weatherCode: toNumber(current.weather_code),
      isDay: Boolean(current.is_day),
    },
    daily: dates.slice(0, 3).map((date, index) => ({
      date,
      weatherCode: toNumber(daily.weather_code?.[index]),
      temperatureMax: toNumber(daily.temperature_2m_max?.[index]),
      temperatureMin: toNumber(daily.temperature_2m_min?.[index]),
      precipitationProbability: toNumber(daily.precipitation_probability_max?.[index]),
      precipitationSum: toNumber(daily.precipitation_sum?.[index]),
      windSpeedMax: toNumber(daily.wind_speed_10m_max?.[index]),
      sunrise: daily.sunrise?.[index] || `${date}T00:00`,
      sunset: daily.sunset?.[index] || `${date}T00:00`,
    })),
  }
}

export const fetchHangzhouWeather = async ({
  fetcher = fetch,
  now = () => new Date(),
  force = false,
} = {}) => {
  const timestamp = now()
  if (!force && weatherCache && timestamp.getTime() - weatherCache.cachedAt.getTime() < CACHE_TTL_MS) {
    return {
      ...weatherCache.weather,
      cacheStatus: 'cached',
    }
  }

  try {
    const response = await fetcher(buildOpenMeteoUrl(), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Open-Meteo 请求失败：${response.status}`)
    }

    const payload = await response.json()
    const weather = mapOpenMeteoWeather(payload, timestamp.toISOString(), 'live')
    weatherCache = {
      cachedAt: timestamp,
      weather,
    }
    return weather
  } catch (error) {
    const message = error instanceof Error ? error.message : '天气数据同步失败'
    if (weatherCache) {
      return {
        ...weatherCache.weather,
        cacheStatus: 'stale',
        syncError: message,
      }
    }
    throw new Error(message)
  }
}
