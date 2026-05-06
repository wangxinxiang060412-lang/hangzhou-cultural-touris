<script setup lang="ts">
import ArchiveHeader from '../components/common/ArchiveHeader.vue'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { routes } from '../data/routes'
import { pickLocalized, pickLocalizedList, t } from '../i18n/site'
import { buildBookingPath, buildSpotDetailPath, findSpotIdFromText } from '../utils/scenicSpotLookup'

const getPrimarySpotId = (primaryStopText: string) => findSpotIdFromText(primaryStopText)
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
  .routes-route {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}

@media (max-width: 640px) {
  .routes-page__hero,
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

  .routes-route__path li {
    grid-template-columns: 50px 1fr;
    gap: 12px;
  }
}
</style>
