import type { ApiHangzhouWeather } from '../services/api'

/**
 * 静态天气数据快照 — 用于纯前端展示模式
 * 模拟杭州五月初晴好天气
 */
export const staticWeather: ApiHangzhouWeather = {
  location: '杭州',
  latitude: 30.27,
  longitude: 120.15,
  timezone: 'Asia/Shanghai',
  source: 'static-snapshot',
  sourceUrl: 'https://open-meteo.com/',
  syncedAt: new Date().toISOString(),
  cacheStatus: 'cached',
  current: {
    time: new Date().toISOString(),
    temperature: 24.6,
    feelsLike: 25.1,
    humidity: 62,
    precipitation: 0,
    rain: 0,
    cloudCover: 18,
    windSpeed: 8.5,
    windDirection: 135,
    weatherCode: 1,
    isDay: true,
  },
  daily: [
    {
      date: new Date().toISOString().slice(0, 10),
      weatherCode: 1,
      temperatureMax: 28.3,
      temperatureMin: 18.2,
      precipitationProbability: 10,
      precipitationSum: 0,
      windSpeedMax: 14.2,
      sunrise: `${new Date().toISOString().slice(0, 10)}T05:18`,
      sunset: `${new Date().toISOString().slice(0, 10)}T18:42`,
    },
    {
      date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) })(),
      weatherCode: 2,
      temperatureMax: 27.1,
      temperatureMin: 17.8,
      precipitationProbability: 20,
      precipitationSum: 0.2,
      windSpeedMax: 12.8,
      sunrise: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.toISOString().slice(0, 10)}T05:17` })(),
      sunset: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.toISOString().slice(0, 10)}T18:43` })(),
    },
    {
      date: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().slice(0, 10) })(),
      weatherCode: 3,
      temperatureMax: 26.5,
      temperatureMin: 19.0,
      precipitationProbability: 35,
      precipitationSum: 1.5,
      windSpeedMax: 16.1,
      sunrise: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return `${d.toISOString().slice(0, 10)}T05:16` })(),
      sunset: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return `${d.toISOString().slice(0, 10)}T18:44` })(),
    },
  ],
}
