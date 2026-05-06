<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import brokenBridgePaperImage from '../../assets/images/reveal-broken-bridge-paper.jpg'
import brokenBridgeUnderImage from '../../assets/images/reveal-broken-bridge-song-painting.jpg'
import { t } from '../../i18n/site'
import { scrollToAnchor } from '../../utils/scroll'

const progress = ref(0)
const heroPlate = ref<HTMLElement | null>(null)
let rafId = 0
let revealRafId = 0
let ticking = false
let pendingRevealX = 50
let pendingRevealY = 50
let trailRevealX = 50
let trailRevealY = 50
let revealHasEntered = false

const goToConcept = () => {
  scrollToAnchor('concept')
}

const imageStyle = computed(() => {
  const scale = 1 + 0.03 * progress.value
  const translateY = -10 * progress.value
  return {
    transform: `translate3d(0, ${translateY}px, 0) scale(${scale.toFixed(4)})`,
  }
})

const titleStyle = computed(() => {
  const translateY = -14 * progress.value
  const opacity = 1 - 0.35 * progress.value
  return {
    transform: `translate3d(0, ${translateY}px, 0)`,
    opacity: opacity.toFixed(3),
  }
})

const sideStyle = computed(() => {
  const translateY = -9 * progress.value
  const opacity = 1 - 0.42 * progress.value
  return {
    transform: `translate3d(0, ${translateY}px, 0)`,
    opacity: opacity.toFixed(3),
  }
})

const updateProgress = () => {
  const viewport = window.innerHeight || 1
  const raw = window.scrollY / (viewport * 0.95)
  progress.value = Math.min(Math.max(raw, 0), 1)
  ticking = false
}

const onScroll = () => {
  if (ticking) return
  ticking = true
  rafId = window.requestAnimationFrame(updateProgress)
}

const updateRevealPosition = () => {
  const plate = heroPlate.value
  if (plate) {
    trailRevealX += (pendingRevealX - trailRevealX) * 0.16
    trailRevealY += (pendingRevealY - trailRevealY) * 0.16
    plate.style.setProperty('--reveal-x', `${pendingRevealX.toFixed(2)}%`)
    plate.style.setProperty('--reveal-y', `${pendingRevealY.toFixed(2)}%`)
    plate.style.setProperty('--trail-x', `${trailRevealX.toFixed(2)}%`)
    plate.style.setProperty('--trail-y', `${trailRevealY.toFixed(2)}%`)
  }

  const distance = Math.hypot(pendingRevealX - trailRevealX, pendingRevealY - trailRevealY)
  if (distance > 0.12) {
    revealRafId = window.requestAnimationFrame(updateRevealPosition)
    return
  }

  revealRafId = 0
}

const handlePlatePointerMove = (event: PointerEvent) => {
  const plate = heroPlate.value
  if (!plate) return

  const rect = plate.getBoundingClientRect()
  pendingRevealX = ((event.clientX - rect.left) / rect.width) * 100
  pendingRevealY = ((event.clientY - rect.top) / rect.height) * 100
  if (!revealHasEntered) {
    trailRevealX = pendingRevealX
    trailRevealY = pendingRevealY
    revealHasEntered = true
  }

  if (!revealRafId) {
    revealRafId = window.requestAnimationFrame(updateRevealPosition)
  }
}

const centerReveal = () => {
  pendingRevealX = 50
  pendingRevealY = 50
  trailRevealX = 50
  trailRevealY = 50
  revealHasEntered = false
  updateRevealPosition()
}

const resetRevealEntry = () => {
  revealHasEntered = false
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
  if (revealRafId) {
    window.cancelAnimationFrame(revealRafId)
  }
})
</script>

<template>
  <section id="opening" class="hero" :aria-label="t('hero.aria')">
    <div class="hero-frame">
      <header class="hero-meta" data-reveal="soft">
        <span class="meta-cell meta-left">{{ t('site.travelLabel') }}</span>
        <span class="meta-cell meta-mid">{{ t('hero.arrive') }}</span>
        <span class="meta-cell meta-right">{{ t('site.coordinates') }}</span>
      </header>

      <div class="hero-stage">
        <figure
          ref="heroPlate"
          class="hero-plate"
          data-reveal
          tabindex="0"
          :aria-label="t('hero.titleAlt')"
          @pointerenter="handlePlatePointerMove"
          @pointermove="handlePlatePointerMove"
          @pointerleave="resetRevealEntry"
          @focus="centerReveal"
          @blur="resetRevealEntry"
        >
          <div class="hero-plate-inner" :style="imageStyle">
            <img
              class="hero-plate-image hero-plate-image--paper"
              :src="brokenBridgePaperImage"
              :alt="t('hero.titleAlt')"
              decoding="async"
              fetchpriority="high"
            />
            <img
              class="hero-plate-image hero-plate-image--trail"
              :src="brokenBridgeUnderImage"
              alt=""
              aria-hidden="true"
              decoding="async"
            />
            <img
              class="hero-plate-image hero-plate-image--under"
              :src="brokenBridgeUnderImage"
              alt=""
              aria-hidden="true"
              decoding="async"
            />
          </div>
        </figure>

        <div class="hero-caption" :style="sideStyle" data-reveal="soft">
          <span class="caption-mark">I</span>
          <span class="caption-rule" aria-hidden="true"></span>
          <span class="caption-text">{{ t('hero.caption') }}</span>
        </div>

        <div class="hero-title" :style="titleStyle" data-reveal>
          <h1 class="title-zh">{{ t('nav.home') }}</h1>
          <p class="title-en">Hangzhou</p>
        </div>

        <aside class="hero-note" :style="sideStyle" data-reveal="soft">
          <p class="note-zh">{{ t('hero.note') }}</p>
          <p class="note-en">{{ t('site.descriptionLine') }}</p>
        </aside>
      </div>

      <footer class="hero-foot" data-reveal="line">
        <div class="hero-foot__actions">
          <RouterLink class="hero-foot__cta hero-foot__cta--primary" to="/scenic-spots">
            {{ t('common.startReservation') }}
          </RouterLink>
          <RouterLink class="hero-foot__cta" to="/visit-guide">
            {{ t('page.visitGuide') }}
          </RouterLink>
          <button type="button" class="foot-scroll" @click="goToConcept" :aria-label="t('hero.foot.next')">
            <span class="foot-line" aria-hidden="true"></span>
            <span>{{ t('hero.cta') }}</span>
          </button>
        </div>
        <span class="foot-index">{{ t('hero.foot.index') }}</span>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  --hero-peek: clamp(20px, 4vh, 44px);
  min-height: calc(100vh - var(--site-header-h, 52px) - var(--hero-peek));
  min-height: calc(100svh - var(--site-header-h, 52px) - var(--hero-peek));
  width: 100%;
  background: var(--paper);
  color: var(--ink);
  overflow: hidden;
}

.hero-frame {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--site-header-h, 52px) - var(--hero-peek));
  min-height: calc(100svh - var(--site-header-h, 52px) - var(--hero-peek));
  padding: clamp(14px, 1.6vw, 24px) clamp(22px, 3vw, 48px);
}

/* ------- top archival bar ------- */
.hero-meta {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.45);
  padding-bottom: clamp(10px, 1.2vw, 16px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.meta-cell {
  white-space: nowrap;
}

.meta-mid {
  justify-self: center;
  letter-spacing: 0.28em;
  color: rgba(16, 20, 18, 0.5);
}

.meta-right {
  justify-self: end;
}

/* ------- main stage with grid ------- */
.hero-stage {
  position: relative;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 1fr auto auto;
  column-gap: clamp(18px, 2.2vw, 36px);
  row-gap: clamp(14px, 2vw, 28px);
  padding: clamp(22px, 3vw, 42px) 0 clamp(16px, 2vw, 28px);
  align-content: center;
}

/* image plate — upper-right, contained, treated as artwork */
.hero-plate {
  grid-column: 4 / span 9;
  grid-row: 1;
  margin: 0;
  position: relative;
  --reveal-x: 50%;
  --reveal-y: 50%;
  --trail-x: 50%;
  --trail-y: 50%;
  --reveal-size: clamp(88px, 12vw, 174px);
  --trail-size: clamp(120px, 17vw, 250px);
  width: 100%;
  aspect-ratio: 16 / 8.3;
  max-width: min(90vw, 1240px);
  align-self: start;
  overflow: hidden;
  background: rgba(216, 221, 214, 0.42);
  outline: none;
}

.hero-plate-inner {
  position: absolute;
  inset: 0;
  transform-origin: 65% 50%;
  transition: transform 0.4s linear;
  will-change: transform;
}

.hero-plate-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 52% 50%;
  transform: scale(1.025);
  transform-origin: 60% 50%;
  animation: hero-plate-drift 22s ease-in-out infinite alternate;
  will-change: transform, clip-path, opacity, filter;
}

.hero-plate-image--paper {
  z-index: 1;
  filter: saturate(0.9) contrast(0.96);
}

.hero-plate-image--trail,
.hero-plate-image--under {
  opacity: 0;
  pointer-events: none;
}

.hero-plate-image--trail {
  z-index: 2;
  filter: saturate(0.86) contrast(0.95) blur(2px);
  -webkit-mask-image: radial-gradient(
    circle at var(--trail-x) var(--trail-y),
    rgba(0, 0, 0, 0.26) 0,
    rgba(0, 0, 0, 0.2) calc(var(--trail-size) * 0.28),
    rgba(0, 0, 0, 0.1) calc(var(--trail-size) * 0.54),
    transparent var(--trail-size)
  );
  mask-image: radial-gradient(
    circle at var(--trail-x) var(--trail-y),
    rgba(0, 0, 0, 0.26) 0,
    rgba(0, 0, 0, 0.2) calc(var(--trail-size) * 0.28),
    rgba(0, 0, 0, 0.1) calc(var(--trail-size) * 0.54),
    transparent var(--trail-size)
  );
  transition:
    opacity 520ms ease,
    -webkit-mask-image 140ms linear,
    mask-image 140ms linear;
}

.hero-plate-image--under {
  z-index: 3;
  filter: saturate(0.92) contrast(0.98);
  -webkit-mask-image: radial-gradient(
    circle at var(--reveal-x) var(--reveal-y),
    #000 0,
    #000 calc(var(--reveal-size) * 0.42),
    rgba(0, 0, 0, 0.82) calc(var(--reveal-size) * 0.6),
    rgba(0, 0, 0, 0.36) calc(var(--reveal-size) * 0.82),
    transparent var(--reveal-size)
  );
  mask-image: radial-gradient(
    circle at var(--reveal-x) var(--reveal-y),
    #000 0,
    #000 calc(var(--reveal-size) * 0.42),
    rgba(0, 0, 0, 0.82) calc(var(--reveal-size) * 0.6),
    rgba(0, 0, 0, 0.36) calc(var(--reveal-size) * 0.82),
    transparent var(--reveal-size)
  );
  transition:
    opacity 260ms ease,
    filter 260ms ease,
    -webkit-mask-image 120ms linear,
    mask-image 120ms linear;
}

.hero-plate:hover .hero-plate-image--trail,
.hero-plate:focus-visible .hero-plate-image--trail {
  opacity: 0.66;
}

.hero-plate:hover .hero-plate-image--under,
.hero-plate:focus-visible .hero-plate-image--under {
  opacity: 1;
  filter: saturate(1) contrast(1);
}

@keyframes hero-plate-drift {
  0% {
    transform: translate3d(0, 0, 0) scale(1.025);
  }
  100% {
    transform: translate3d(-7px, -4px, 0) scale(1.034);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-plate-image {
    animation: none;
    transform: none;
  }

  .hero-plate-image--trail,
  .hero-plate-image--under {
    transition: none;
  }
}

/* plate caption — sits below image, museum label style */
.hero-caption {
  grid-column: 4 / span 7;
  grid-row: 2;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.42);
  margin-top: 2px;
  transition: transform 0.4s linear, opacity 0.4s linear;
  will-change: transform, opacity;
}

.caption-mark {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.2em;
  color: rgba(16, 20, 18, 0.62);
}

.caption-rule {
  display: inline-block;
  width: 36px;
  height: 1px;
  background: rgba(16, 20, 18, 0.22);
}

/* main title — bottom-left, diagonal counterweight to the image */
.hero-title {
  grid-column: 1 / span 5;
  grid-row: 3;
  align-self: end;
  margin-bottom: clamp(8px, 1vw, 18px);
  transition: transform 0.4s linear, opacity 0.4s linear;
  will-change: transform, opacity;
}

.title-zh {
  font-family: var(--font-serif);
  font-size: clamp(82px, 10.5vw, 156px);
  line-height: 0.9;
  letter-spacing: 0.035em;
  font-weight: 400;
  color: var(--ink);
}

.title-en {
  margin-top: clamp(8px, 1vw, 14px);
  font-size: clamp(11px, 0.85vw, 13px);
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.5);
}

/* descriptive note — bottom-right, paired against title block */
.hero-note {
  grid-column: 8 / span 4;
  grid-row: 3;
  align-self: end;
  margin-bottom: clamp(10px, 1.4vw, 20px);
  max-width: 22rem;
  transition: transform 0.4s linear, opacity 0.4s linear;
  will-change: transform, opacity;
}

.note-zh {
  font-family: var(--font-serif);
  font-size: clamp(14px, 0.95vw, 17px);
  line-height: 1.82;
  letter-spacing: 0.04em;
  color: rgba(16, 20, 18, 0.7);
}

.note-en {
  margin-top: clamp(10px, 0.9vw, 14px);
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.02em;
  color: rgba(16, 20, 18, 0.34);
}

/* ------- bottom archival bar ------- */
.hero-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.42);
  padding-top: clamp(10px, 1.2vw, 16px);
  border-top: 1px solid rgba(16, 20, 18, 0.08);
}

.hero-foot__actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.hero-foot__cta {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 16px;
  border: 1px solid rgba(16, 20, 18, 0.18);
  background: rgba(250, 247, 240, 0.92);
  color: rgba(16, 20, 18, 0.7);
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  transition: color 220ms ease, background 220ms ease, border-color 220ms ease, transform 220ms ease;
}

.hero-foot__cta:hover,
.hero-foot__cta:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.32);
  transform: translateY(-1px);
  outline: none;
}

.hero-foot__cta--primary {
  background: var(--deep-green);
  border-color: var(--deep-green);
  color: var(--paper-light);
}

.hero-foot__cta--primary:hover,
.hero-foot__cta--primary:focus-visible {
  color: var(--paper-light);
  background: rgba(31, 58, 52, 0.88);
  border-color: rgba(31, 58, 52, 0.88);
}

.foot-scroll {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0;
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  transition: color 220ms ease, transform 220ms ease;
}

.foot-scroll:hover,
.foot-scroll:focus-visible {
  color: var(--deep-green);
  transform: translateY(2px);
  outline: none;
}

.foot-scroll:hover .foot-line,
.foot-scroll:focus-visible .foot-line {
  background: var(--deep-green);
}

.foot-line {
  display: inline-block;
  width: 28px;
  height: 1px;
  background: rgba(16, 20, 18, 0.3);
  transform-origin: left center;
  animation: hero-scroll-bob 2.8s ease-in-out infinite;
}

@keyframes hero-scroll-bob {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scaleX(1);
    opacity: 0.7;
  }
  50% {
    transform: translate3d(4px, 0, 0) scaleX(1.18);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .foot-line {
    animation: none;
  }
}

/* ------- responsive: tablet ------- */
@media (max-width: 1180px) {
  .hero-stage {
    padding: 20px 0 14px;
  }
  .hero-plate {
    grid-column: 2 / span 11;
    max-width: min(94vw, 1040px);
  }
  .hero-caption {
    grid-column: 2 / span 9;
  }
  .hero-title {
    grid-column: 1 / span 6;
  }
  .hero-note {
    grid-column: 7 / span 6;
    max-width: 24rem;
  }
}

@media (max-width: 900px) {
  .hero-frame {
    padding: 14px 18px 16px;
  }
  .hero-meta {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .meta-mid {
    display: none;
  }
  .hero-plate {
    grid-column: 1 / span 12;
    max-width: 100%;
  }
  .hero-caption {
    grid-column: 1 / span 12;
  }
  .hero-title {
    grid-column: 1 / span 7;
  }
  .hero-note {
    grid-column: 6 / span 7;
    margin-bottom: 0;
  }
}

@media (min-width: 641px) and (max-height: 760px) {
  .hero-frame {
    padding-top: 10px;
    padding-bottom: 12px;
  }

  .hero-meta {
    padding-bottom: 8px;
  }

  .hero-stage {
    row-gap: 10px;
    padding-top: 14px;
    padding-bottom: 10px;
  }

  .hero-plate {
    aspect-ratio: 16 / 7.6;
  }

  .hero-caption {
    gap: 12px;
    margin-top: 0;
  }

  .hero-title {
    margin-top: -8px;
    margin-bottom: 0;
  }

  .title-zh {
    font-size: clamp(72px, 9vw, 132px);
  }

  .title-en {
    margin-top: 6px;
  }

  .hero-note {
    margin-bottom: 2px;
  }

  .note-zh {
    font-size: clamp(14px, 0.9vw, 16px);
    line-height: 1.72;
  }

  .note-en {
    margin-top: 8px;
    line-height: 1.45;
  }
}

@media (min-width: 641px) and (max-height: 680px) {
  .hero-frame {
    padding-top: 8px;
    padding-bottom: 10px;
  }

  .hero-meta {
    font-size: 10px;
    padding-bottom: 6px;
  }

  .hero-stage {
    row-gap: 8px;
    padding-top: 10px;
    padding-bottom: 8px;
  }

  .hero-plate {
    aspect-ratio: 16 / 7.1;
  }

  .hero-caption {
    gap: 10px;
    font-size: 10px;
  }

  .caption-rule {
    width: 28px;
  }

  .hero-title {
    margin-top: -12px;
  }

  .title-zh {
    font-size: clamp(64px, 7.8vw, 116px);
  }

  .title-en {
    font-size: 11px;
    letter-spacing: 0.28em;
  }

  .note-zh {
    font-size: 14px;
    line-height: 1.62;
  }

  .note-en {
    font-size: 11px;
    margin-top: 6px;
  }

  .hero-foot {
    padding-top: 8px;
  }
}

/* ------- responsive: mobile ------- */
@media (max-width: 640px) {
  .hero {
    --hero-peek: 22px;
    min-height: calc(100vh - var(--site-header-h, 48px) - var(--hero-peek));
    min-height: calc(100svh - var(--site-header-h, 48px) - var(--hero-peek));
  }
  .hero-frame {
    min-height: calc(100vh - var(--site-header-h, 48px) - var(--hero-peek));
    min-height: calc(100svh - var(--site-header-h, 48px) - var(--hero-peek));
    padding: 12px 16px 14px;
  }
  .hero-meta {
    grid-template-columns: 1fr 1fr;
    font-size: 10px;
    letter-spacing: 0.24em;
    padding-bottom: 10px;
  }
  .meta-mid {
    display: none;
  }
  .hero-stage {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 18px 0 12px;
  }
  .hero-plate {
    order: 1;
    width: 100%;
    aspect-ratio: 16 / 10;
  }
  .hero-plate-inner {
    transform-origin: 60% 50%;
  }
  .hero-plate-image {
    object-position: 60% 50%;
  }
  .hero-caption {
    order: 2;
    font-size: 10px;
    letter-spacing: 0.26em;
    gap: 10px;
  }
  .caption-rule {
    width: 24px;
  }
  .hero-title {
    order: 3;
    margin-bottom: 0;
  }
  .title-zh {
    font-size: clamp(62px, 18vw, 96px);
    letter-spacing: 0.04em;
  }
  .title-en {
    margin-top: 8px;
    font-size: 11px;
    letter-spacing: 0.3em;
  }
  .hero-note {
    order: 4;
    max-width: 100%;
  }
  .note-zh {
    font-size: 15px;
    line-height: 1.72;
  }
  .note-en {
    font-size: 12px;
    margin-top: 10px;
  }
  .hero-foot {
    font-size: 10px;
    letter-spacing: 0.24em;
    padding-top: 10px;
  }
  .foot-line {
    width: 22px;
  }
}
</style>
