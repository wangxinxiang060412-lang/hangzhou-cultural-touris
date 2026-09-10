import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildOpenMeteoUrl,
  fetchHangzhouWeather,
  mapOpenMeteoWeather,
} from '../server/weather.mjs'

const samplePayload = {
  latitude: 30.3,
  longitude: 120.2,
  timezone: 'Asia/Shanghai',
  current: {
    time: '2026-06-23T14:15',
    temperature_2m: 31.4,
    apparent_temperature: 35.2,
    relative_humidity_2m: 72,
    precipitation: 1.2,
    rain: 0.8,
    cloud_cover: 86,
    wind_speed_10m: 18.5,
    wind_direction_10m: 135,
    weather_code: 61,
    is_day: 1,
  },
  daily: {
    time: ['2026-06-23', '2026-06-24', '2026-06-25'],
    weather_code: [61, 80, 3],
    temperature_2m_max: [34.2, 32.8, 30.1],
    temperature_2m_min: [26.6, 25.7, 24.4],
    precipitation_probability_max: [70, 60, 20],
    precipitation_sum: [12.4, 8.1, 0],
    wind_speed_10m_max: [29.2, 24.5, 12.3],
    sunrise: ['2026-06-23T05:00', '2026-06-24T05:00', '2026-06-25T05:01'],
    sunset: ['2026-06-23T19:04', '2026-06-24T19:04', '2026-06-25T19:04'],
  },
}

describe('Hangzhou weather API integration helpers', () => {
  it('builds an Open-Meteo forecast URL for Hangzhou with current and 3-day daily variables', () => {
    const url = new URL(buildOpenMeteoUrl())

    assert.equal(url.origin, 'https://api.open-meteo.com')
    assert.equal(url.pathname, '/v1/forecast')
    assert.equal(url.searchParams.get('latitude'), '30.27')
    assert.equal(url.searchParams.get('longitude'), '120.15')
    assert.equal(url.searchParams.get('timezone'), 'Asia/Shanghai')
    assert.equal(url.searchParams.get('forecast_days'), '3')
    assert.match(url.searchParams.get('current') ?? '', /temperature_2m/)
    assert.match(url.searchParams.get('current') ?? '', /weather_code/)
    assert.match(url.searchParams.get('daily') ?? '', /precipitation_probability_max/)
  })

  it('maps Open-Meteo fields into the frontend ApiHangzhouWeather shape', () => {
    const syncedAt = '2026-06-23T06:15:00.000Z'
    const weather = mapOpenMeteoWeather(samplePayload, syncedAt, 'live')

    assert.equal(weather.location, '杭州')
    assert.equal(weather.source, 'Open-Meteo')
    assert.equal(weather.cacheStatus, 'live')
    assert.equal(weather.syncedAt, syncedAt)
    assert.equal(weather.current.temperature, 31.4)
    assert.equal(weather.current.feelsLike, 35.2)
    assert.equal(weather.current.humidity, 72)
    assert.equal(weather.current.weatherCode, 61)
    assert.equal(weather.current.isDay, true)
    assert.equal(weather.daily.length, 3)
    assert.deepEqual(weather.daily[0], {
      date: '2026-06-23',
      weatherCode: 61,
      temperatureMax: 34.2,
      temperatureMin: 26.6,
      precipitationProbability: 70,
      precipitationSum: 12.4,
      windSpeedMax: 29.2,
      sunrise: '2026-06-23T05:00',
      sunset: '2026-06-23T19:04',
    })
  })

  it('returns a stale cached weather payload if the live request fails after a successful sync', async () => {
    let calls = 0
    const fetcher = async () => {
      calls += 1
      if (calls === 1) {
        return {
          ok: true,
          json: async () => samplePayload,
        }
      }
      throw new Error('network unavailable')
    }

    const first = await fetchHangzhouWeather({ fetcher, now: () => new Date('2026-06-23T06:15:00.000Z') })
    const second = await fetchHangzhouWeather({ fetcher, now: () => new Date('2026-06-23T06:16:00.000Z'), force: true })

    assert.equal(first.cacheStatus, 'live')
    assert.equal(second.cacheStatus, 'stale')
    assert.equal(second.syncError, 'network unavailable')
    assert.equal(second.current.temperature, 31.4)
  })
})
