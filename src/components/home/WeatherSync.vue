<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { siteLocale, t } from '../../i18n/site'
import {
  hangzhouWeather,
  refreshHangzhouWeather,
  weatherCodeKey,
  weatherError,
  weatherLoading,
  weatherTravelRiskKey,
} from '../../stores/weather'

const weather = hangzhouWeather
const isLoading = weatherLoading
const errorMessage = weatherError
let syncTimer = 0

const formatTemperature = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}°C` : '--'

const formatNumber = (value?: number, suffix = '') =>
  typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}${suffix}` : '--'

const formatSyncTime = (value?: string) => {
  if (!value) return '--'

  return new Intl.DateTimeFormat(siteLocale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(siteLocale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00+08:00`))

const currentWeatherText = computed(() =>
  weather.value ? t(weatherCodeKey(weather.value.current.weatherCode)) : t('weather.unknown'),
)

const syncWeather = () => refreshHangzhouWeather(true)

onMounted(() => {
  void refreshHangzhouWeather()
  syncTimer = window.setInterval(() => {
    void refreshHangzhouWeather(true)
  }, 10 * 60 * 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(syncTimer)
})
</script>

<template>
  <section class="weather-sync" :aria-label="t('weather.aria')" data-reveal>
    <div class="weather-sync__inner">
      <header class="weather-sync__header">
        <div>
          <p class="weather-sync__eyebrow">{{ t('weather.eyebrow') }}</p>
          <h2>{{ t('weather.title') }}</h2>
          <p>{{ t('weather.description') }}</p>
        </div>

        <button type="button" :disabled="isLoading" @click="syncWeather">
          {{ isLoading ? t('weather.syncing') : t('weather.sync') }}
        </button>
      </header>

      <div v-if="weather" class="weather-sync__grid">
        <article class="weather-sync__current">
          <div class="weather-sync__current-head">
            <span>{{ t('weather.now') }}</span>
            <strong>{{ currentWeatherText }}</strong>
          </div>
          <p class="weather-sync__temperature">{{ formatTemperature(weather.current.temperature) }}</p>
          <dl>
            <div>
              <dt>{{ t('weather.feelsLike') }}</dt>
              <dd>{{ formatTemperature(weather.current.feelsLike) }}</dd>
            </div>
            <div>
              <dt>{{ t('weather.humidity') }}</dt>
              <dd>{{ formatNumber(weather.current.humidity, '%') }}</dd>
            </div>
            <div>
              <dt>{{ t('weather.wind') }}</dt>
              <dd>{{ formatNumber(weather.current.windSpeed, ' km/h') }}</dd>
            </div>
            <div>
              <dt>{{ t('weather.precipitation') }}</dt>
              <dd>{{ weather.current.precipitation.toFixed(1) }} mm</dd>
            </div>
          </dl>
        </article>

        <article class="weather-sync__travel">
          <span>{{ t('weather.travelIndex') }}</span>
          <p>{{ t(weatherTravelRiskKey) }}</p>
          <small>{{ t('weather.syncedAt', { time: formatSyncTime(weather.syncedAt) }) }}</small>
          <small>{{ t('weather.source', { source: weather.source }) }}</small>
        </article>

        <article class="weather-sync__forecast">
          <header>
            <span>{{ t('weather.forecast') }}</span>
          </header>
          <div class="weather-sync__days">
            <div v-for="day in weather.daily" :key="day.date">
              <span>{{ formatDate(day.date) }}</span>
              <strong>{{ t(weatherCodeKey(day.weatherCode)) }}</strong>
              <p>{{ formatTemperature(day.temperatureMin) }} / {{ formatTemperature(day.temperatureMax) }}</p>
              <small>{{ t('weather.rainChance') }} {{ formatNumber(day.precipitationProbability, '%') }}</small>
            </div>
          </div>
        </article>
      </div>

      <p v-else-if="errorMessage" class="weather-sync__message">
        {{ t('weather.error') }}
      </p>
      <p v-else class="weather-sync__message">
        {{ t('weather.loading') }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.weather-sync {
  background: linear-gradient(180deg, rgba(244, 239, 230, 0.92), rgba(250, 247, 240, 0.98));
  color: var(--ink);
}

.weather-sync__inner {
  max-width: 1360px;
  margin: 0 auto;
  padding: clamp(72px, 9vw, 128px) clamp(20px, 3vw, 48px);
}

.weather-sync__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding-bottom: clamp(28px, 4vw, 48px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.weather-sync__eyebrow,
.weather-sync__current-head span,
.weather-sync__travel span,
.weather-sync__forecast header span,
.weather-sync__days span,
.weather-sync__travel small {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.weather-sync__header h2 {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: clamp(30px, 4vw, 58px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.16;
}

.weather-sync__header p:not(.weather-sync__eyebrow) {
  max-width: 46rem;
  margin-top: 18px;
  color: rgba(16, 20, 18, 0.62);
  font-size: 15px;
  line-height: 1.9;
}

.weather-sync__header button {
  min-width: 150px;
  padding: 12px 16px;
  border: 1px solid rgba(16, 20, 18, 0.14);
  background: rgba(250, 247, 240, 0.9);
  color: rgba(16, 20, 18, 0.72);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
}

.weather-sync__header button:disabled {
  cursor: wait;
  opacity: 0.58;
}

.weather-sync__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(16rem, 0.62fr) minmax(0, 1fr);
  gap: 1px;
  margin-top: clamp(28px, 4vw, 48px);
  border: 1px solid rgba(16, 20, 18, 0.09);
  background: rgba(16, 20, 18, 0.09);
}

.weather-sync__current,
.weather-sync__travel,
.weather-sync__forecast {
  min-width: 0;
  background: rgba(250, 247, 240, 0.92);
  padding: clamp(22px, 3vw, 34px);
}

.weather-sync__current {
  display: grid;
  gap: 26px;
}

.weather-sync__current-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.weather-sync__current-head strong {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 400;
}

.weather-sync__temperature {
  font-family: var(--font-serif);
  font-size: clamp(62px, 8vw, 108px);
  letter-spacing: 0;
  line-height: 0.9;
}

.weather-sync__current dl,
.weather-sync__days {
  display: grid;
  gap: 1px;
  background: rgba(16, 20, 18, 0.08);
}

.weather-sync__current dl {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.weather-sync__current dl div,
.weather-sync__days div {
  background: rgba(255, 252, 244, 0.84);
  padding: 16px;
}

.weather-sync__current dt {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.weather-sync__current dd {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 20px;
}

.weather-sync__travel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.weather-sync__travel p {
  font-family: var(--font-serif);
  font-size: clamp(20px, 2vw, 30px);
  line-height: 1.55;
}

.weather-sync__forecast {
  display: grid;
  gap: 18px;
}

.weather-sync__days div {
  display: grid;
  gap: 8px;
}

.weather-sync__days strong {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 400;
}

.weather-sync__days p,
.weather-sync__days small {
  color: rgba(16, 20, 18, 0.62);
  font-size: 13px;
  line-height: 1.6;
}

.weather-sync__message {
  margin-top: 26px;
  color: rgba(16, 20, 18, 0.62);
  font-size: 14px;
}

@media (max-width: 1080px) {
  .weather-sync__header,
  .weather-sync__grid {
    grid-template-columns: 1fr;
  }

  .weather-sync__header button {
    width: fit-content;
  }
}

@media (max-width: 640px) {
  .weather-sync__current dl {
    grid-template-columns: 1fr;
  }
}
</style>
