import { computed, ref } from 'vue'
import { fetchHangzhouWeather } from '../services/api'
import type { ApiHangzhouWeather } from '../services/api'

export const hangzhouWeather = ref<ApiHangzhouWeather | null>(null)
export const weatherError = ref('')
export const weatherLoading = ref(false)

let weatherLoadPromise: Promise<ApiHangzhouWeather | null> | null = null

export const weatherCodeKey = (code: number) => {
  if (code === 0) return 'weather.clear'
  if ([1, 2, 3].includes(code)) return 'weather.cloudy'
  if ([45, 48].includes(code)) return 'weather.fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'weather.drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'weather.rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'weather.snow'
  if ([95, 96, 99].includes(code)) return 'weather.thunder'
  return 'weather.unknown'
}

export const todayWeather = computed(() => hangzhouWeather.value?.daily[0] ?? null)

export const weatherTravelRiskKey = computed(() => {
  const current = hangzhouWeather.value?.current
  const daily = todayWeather.value
  if (!current || !daily) return 'weather.risk.medium'

  const hasStorm =
    [95, 96, 99].includes(current.weatherCode) || [95, 96, 99].includes(daily.weatherCode)
  const highRain = daily.precipitationProbability >= 70 || daily.precipitationSum >= 20
  const strongWind = Math.max(current.windSpeed, daily.windSpeedMax) >= 38
  const highHeat = Math.max(current.temperature, daily.temperatureMax) >= 35
  const mediumRain = daily.precipitationProbability >= 35 || current.precipitation > 0

  if (hasStorm || highRain || strongWind || highHeat) return 'weather.risk.high'
  if (mediumRain || current.windSpeed >= 24 || daily.temperatureMax >= 32) return 'weather.risk.medium'
  return 'weather.risk.low'
})

export const refreshHangzhouWeather = async (force = false) => {
  if (weatherLoadPromise && !force) return weatherLoadPromise

  weatherLoading.value = true
  weatherError.value = ''

  weatherLoadPromise = fetchHangzhouWeather()
    .then((nextWeather) => {
      hangzhouWeather.value = nextWeather
      weatherError.value = nextWeather.syncError ?? ''
      return nextWeather
    })
    .catch((error) => {
      weatherError.value = error instanceof Error ? error.message : '天气数据同步失败'
      return null
    })
    .finally(() => {
      weatherLoading.value = false
      weatherLoadPromise = null
    })

  return weatherLoadPromise
}

export const ensureHangzhouWeather = () => {
  if (hangzhouWeather.value) return Promise.resolve(hangzhouWeather.value)
  return refreshHangzhouWeather()
}
