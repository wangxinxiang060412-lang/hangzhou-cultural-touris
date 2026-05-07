<script setup lang="ts">
import { computed, ref } from 'vue'
import ArchiveHeader from '../components/common/ArchiveHeader.vue'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { hotelOrigins, routePlanningLabels, routePlans } from '../data/routePlanning'
import { routes } from '../data/routes'
import { pickLocalized, pickLocalizedList, t } from '../i18n/site'
import { buildBookingPath, buildSpotDetailPath, findSpotIdFromText } from '../utils/scenicSpotLookup'

const getPrimarySpotId = (primaryStopText: string) => findSpotIdFromText(primaryStopText)
const activeRouteId = ref(routes[0]?.id ?? '')
const selectedOriginId = ref(hotelOrigins[0]?.id ?? '')
const selectedStopId = ref('')

const activeRoute = computed(() => routes.find((route) => route.id === activeRouteId.value) ?? routes[0])
const activePlan = computed(() => (activeRoute.value ? routePlans[activeRoute.value.id] : undefined))
const selectedOrigin = computed(
  () => hotelOrigins.find((origin) => origin.id === selectedOriginId.value) ?? hotelOrigins[0],
)
const selectedAccess = computed(() => {
  if (!activePlan.value || !selectedOrigin.value) return undefined

  return activePlan.value.hotelAccess[selectedOrigin.value.id]
})
const selectedStop = computed(() => {
  const stops = activePlan.value?.stops ?? []
  return stops.find((stop) => stop.id === selectedStopId.value) ?? stops[0] ?? null
})
const mapPolylinePoints = computed(() =>
  (activePlan.value?.stops ?? []).map((stop) => `${stop.x},${stop.y}`).join(' '),
)

const setActiveRoute = (routeId: string) => {
  activeRouteId.value = routeId
  selectedStopId.value = routePlans[routeId]?.stops[0]?.id ?? ''
}

const selectStop = (stopId: string) => {
  selectedStopId.value = stopId
}

const getStopSpotTarget = (spotText?: string) => (spotText ? buildSpotDetailPath(spotText) : null)

const focusPlannerRoute = (routeId: string) => {
  setActiveRoute(routeId)
  requestAnimationFrame(() => {
    document.getElementById('route-planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="routes-page" tabindex="-1">
      <section class="routes-page__hero" aria-labelledby="routes-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: t('nav.routes') },
          ]"
        />

        <div class="routes-page__hero-meta">
          <span>{{ t('routes.heroMeta.left') }}</span>
          <span>{{ t('routes.heroMeta.right', { count: routes.length.toString().padStart(2, '0') }) }}</span>
        </div>

        <ArchiveHeader
          :title-zh="t('routes.titleZh')"
          :title-en="t('routes.titleEn')"
          :description="t('routes.descriptionLong')"
        />
      </section>

      <section
        id="route-planner"
        class="routes-planner"
        :aria-label="pickLocalized(routePlanningLabels.sectionTitle)"
        data-reveal
      >
        <div class="routes-planner__head">
          <p class="routes-planner__eyebrow">{{ pickLocalized(routePlanningLabels.sectionEyebrow) }}</p>
          <div>
            <h2>{{ pickLocalized(routePlanningLabels.sectionTitle) }}</h2>
            <p v-if="activePlan">{{ pickLocalized(activePlan.mapHint) }}</p>
          </div>
        </div>

        <div class="routes-planner__controls">
          <div class="routes-planner__group" role="group" :aria-label="pickLocalized(routePlanningLabels.routeSelector)">
            <button
              v-for="route in routes"
              :key="route.id"
              type="button"
              class="routes-planner__tab"
              :class="{ 'is-active': route.id === activeRouteId }"
              :aria-pressed="route.id === activeRouteId"
              @click="setActiveRoute(route.id)"
            >
              <span>{{ route.id }}</span>
              {{ pickLocalized(route.title) }}
            </button>
          </div>

          <label class="routes-planner__origin">
            <span>{{ pickLocalized(routePlanningLabels.hotelSelector) }}</span>
            <select v-model="selectedOriginId">
              <option v-for="origin in hotelOrigins" :key="origin.id" :value="origin.id">
                {{ pickLocalized(origin.label) }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="activePlan && activeRoute" class="routes-planner__layout">
          <div class="routes-map" :aria-label="pickLocalized(routePlanningLabels.mapTitle)">
            <div class="routes-map__surface" aria-hidden="true">
              <span class="routes-map__water routes-map__water--lake"></span>
              <span class="routes-map__water routes-map__water--river"></span>
              <span class="routes-map__grid"></span>
            </div>
            <svg class="routes-map__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline :points="mapPolylinePoints" />
            </svg>
            <button
              v-for="(stop, index) in activePlan.stops"
              :key="stop.id"
              type="button"
              class="routes-map__pin"
              :class="{ 'is-active': selectedStop?.id === stop.id }"
              :style="{ left: `${stop.x}%`, top: `${stop.y}%` }"
              @click="selectStop(stop.id)"
            >
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <strong>{{ pickLocalized(stop.label) }}</strong>
            </button>

            <div v-if="selectedStop" class="routes-map__selected">
              <p>{{ pickLocalized(routePlanningLabels.selectedStop) }}</p>
              <h3>{{ pickLocalized(selectedStop.label) }}</h3>
              <span>{{ pickLocalized(selectedStop.note) }}</span>
              <RouterLink
                v-if="getStopSpotTarget(selectedStop.spotText)"
                :to="getStopSpotTarget(selectedStop.spotText) ?? '/scenic-spots'"
              >
                {{ t('routes.viewSpot') }}
              </RouterLink>
            </div>
          </div>

          <aside class="routes-planner__panel">
            <section class="routes-planner__block">
              <div class="routes-planner__block-head">
                <p>{{ pickLocalized(routePlanningLabels.fromHotel) }}</p>
                <strong>{{ activePlan.totalDistance }} · {{ activePlan.totalWalkMinutes }} {{ pickLocalized(routePlanningLabels.walkMinute) }}</strong>
              </div>
              <div v-if="selectedAccess" class="routes-access-grid">
                <article>
                  <span>{{ pickLocalized(routePlanningLabels.metro) }}</span>
                  <p>{{ pickLocalized(selectedAccess.metro) }}</p>
                </article>
                <article>
                  <span>{{ pickLocalized(routePlanningLabels.bus) }}</span>
                  <p>{{ pickLocalized(selectedAccess.bus) }}</p>
                </article>
                <article>
                  <span>{{ pickLocalized(routePlanningLabels.taxi) }}</span>
                  <p>{{ pickLocalized(selectedAccess.taxi) }}</p>
                </article>
              </div>
            </section>

            <section class="routes-planner__block">
              <div class="routes-planner__block-head">
                <p>{{ pickLocalized(routePlanningLabels.walkingLegs) }}</p>
              </div>
              <ol class="routes-leg-list">
                <li v-for="leg in activePlan.legs" :key="`${pickLocalized(leg.from)}-${pickLocalized(leg.to)}`">
                  <div>
                    <strong>{{ pickLocalized(leg.from) }} → {{ pickLocalized(leg.to) }}</strong>
                    <span>{{ leg.distance }} · {{ leg.walkMinutes }} {{ pickLocalized(routePlanningLabels.walkMinute) }}</span>
                  </div>
                  <p>{{ pickLocalized(leg.accessible) }}</p>
                </li>
              </ol>
            </section>

            <section v-if="selectedStop" class="routes-planner__block">
              <div class="routes-planner__block-head">
                <p>{{ pickLocalized(routePlanningLabels.nearby) }}</p>
              </div>
              <div class="routes-nearby">
                <component
                  :is="getStopSpotTarget(item.spotText) ? 'RouterLink' : 'div'"
                  v-for="item in selectedStop.nearby"
                  :key="pickLocalized(item.name)"
                  class="routes-nearby__item"
                  :to="getStopSpotTarget(item.spotText) ?? undefined"
                >
                  <span>{{ pickLocalized(item.type) }}</span>
                  <strong>{{ pickLocalized(item.name) }}</strong>
                  <small>{{ item.distance }} · {{ item.walkMinutes }} {{ pickLocalized(routePlanningLabels.walkMinute) }}</small>
                </component>
              </div>
            </section>

            <section class="routes-planner__block routes-planner__block--split">
              <article>
                <span>{{ pickLocalized(routePlanningLabels.accessibleRoute) }}</span>
                <p>{{ pickLocalized(activePlan.accessibilityRoute) }}</p>
              </article>
              <article>
                <span>{{ pickLocalized(routePlanningLabels.rainyAlternative) }}</span>
                <p>{{ pickLocalized(activePlan.rainyAlternative) }}</p>
              </article>
            </section>
          </aside>
        </div>
      </section>

      <section class="routes-page__list" :aria-label="t('routes.aria')" data-reveal>
        <article
          v-for="route in routes"
          :key="route.id"
          :id="`route-${route.id}`"
          class="routes-route"
        >
          <figure class="routes-route__media">
            <img
              v-if="route.image"
              :src="route.image"
              :alt="pickLocalized(route.title)"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="routes-route__placeholder" aria-hidden="true">{{ route.id }}</div>
          </figure>

          <header class="routes-route__heading">
            <p class="routes-route__id">{{ route.id }}</p>
            <h2 class="routes-route__title">{{ pickLocalized(route.title) }}</h2>
            <p class="routes-route__title-en">{{ route.titleEn }}</p>
            <p class="routes-route__meta">
              <span>{{ pickLocalized(route.duration) }}</span>
              <span class="routes-route__dot" aria-hidden="true">·</span>
              <span>{{ pickLocalized(route.pace) }}</span>
            </p>
          </header>

          <div class="routes-route__body">
            <p class="routes-route__description">{{ pickLocalized(route.description) }}</p>
            <p class="routes-route__audience">{{ t('routes.audiencePrefix') }}{{ pickLocalized(route.audience) }}</p>
            <div v-if="routePlans[route.id]" class="routes-route__metrics">
              <span>{{ routePlans[route.id].totalDistance }}</span>
              <span>{{ routePlans[route.id].totalWalkMinutes }} {{ pickLocalized(routePlanningLabels.walkMinute) }}</span>
            </div>

            <ol class="routes-route__path" :aria-label="t('routes.stopsAria', { title: pickLocalized(route.title) })">
              <li v-for="(stop, index) in pickLocalizedList(route.stops)" :key="stop">
                <span class="routes-route__index">{{ String(index + 1).padStart(2, '0') }}</span>
                <RouterLink
                  v-if="buildSpotDetailPath(stop)"
                  :to="buildSpotDetailPath(stop) ?? '/scenic-spots'"
                  class="routes-route__stop routes-route__stop--link"
                >
                  {{ stop }}
                </RouterLink>
                <span v-else class="routes-route__stop">{{ stop }}</span>
              </li>
            </ol>

            <div class="routes-route__actions">
              <RouterLink
                v-if="getPrimarySpotId(route.primaryStopText)"
                :to="`/scenic-spots/${getPrimarySpotId(route.primaryStopText)}`"
                class="routes-route__action"
              >
                {{ t('routes.viewSpot') }}
              </RouterLink>
              <RouterLink
                v-if="buildBookingPath(route.primaryStopText)"
                :to="buildBookingPath(route.primaryStopText) ?? '/scenic-spots'"
                class="routes-route__action"
              >
                {{ t('routes.bookDirect') }}
              </RouterLink>
              <button type="button" class="routes-route__action" @click="focusPlannerRoute(route.id)">
                {{ pickLocalized(routePlanningLabels.mapTitle) }}
              </button>
            </div>
          </div>
        </article>
      </section>

      <section class="routes-page__close" data-reveal="soft">
        <div class="routes-page__links">
          <RouterLink to="/scenic-spots" class="routes-page__back">
            <span class="back-rule" aria-hidden="true"></span>
            <span>{{ t('routes.gotoReservations') }}</span>
          </RouterLink>
          <RouterLink to="/visit-guide" class="routes-page__back">
            <span class="back-rule" aria-hidden="true"></span>
            <span>{{ t('page.visitGuide') }}</span>
          </RouterLink>
          <RouterLink to="/" class="routes-page__back">
            <span class="back-rule" aria-hidden="true"></span>
            <span>{{ t('routes.gotoHome') }}</span>
          </RouterLink>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.routes-page {
  background: var(--paper-light);
  color: var(--ink);
}

.routes-page__hero,
.routes-planner,
.routes-page__list,
.routes-page__close {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(20px, 3vw, 48px);
}

.routes-page__hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: clamp(50px, 7vw, 90px);
}

.routes-page__hero-meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: clamp(36px, 5vw, 56px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.42);
}

.routes-planner {
  padding-bottom: clamp(58px, 8vw, 104px);
}

.routes-planner__head {
  display: grid;
  grid-template-columns: minmax(11rem, 0.24fr) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 78px);
  padding-bottom: clamp(24px, 4vw, 42px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.routes-planner__eyebrow,
.routes-planner__block-head p,
.routes-planner__origin span,
.routes-map__selected p,
.routes-access-grid span,
.routes-planner__block--split span,
.routes-nearby__item span {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.46);
}

.routes-planner__head h2 {
  margin: 0;
  max-width: 16em;
  font-family: var(--font-serif);
  font-size: clamp(30px, 4.2vw, 58px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.08;
}

.routes-planner__head p:not(.routes-planner__eyebrow) {
  max-width: 44rem;
  margin: 18px 0 0;
  color: rgba(16, 20, 18, 0.62);
  font-size: 14px;
  letter-spacing: 0.04em;
  line-height: 1.9;
}

.routes-planner__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.32fr);
  gap: 16px;
  align-items: end;
  padding: clamp(22px, 3vw, 34px) 0;
}

.routes-planner__group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.routes-planner__tab,
.routes-route__action {
  appearance: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-decoration: none;
}

.routes-planner__tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  color: rgba(16, 20, 18, 0.64);
  font-size: 12px;
  letter-spacing: 0.12em;
  transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
}

.routes-planner__tab span {
  font-family: var(--font-serif);
  letter-spacing: 0.16em;
}

.routes-planner__tab:hover,
.routes-planner__tab:focus-visible,
.routes-planner__tab.is-active {
  border-color: rgba(31, 58, 52, 0.42);
  color: var(--deep-green);
  background: rgba(31, 58, 52, 0.06);
  outline: none;
}

.routes-planner__origin {
  display: grid;
  gap: 10px;
}

.routes-planner__origin select {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(16, 20, 18, 0.14);
  border-radius: 0;
  background: rgba(255, 255, 255, 0.56);
  color: rgba(16, 20, 18, 0.72);
  font: inherit;
  font-size: 13px;
}

.routes-planner__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.78fr);
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(16, 20, 18, 0.1);
  gap: 1px;
}

.routes-map {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(244, 239, 230, 0.94), rgba(225, 232, 222, 0.7)),
    rgba(244, 239, 230, 0.92);
}

.routes-map__surface,
.routes-map__line {
  position: absolute;
  inset: 0;
}

.routes-map__surface {
  overflow: hidden;
}

.routes-map__water {
  position: absolute;
  display: block;
  border: 1px solid rgba(31, 58, 52, 0.08);
  background: rgba(130, 164, 157, 0.22);
  filter: saturate(0.86);
}

.routes-map__water--lake {
  left: -7%;
  top: 12%;
  width: 54%;
  height: 58%;
  border-radius: 48% 52% 42% 58%;
}

.routes-map__water--river {
  right: -14%;
  top: 20%;
  width: 58%;
  height: 24%;
  border-radius: 999px;
  transform: rotate(-24deg);
}

.routes-map__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(16, 20, 18, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 20, 18, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(135deg, transparent, #000 24%, #000 76%, transparent);
}

.routes-map__line {
  width: 100%;
  height: 100%;
}

.routes-map__line polyline {
  fill: none;
  stroke: rgba(31, 58, 52, 0.56);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 4 3;
  vector-effect: non-scaling-stroke;
}

.routes-map__pin {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 180px;
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid rgba(31, 58, 52, 0.18);
  background: rgba(255, 252, 245, 0.88);
  color: rgba(16, 20, 18, 0.76);
  box-shadow: 0 12px 30px rgba(16, 20, 18, 0.08);
  transform: translate(-50%, -50%);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
  cursor: pointer;
}

.routes-map__pin span {
  display: grid;
  place-items: center;
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(31, 58, 52, 0.1);
  font-family: var(--font-serif);
  font-size: 11px;
}

.routes-map__pin strong {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.routes-map__pin:hover,
.routes-map__pin:focus-visible,
.routes-map__pin.is-active {
  z-index: 3;
  border-color: rgba(31, 58, 52, 0.5);
  background: rgba(31, 58, 52, 0.94);
  color: #fffaf0;
  outline: none;
  transform: translate(-50%, -50%) translateY(-3px);
}

.routes-map__pin.is-active span,
.routes-map__pin:hover span,
.routes-map__pin:focus-visible span {
  background: rgba(255, 250, 240, 0.16);
}

.routes-map__selected {
  position: absolute;
  z-index: 4;
  left: 24px;
  bottom: 24px;
  max-width: min(360px, calc(100% - 48px));
  padding: 20px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(255, 252, 245, 0.92);
  box-shadow: 0 18px 44px rgba(16, 20, 18, 0.1);
  backdrop-filter: blur(14px);
}

.routes-map__selected h3 {
  margin: 8px 0 10px;
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.06em;
}

.routes-map__selected span {
  display: block;
  color: rgba(16, 20, 18, 0.62);
  font-size: 13px;
  letter-spacing: 0.04em;
  line-height: 1.8;
}

.routes-map__selected a {
  display: inline-flex;
  margin-top: 14px;
  color: var(--deep-green);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.routes-planner__panel {
  display: grid;
  align-content: start;
  gap: 1px;
  background: rgba(16, 20, 18, 0.1);
}

.routes-planner__block {
  padding: 22px;
  background: rgba(255, 252, 245, 0.94);
}

.routes-planner__block-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: baseline;
  margin-bottom: 16px;
}

.routes-planner__block-head strong {
  white-space: nowrap;
  color: var(--deep-green);
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.08em;
}

.routes-access-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: rgba(16, 20, 18, 0.08);
  border: 1px solid rgba(16, 20, 18, 0.08);
}

.routes-access-grid article {
  min-width: 0;
  padding: 16px;
  background: rgba(255, 252, 245, 0.92);
}

.routes-access-grid p,
.routes-planner__block--split p,
.routes-leg-list p {
  margin: 10px 0 0;
  color: rgba(16, 20, 18, 0.62);
  font-size: 13px;
  letter-spacing: 0.04em;
  line-height: 1.75;
}

.routes-leg-list {
  list-style: none;
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.routes-leg-list li {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.routes-leg-list li:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.routes-leg-list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.routes-leg-list strong {
  color: rgba(16, 20, 18, 0.76);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.routes-leg-list span {
  flex: 0 0 auto;
  color: var(--deep-green);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.routes-nearby {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.routes-nearby__item {
  display: grid;
  gap: 7px;
  min-height: 112px;
  padding: 14px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  color: inherit;
  text-decoration: none;
  transition: border-color 180ms ease, background 180ms ease;
}

.routes-nearby__item:hover,
.routes-nearby__item:focus-visible {
  border-color: rgba(31, 58, 52, 0.34);
  background: rgba(31, 58, 52, 0.05);
  outline: none;
}

.routes-nearby__item strong {
  min-width: 0;
  color: rgba(16, 20, 18, 0.76);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.routes-nearby__item small {
  color: rgba(16, 20, 18, 0.5);
  font-size: 12px;
  letter-spacing: 0.04em;
}

.routes-planner__block--split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  padding: 0;
  background: rgba(16, 20, 18, 0.08);
}

.routes-planner__block--split article {
  padding: 22px;
  background: rgba(255, 252, 245, 0.94);
}

.routes-page__list {
  padding-bottom: clamp(60px, 8vw, 100px);
}

.routes-route {
  display: grid;
  grid-template-columns: minmax(12rem, 0.28fr) minmax(14rem, 0.34fr) minmax(0, 1fr);
  gap: clamp(28px, 6vw, 92px);
  padding: clamp(40px, 5vw, 70px) 0;
  border-top: 1px solid rgba(16, 20, 18, 0.1);
  align-items: start;
}

.routes-route:last-child {
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.routes-route__id {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.22em;
  color: rgba(16, 20, 18, 0.42);
}

.routes-route__title {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: clamp(30px, 4vw, 56px);
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.05;
  color: var(--ink);
}

.routes-route__title-en {
  margin-top: 12px;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.46);
}

.routes-route__meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.5);
}

.routes-route__dot {
  opacity: 0.5;
}

.routes-route__body {
  display: grid;
  gap: clamp(24px, 3vw, 36px);
}

.routes-route__description {
  max-width: 36rem;
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.1vw, 19px);
  line-height: 1.95;
  letter-spacing: 0.04em;
  color: rgba(16, 20, 18, 0.7);
}

.routes-route__audience {
  color: rgba(16, 20, 18, 0.5);
  font-size: 13px;
  letter-spacing: 0.06em;
  line-height: 1.8;
}

.routes-route__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.routes-route__metrics span {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 0 10px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  color: var(--deep-green);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.routes-route__path {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-top: 1px solid rgba(16, 20, 18, 0.08);
}

.routes-route__path li {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 18px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  align-items: baseline;
}

.routes-route__index {
  color: rgba(16, 20, 18, 0.4);
  font-family: var(--font-serif);
  font-size: 11px;
  letter-spacing: 0.28em;
}

.routes-route__stop {
  font-family: var(--font-serif);
  font-size: clamp(15px, 1.2vw, 19px);
  letter-spacing: 0.06em;
  color: rgba(16, 20, 18, 0.78);
}

.routes-route__stop--link {
  transition: color 180ms ease;
}

.routes-route__stop--link:hover,
.routes-route__stop--link:focus-visible {
  color: var(--deep-green);
  outline: none;
}

.routes-route__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.routes-route__action {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  color: var(--deep-green);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  transition: border-color 180ms ease, background 180ms ease;
}

.routes-route__action:hover,
.routes-route__action:focus-visible {
  border-color: rgba(31, 58, 52, 0.34);
  background: rgba(31, 58, 52, 0.05);
  outline: none;
}

.routes-page__close {
  padding-top: clamp(50px, 7vw, 90px);
  padding-bottom: clamp(60px, 8vw, 110px);
}

.routes-page__links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 28px;
}

.routes-page__back {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.5);
  transition: color 220ms ease, transform 220ms ease;
}

.routes-page__back .back-rule {
  display: inline-block;
  width: 32px;
  height: 1px;
  background: rgba(16, 20, 18, 0.22);
  transition: background 220ms ease, width 220ms ease;
}

.routes-page__back:hover,
.routes-page__back:focus-visible {
  color: var(--deep-green);
  transform: translateX(-3px);
  outline: none;
}

.routes-page__back:hover .back-rule {
  background: var(--deep-green);
  width: 52px;
}

.routes-route__media {
  margin: 0;
  aspect-ratio: 4 / 3.2;
  overflow: hidden;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(216, 221, 214, 0.42);
}

.routes-route__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  filter: saturate(0.82) contrast(0.94);
}

.routes-route__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(31, 58, 52, 0.42);
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 46px);
  letter-spacing: 0.12em;
  background: linear-gradient(135deg, rgba(244, 239, 230, 0.96), rgba(216, 221, 214, 0.62));
}

@media (max-width: 900px) {
  .routes-planner__head,
  .routes-planner__controls,
  .routes-planner__layout {
    grid-template-columns: 1fr;
  }

  .routes-map {
    min-height: 430px;
  }

  .routes-access-grid,
  .routes-planner__block--split {
    grid-template-columns: 1fr;
  }

  .routes-route {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}

@media (max-width: 640px) {
  .routes-page__hero,
  .routes-planner,
  .routes-page__list,
  .routes-page__close {
    padding-inline: 18px;
  }

  .routes-page__hero-meta {
    font-size: 10px;
    letter-spacing: 0.22em;
  }

  .routes-route__title {
    font-size: clamp(28px, 8vw, 36px);
  }

  .routes-planner__head h2 {
    font-size: clamp(28px, 8vw, 38px);
  }

  .routes-planner__group,
  .routes-planner__tab,
  .routes-route__actions,
  .routes-route__action {
    width: 100%;
  }

  .routes-planner__tab,
  .routes-route__action {
    justify-content: center;
  }

  .routes-map {
    min-height: 410px;
    overflow: visible;
  }

  .routes-map__pin {
    max-width: 142px;
    padding: 7px 9px;
  }

  .routes-map__pin strong {
    font-size: 11px;
  }

  .routes-map__selected {
    position: relative;
    left: auto;
    bottom: auto;
    max-width: none;
    margin: 300px 14px 14px;
  }

  .routes-planner__block,
  .routes-planner__block--split article {
    padding: 18px;
  }

  .routes-planner__block-head,
  .routes-leg-list div {
    display: grid;
  }

  .routes-nearby {
    grid-template-columns: 1fr;
  }

  .routes-route__path li {
    grid-template-columns: 50px 1fr;
    gap: 12px;
  }
}
</style>
