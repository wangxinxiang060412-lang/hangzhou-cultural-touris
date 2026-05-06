<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getSpotImage, getSpotImagePosition } from '../../data/spotImages'
import { t } from '../../i18n/site'
import {
  bookingSlots,
  ensureCatalog,
  featuredScenicSpots,
} from '../../stores/catalog'
import { formatLocalDate } from '../../utils/date'
import {
  localizeSpotArea,
  localizeSpotCategory,
  localizeSpotName,
} from '../../utils/localization'

const today = formatLocalDate(new Date())

const featuredCount = computed(() => featuredScenicSpots.value.length.toString().padStart(2, '0'))

const spotStates = computed(() =>
  featuredScenicSpots.value.map((spot) => {
    const todaySlots = bookingSlots.value.filter(
      (slot) => slot.scenicSpotId === spot.id && slot.date === today,
    )
    const remaining = todaySlots.reduce((total, slot) => total + slot.remaining, 0)

    return {
      ...spot,
      image: getSpotImage(spot.id),
      todayState:
        todaySlots.length === 0
          ? spot.reservationRequired
            ? t('state.notReleased')
            : t('state.openVisitShort')
          : remaining > 0
            ? t('state.todayAvailable')
            : spot.reservationRequired
              ? t('state.todayFull')
              : t('state.openVisitShort'),
    }
  }),
)

onMounted(() => {
  void ensureCatalog()
})
</script>

<template>
  <section id="reservations" class="featured-booking" aria-labelledby="featured-booking-title">
    <div class="featured-booking__inner">
      <header class="featured-booking__heading" data-reveal>
        <div class="featured-booking__meta">
          <p>{{ t('featured.eyebrow') }}</p>
          <p>{{ featuredCount }} {{ t('featured.unit') }}</p>
        </div>

        <div class="featured-booking__title-row">
          <p id="featured-booking-title" class="featured-booking__title-zh">{{ t('featured.titleZh') }}</p>
          <div class="featured-booking__copy">
            <h2>{{ t('featured.titleEn') }}</h2>
            <p>{{ t('featured.description') }}</p>
          </div>
        </div>
      </header>

      <div class="featured-booking__grid" data-reveal style="--reveal-delay: 120ms">
        <article v-for="spot in spotStates" :key="spot.id" class="booking-card">
          <RouterLink
            :to="`/scenic-spots/${spot.id}`"
            class="booking-card__media"
            :aria-label="t('featured.viewSpotAria', { name: localizeSpotName(spot) })"
          >
            <img
              v-if="spot.image"
              :src="spot.image"
              :alt="localizeSpotName(spot)"
              :style="{ objectPosition: getSpotImagePosition(spot.id, 'featured') }"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="booking-card__placeholder" aria-hidden="true">
              <span>{{ spot.nameEn.slice(0, 2) }}</span>
            </div>
          </RouterLink>

          <div class="booking-card__body">
            <div class="booking-card__index">
              <span>{{ localizeSpotArea(spot) }}</span>
              <span>{{ localizeSpotCategory(spot) }}</span>
            </div>

            <RouterLink :to="`/scenic-spots/${spot.id}`" class="booking-card__title">
              <h3>{{ localizeSpotName(spot) }}</h3>
              <p>{{ spot.nameEn }}</p>
            </RouterLink>

            <div class="booking-card__state">
              <span>{{ spot.reservationRequired ? t('state.reservationRequired') : t('state.openVisit') }}</span>
              <span>{{ spot.todayState }}</span>
            </div>

            <RouterLink class="booking-card__action" :to="`/scenic-spots/${spot.id}`">
              <span>{{ t('featured.viewSpot') }}</span>
              <span aria-hidden="true">→</span>
            </RouterLink>

            <RouterLink
              class="booking-card__action booking-card__action--soft"
              :to="{ path: '/booking', query: { spot: spot.id } }"
            >
              <span>{{ t('common.reservation') }}</span>
              <span aria-hidden="true">→</span>
            </RouterLink>
          </div>
        </article>
      </div>

      <RouterLink to="/scenic-spots" class="featured-booking__more" data-reveal="soft">
        <span class="more-rule" aria-hidden="true"></span>
        <span>{{ t('featured.moreLink') }}</span>
        <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.featured-booking {
  position: relative;
  overflow: hidden;
  overflow: clip;
  background:
    radial-gradient(circle at 18% 14%, rgba(127, 156, 141, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(250, 247, 240, 0.98), rgba(244, 239, 230, 0.92));
}

.featured-booking::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 20%),
    repeating-linear-gradient(
      0deg,
      rgba(16, 20, 18, 0.014) 0,
      rgba(16, 20, 18, 0.014) 1px,
      transparent 1px,
      transparent 18px
    );
  pointer-events: none;
}

.featured-booking__inner {
  position: relative;
  z-index: 1;
  max-width: 1420px;
  margin: 0 auto;
  padding: clamp(92px, 11vw, 160px) clamp(20px, 3vw, 48px);
}

.featured-booking__heading {
  max-width: 980px;
}

.featured-booking__meta {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.09);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.featured-booking__title-row {
  display: grid;
  grid-template-columns: minmax(10rem, 0.42fr) minmax(0, 1fr);
  gap: clamp(26px, 4vw, 52px);
  padding-top: clamp(22px, 3vw, 34px);
}

.featured-booking__title-zh {
  color: rgba(16, 20, 18, 0.88);
  font-family: var(--font-serif);
  font-size: clamp(40px, 5vw, 68px);
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1;
}

.featured-booking__copy {
  max-width: 34rem;
  padding-top: 6px;
}

.featured-booking__copy h2 {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: clamp(24px, 2.4vw, 34px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.16;
}

.featured-booking__copy p {
  max-width: 28rem;
  margin-top: 18px;
  color: rgba(16, 20, 18, 0.56);
  font-size: 14px;
  letter-spacing: 0.05em;
  line-height: 1.85;
}

.featured-booking__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-top: clamp(52px, 6vw, 84px);
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.booking-card {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
  background: rgba(250, 247, 240, 0.92);
}

.booking-card__media {
  display: block;
  aspect-ratio: 4 / 2.35;
  overflow: hidden;
  background: rgba(216, 221, 214, 0.42);
}

.booking-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  filter: saturate(0.82) contrast(0.94);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.booking-card:hover .booking-card__media img {
  transform: scale(1.035);
}

.booking-card__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(31, 58, 52, 0.42);
  font-family: var(--font-serif);
  font-size: clamp(34px, 5vw, 64px);
  letter-spacing: 0.18em;
  background:
    radial-gradient(circle at 70% 22%, rgba(127, 156, 141, 0.16), transparent 28%),
    linear-gradient(135deg, rgba(244, 239, 230, 0.9), rgba(216, 221, 214, 0.62));
}

.booking-card__body {
  display: grid;
  gap: 22px;
  padding: clamp(22px, 2.4vw, 32px);
}

.booking-card__index,
.booking-card__state {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.booking-card__title {
  display: block;
  min-width: 0;
}

.booking-card__title h3 {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.16;
}

.booking-card__title p {
  margin-top: 8px;
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  line-height: 1.5;
}

.booking-card__state {
  padding-top: 18px;
  border-top: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.58);
}

.booking-card__action,
.featured-booking__more {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-self: start;
  color: rgba(31, 58, 52, 0.72);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  transition: color 220ms ease, transform 220ms ease;
}

.booking-card__action--soft {
  color: rgba(16, 20, 18, 0.5);
}

.booking-card__action:hover,
.booking-card__action:focus-visible,
.featured-booking__more:hover,
.featured-booking__more:focus-visible {
  color: var(--deep-green);
  transform: translateX(3px);
  outline: none;
}

.featured-booking__more {
  margin-top: clamp(40px, 5vw, 68px);
  color: rgba(16, 20, 18, 0.5);
}

.more-rule {
  display: inline-block;
  width: 38px;
  height: 1px;
  background: rgba(16, 20, 18, 0.22);
}

@media (max-width: 1080px) {
  .featured-booking__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .featured-booking__inner {
    padding-inline: 18px;
  }

  .featured-booking__title-row,
  .featured-booking__grid {
    grid-template-columns: 1fr;
  }

  .featured-booking__meta,
  .booking-card__index,
  .booking-card__state {
    letter-spacing: 0.18em;
  }
}
</style>
