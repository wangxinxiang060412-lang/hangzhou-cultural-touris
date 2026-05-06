<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { seasons } from '../../data/seasons'
import { pickLocalized, t } from '../../i18n/site'

const activeSeasonIndex = ref(0)
const seasonScroll = ref<HTMLElement | null>(null)
let rafId = 0
let ticking = false

const activeSeason = computed(() => seasons[activeSeasonIndex.value] ?? seasons[0])
const activeSeasonClass = computed(() => activeSeason.value.titleEn.toLowerCase())

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const updateActiveSeason = () => {
  const section = seasonScroll.value
  if (!section || typeof window === 'undefined') {
    ticking = false
    return
  }

  const viewport = window.innerHeight || 1
  const rect = section.getBoundingClientRect()
  const scrollable = Math.max(section.offsetHeight - viewport, viewport)
  const winterHold = viewport * 1.05
  const activeRange = Math.max(scrollable - winterHold, viewport)
  const travelled = clamp(-rect.top, 0, activeRange)
  const progress = clamp(travelled / activeRange, 0, 0.999)
  const nextIndex = Math.min(seasons.length - 1, Math.floor(progress * seasons.length))

  if (nextIndex !== activeSeasonIndex.value) {
    activeSeasonIndex.value = nextIndex
  }

  ticking = false
}

const requestSeasonUpdate = () => {
  if (ticking) return
  ticking = true
  rafId = window.requestAnimationFrame(updateActiveSeason)
}

onMounted(() => {
  updateActiveSeason()
  window.addEventListener('scroll', requestSeasonUpdate, { passive: true })
  window.addEventListener('resize', requestSeasonUpdate, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestSeasonUpdate)
  window.removeEventListener('resize', requestSeasonUpdate)
  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
})
</script>

<template>
  <section
    id="seasons"
    class="season-story"
    :class="`season-story--${activeSeasonClass}`"
    :aria-label="t('season.aria')"
  >
    <div ref="seasonScroll" class="season-story__scroll">
      <div class="season-story__sticky" data-reveal>
        <div class="season-story__panel">
          <div class="season-story__intro">
            <p class="season-story__eyebrow">{{ t('season.eyebrow') }}</p>
            <h2>{{ t('season.title') }}</h2>
            <p>{{ t('season.description') }}</p>
          </div>

          <figure class="season-story__media">
            <img
              v-for="(season, index) in seasons"
              :key="season.id"
              :src="season.image"
              :alt="t('season.imageAlt', { title: pickLocalized(season.title) })"
              class="season-story__image"
              :class="{ 'is-active': index === activeSeasonIndex }"
              :style="{ objectPosition: season.imagePosition }"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div class="season-story__copy">
            <div class="season-story__text-shell">
              <Transition name="season-copy">
                <div :key="activeSeason.id" class="season-story__text">
                  <p class="season-story__count">
                    <span>{{ activeSeason.id }}</span>
                    <span>/</span>
                    <span>{{ seasons.length.toString().padStart(2, '0') }}</span>
                  </p>
                  <h3>{{ pickLocalized(activeSeason.title) }}</h3>
                  <p class="season-story__title-en">{{ activeSeason.titleEn }}</p>
                  <p class="season-story__description">
                    {{ pickLocalized(activeSeason.description) }}
                  </p>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.season-story {
  position: relative;
  overflow: hidden;
  overflow: clip;
  --season-wash: rgba(127, 156, 141, 0.12);
  --season-paper: rgba(244, 239, 230, 0.94);
  --season-radial: rgba(127, 156, 141, 0.12);
  background:
    radial-gradient(circle at 80% 18%, var(--season-radial), transparent 32%),
    linear-gradient(180deg, rgba(250, 247, 240, 0.98), var(--season-paper)),
    var(--paper);
  color: var(--ink);
  transition: background 900ms cubic-bezier(0.22, 1, 0.36, 1);
}

.season-story::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 26%),
    var(--season-wash);
  opacity: 0.92;
  pointer-events: none;
  transition: opacity 900ms ease;
}

.season-story--spring {
  --season-wash: linear-gradient(180deg, rgba(209, 228, 219, 0.16), rgba(244, 239, 230, 0));
  --season-paper: rgba(236, 244, 239, 0.96);
  --season-radial: rgba(179, 208, 194, 0.24);
}

.season-story--summer {
  --season-wash: linear-gradient(180deg, rgba(185, 199, 191, 0.18), rgba(244, 239, 230, 0.02));
  --season-paper: rgba(234, 240, 235, 0.96);
  --season-radial: rgba(132, 154, 145, 0.22);
}

.season-story--autumn {
  --season-wash: linear-gradient(180deg, rgba(181, 151, 124, 0.14), rgba(244, 239, 230, 0.02));
  --season-paper: rgba(241, 235, 227, 0.97);
  --season-radial: rgba(159, 129, 101, 0.18);
}

.season-story--winter {
  --season-wash: linear-gradient(180deg, rgba(223, 228, 229, 0.18), rgba(244, 239, 230, 0));
  --season-paper: rgba(240, 243, 244, 0.97);
  --season-radial: rgba(194, 202, 207, 0.2);
}

.season-story__scroll {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  min-height: 500vh;
  margin: 0 auto;
  padding: 0 clamp(20px, 3vw, 48px);
}

.season-story__sticky {
  position: sticky;
  top: var(--site-header-h, 52px);
  z-index: 2;
  display: grid;
  align-items: center;
  min-height: calc(100vh - var(--site-header-h, 52px));
  min-height: calc(100svh - var(--site-header-h, 52px));
  padding: clamp(64px, 7.5vw, 104px) 0;
}

.season-story__panel {
  display: grid;
  grid-template-columns: minmax(14rem, 0.44fr) minmax(18rem, 480px) minmax(20rem, 0.72fr);
  gap: clamp(30px, 4vw, 58px);
  align-items: center;
  justify-content: space-between;
}

.season-story__intro {
  align-self: start;
  padding-top: clamp(14px, 2vw, 30px);
}

.season-story__intro h2 {
  max-width: 5em;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: clamp(44px, 4.6vw, 76px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.02;
}

.season-story__intro p:not(.season-story__eyebrow) {
  max-width: 25rem;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid rgba(16, 20, 18, 0.12);
  color: rgba(16, 20, 18, 0.56);
  font-size: 14px;
  letter-spacing: 0.04em;
  line-height: 1.9;
}

.season-story__copy {
  position: relative;
  justify-self: start;
  width: min(100%, 25rem);
  min-width: 0;
}

.season-story__eyebrow,
.season-story__title-en,
.season-story__count {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.season-story__eyebrow {
  margin-bottom: clamp(18px, 3vw, 34px);
}

.season-story__text-shell {
  position: relative;
  min-height: clamp(20rem, 34vw, 25rem);
}

.season-story__text {
  width: 100%;
}

.season-story__count {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  font-family: var(--font-serif);
  letter-spacing: 0.22em;
}

.season-story__text h3 {
  max-width: none;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: clamp(32px, 2.85vw, 48px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.12;
  white-space: nowrap;
}

.season-story__title-en {
  margin-top: 14px;
}

.season-story__description {
  max-width: 24rem;
  margin-top: clamp(22px, 3vw, 34px);
  padding-top: 22px;
  border-top: 1px solid rgba(16, 20, 18, 0.12);
  color: rgba(16, 20, 18, 0.66);
  font-size: 15px;
  letter-spacing: 0.04em;
  line-height: 1.9;
}

.season-story__media {
  position: relative;
  justify-self: end;
  width: min(100%, 470px);
  margin: 0;
  aspect-ratio: 1122 / 1402;
  overflow: hidden;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(250, 247, 240, 0.4);
  box-shadow: 0 28px 72px rgba(45, 52, 47, 0.07);
}

.season-story__media::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(250, 247, 240, 0.3);
  pointer-events: none;
}

.season-story__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  filter: saturate(0.86) contrast(0.95);
  transform: scale(1.012) translate3d(0, 6px, 0);
  transition:
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
}

.season-story__image.is-active {
  opacity: 1;
  filter: saturate(0.98) contrast(0.98);
  transform: scale(1) translate3d(0, 0, 0);
}

.season-copy-enter-active,
.season-copy-leave-active {
  transition:
    opacity 240ms ease,
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.season-copy-leave-active {
  position: absolute;
  inset: 0;
}

.season-copy-enter-from {
  opacity: 0;
  transform: translate3d(0, 10px, 0);
}

.season-copy-leave-to {
  opacity: 0;
  transform: translate3d(0, -8px, 0);
}

@media (max-width: 980px) {
  .season-story__scroll {
    min-height: 520vh;
  }

  .season-story__sticky {
    align-items: start;
    padding: 56px 0 36px;
  }

  .season-story__panel {
    grid-template-columns: minmax(0, 0.82fr) minmax(17rem, 0.78fr);
    gap: 34px;
  }

  .season-story__intro {
    grid-column: 1 / -1;
    max-width: 42rem;
  }

  .season-story__copy {
    justify-self: start;
    max-width: 42rem;
    width: 100%;
  }

  .season-story__text-shell {
    min-height: 17rem;
  }

  .season-story__media {
    justify-self: end;
    width: min(100%, 520px);
    aspect-ratio: 1122 / 1402;
  }
}

@media (max-width: 640px) {
  .season-story__scroll {
    min-height: 535vh;
    padding-inline: 18px;
  }

  .season-story__sticky {
    top: var(--site-header-h, 48px);
    min-height: calc(100vh - var(--site-header-h, 48px));
    min-height: calc(100svh - var(--site-header-h, 48px));
    padding: 48px 0 24px;
  }

  .season-story__eyebrow {
    margin-bottom: 18px;
  }

  .season-story__panel {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .season-story__media {
    order: 3;
  }

  .season-story__copy {
    order: 2;
  }

  .season-story__intro h2 {
    font-size: clamp(38px, 3.25rem, 52px);
  }

  .season-story__intro p:not(.season-story__eyebrow) {
    margin-top: 18px;
    font-size: 14px;
    line-height: 1.78;
  }

  .season-story__text-shell {
    min-height: 13rem;
  }

  .season-story__text h3 {
    font-size: clamp(35px, 10vw, 46px);
  }

  .season-story__description {
    margin-top: 24px;
    font-size: 14px;
    line-height: 1.78;
  }

  .season-story__media {
    width: 100%;
    aspect-ratio: 1122 / 1402;
  }

}

@media (prefers-reduced-motion: reduce) {
  .season-story,
  .season-story::before,
  .season-story__image,
  .season-copy-enter-active,
  .season-copy-leave-active {
    transition: none;
  }
}
</style>
