<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { siteLocale, t } from '../../i18n/site'
import {
  ensureHangzhouWeather,
  hangzhouWeather,
  refreshHangzhouWeather,
  weatherCodeKey,
  weatherError,
  weatherLoading,
  weatherTravelRiskKey,
} from '../../stores/weather'

const formatTemperature = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}°C` : '--'

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

const currentWeatherText = computed(() =>
  hangzhouWeather.value
    ? t(weatherCodeKey(hangzhouWeather.value.current.weatherCode))
    : t('weather.unknown'),
)

onMounted(() => {
  void ensureHangzhouWeather()
})
</script>

<template>
  <aside class="weather-brief" :aria-label="t('weather.aria')">
    <div class="weather-brief__head">
      <span>{{ t('weather.now') }}</span>
      <button type="button" :disabled="weatherLoading" @click="refreshHangzhouWeather(true)">
        {{ weatherLoading ? t('weather.syncing') : t('weather.sync') }}
      </button>
    </div>

    <template v-if="hangzhouWeather">
      <div class="weather-brief__main">
        <strong>{{ formatTemperature(hangzhouWeather.current.temperature) }}</strong>
        <span>{{ currentWeatherText }}</span>
      </div>
      <p>{{ t(weatherTravelRiskKey) }}</p>
      <small>{{ t('weather.syncedAt', { time: formatSyncTime(hangzhouWeather.syncedAt) }) }}</small>
    </template>

    <p v-else class="weather-brief__message">
      {{ weatherError ? t('weather.error') : t('weather.loading') }}
    </p>
  </aside>
</template>

<style scoped>
.weather-brief {
  display: grid;
  gap: 18px;
  padding: 18px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(250, 247, 240, 0.86);
}

.weather-brief__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.weather-brief__head span,
.weather-brief small {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.weather-brief__head button {
  padding: 8px 10px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  background: rgba(255, 252, 244, 0.9);
  color: rgba(16, 20, 18, 0.62);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.weather-brief__head button:disabled {
  cursor: wait;
  opacity: 0.58;
}

.weather-brief__main {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.weather-brief__main strong {
  font-family: var(--font-serif);
  font-size: clamp(42px, 5vw, 58px);
  font-weight: 400;
  letter-spacing: 0;
  line-height: 0.9;
}

.weather-brief__main span {
  color: rgba(16, 20, 18, 0.66);
  font-family: var(--font-serif);
  font-size: 20px;
}

.weather-brief p {
  color: rgba(16, 20, 18, 0.66);
  font-size: 13px;
  line-height: 1.75;
}

.weather-brief__message {
  margin: 0;
}
</style>
