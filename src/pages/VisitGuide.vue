<script setup lang="ts">
import PageCrumbs from '../components/common/PageCrumbs.vue'
import WeatherBrief from '../components/common/WeatherBrief.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import {
  visitGuideEmergency,
  visitGuideFacts,
  visitGuideFaq,
  visitGuidePolicies,
  visitGuideSteps,
  visitGuideSupport,
  visitGuideTransport,
} from '../data/visitGuide'
import { pickLocalized, t } from '../i18n/site'
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="guide-page" tabindex="-1">
      <section class="guide-hero" aria-labelledby="guide-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: t('page.visitGuide') },
          ]"
        />

        <div class="guide-hero__meta">
          <span>{{ t('guide.title') }}</span>
          <span>{{ t('guide.meta') }}</span>
        </div>

        <div class="guide-hero__layout">
          <div>
            <p class="guide-hero__eyebrow">{{ t('guide.eyebrow') }}</p>
            <h1 id="guide-title">{{ t('guide.title') }}</h1>
            <p class="guide-hero__description">{{ t('guide.description') }}</p>
          </div>

          <div class="guide-hero__side">
            <div class="guide-hero__actions">
              <RouterLink to="/scenic-spots">{{ t('notfound.reservations') }}</RouterLink>
              <RouterLink to="/orders">{{ t('page.orders') }}</RouterLink>
              <RouterLink to="/routes">{{ t('nav.routes') }}</RouterLink>
            </div>
            <WeatherBrief />
          </div>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guide-facts-title" data-reveal>
        <header class="guide-section__head">
          <p>01 / Essentials</p>
          <h2 id="guide-facts-title">{{ t('guide.section.essentials') }}</h2>
        </header>

        <div class="guide-facts">
          <article v-for="fact in visitGuideFacts" :key="fact.id" class="guide-card">
            <small>{{ pickLocalized(fact.label) }}</small>
            <h3>{{ pickLocalized(fact.value) }}</h3>
            <p>{{ pickLocalized(fact.note) }}</p>
          </article>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guide-steps-title" data-reveal>
        <header class="guide-section__head">
          <p>02 / Flow</p>
          <h2 id="guide-steps-title">{{ t('guide.section.flow') }}</h2>
        </header>

        <div class="guide-steps">
          <article v-for="(step, index) in visitGuideSteps" :key="step.id" class="guide-step">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h3>{{ pickLocalized(step.title) }}</h3>
              <p>{{ pickLocalized(step.detail) }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guide-policies-title" data-reveal>
        <header class="guide-section__head">
          <p>03 / Policy</p>
          <h2 id="guide-policies-title">{{ t('guide.section.policy') }}</h2>
        </header>

        <div class="guide-grid">
          <article v-for="policy in visitGuidePolicies" :key="policy.id" class="guide-card">
            <small>{{ pickLocalized(policy.title) }}</small>
            <p>{{ pickLocalized(policy.detail) }}</p>
          </article>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guide-transport-title" data-reveal>
        <header class="guide-section__head">
          <p>04 / Transport</p>
          <h2 id="guide-transport-title">{{ t('guide.section.transport') }}</h2>
        </header>

        <div class="guide-grid">
          <article v-for="item in visitGuideTransport" :key="item.id" class="guide-card">
            <small>{{ pickLocalized(item.title) }}</small>
            <p>{{ pickLocalized(item.detail) }}</p>
            <p class="guide-card__hint">{{ pickLocalized(item.hint) }}</p>
          </article>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guide-emergency-title" data-reveal>
        <header class="guide-section__head">
          <p>05 / Emergency</p>
          <h2 id="guide-emergency-title">{{ t('guide.section.emergency') }}</h2>
        </header>

        <div class="guide-emergency">
          <article v-for="item in visitGuideEmergency" :key="item.id" class="guide-emergency__card">
            <span class="guide-emergency__number">{{ item.number }}</span>
            <strong>{{ pickLocalized(item.label) }}</strong>
            <p>{{ pickLocalized(item.detail) }}</p>
          </article>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guide-support-title" data-reveal>
        <header class="guide-section__head">
          <p>06 / Support</p>
          <h2 id="guide-support-title">{{ t('guide.section.support') }}</h2>
        </header>

        <div class="guide-grid">
          <article v-for="item in visitGuideSupport" :key="item.id" class="guide-card">
            <small>{{ pickLocalized(item.title) }}</small>
            <p>{{ pickLocalized(item.detail) }}</p>
          </article>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guide-faq-title" data-reveal>
        <header class="guide-section__head">
          <p>07 / FAQ</p>
          <h2 id="guide-faq-title">{{ t('guide.section.faq') }}</h2>
        </header>

        <div class="guide-faq">
          <details v-for="item in visitGuideFaq" :key="item.id">
            <summary>{{ pickLocalized(item.question) }}</summary>
            <p>{{ pickLocalized(item.answer) }}</p>
          </details>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.guide-page {
  background: var(--paper-light);
  color: var(--ink);
}

.guide-hero,
.guide-section {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.guide-hero {
  padding-top: clamp(80px, 12vw, 148px);
  padding-bottom: clamp(52px, 7vw, 92px);
}

.guide-hero__meta,
.guide-section__head p {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.guide-hero__meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0 16px;
  margin-bottom: clamp(30px, 4vw, 50px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.guide-hero__layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(16rem, 0.34fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: end;
}

.guide-hero__eyebrow {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.guide-hero h1 {
  margin-top: 18px;
  font-family: var(--font-serif);
  font-size: clamp(44px, 6vw, 92px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
}

.guide-hero__description {
  max-width: 40rem;
  margin-top: 26px;
  color: rgba(16, 20, 18, 0.66);
  font-family: var(--font-serif);
  font-size: clamp(17px, 1.3vw, 22px);
  letter-spacing: 0.04em;
  line-height: 1.9;
}

.guide-hero__side,
.guide-hero__actions {
  display: grid;
  gap: 12px;
}

.guide-hero__actions a {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  color: rgba(16, 20, 18, 0.64);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background: rgba(250, 247, 240, 0.84);
  transition: color 220ms ease, border-color 220ms ease, transform 220ms ease;
}

.guide-hero__actions a:hover,
.guide-hero__actions a:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.2);
  transform: translateX(2px);
  outline: none;
}

.guide-section {
  padding-bottom: clamp(64px, 9vw, 112px);
}

.guide-section__head {
  display: grid;
  gap: 14px;
  margin-bottom: clamp(28px, 4vw, 42px);
}

.guide-section__head h2 {
  font-family: var(--font-serif);
  font-size: clamp(26px, 3vw, 42px);
  font-weight: 400;
  letter-spacing: 0.06em;
}

.guide-facts,
.guide-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.guide-card {
  display: grid;
  gap: 14px;
  padding: clamp(22px, 2.5vw, 30px);
  background: rgba(250, 247, 240, 0.94);
}

.guide-card small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.guide-card h3,
.guide-step h3 {
  font-family: var(--font-serif);
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.35;
}

.guide-card p,
.guide-step p,
.guide-faq p {
  color: rgba(16, 20, 18, 0.66);
  font-size: 15px;
  letter-spacing: 0.04em;
  line-height: 1.9;
}

.guide-steps {
  border-top: 1px solid rgba(16, 20, 18, 0.1);
}

.guide-step {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: clamp(18px, 3vw, 34px);
  padding: clamp(22px, 2.8vw, 34px) 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.guide-step > span {
  color: rgba(16, 20, 18, 0.42);
  font-family: var(--font-serif);
  font-size: 12px;
  letter-spacing: 0.24em;
}

.guide-faq {
  display: grid;
  gap: 12px;
}

.guide-faq details {
  padding: 18px 20px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(250, 247, 240, 0.84);
}

.guide-faq summary {
  cursor: pointer;
  list-style: none;
  color: rgba(16, 20, 18, 0.84);
  font-family: var(--font-serif);
  font-size: 18px;
  letter-spacing: 0.04em;
}

.guide-faq summary::-webkit-details-marker {
  display: none;
}

.guide-faq p {
  margin-top: 14px;
}

.guide-card__hint {
  color: rgba(31, 58, 52, 0.74);
  font-size: 13px;
  font-style: italic;
}

.guide-emergency {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.guide-emergency__card {
  display: grid;
  gap: 12px;
  padding: clamp(22px, 2.5vw, 30px);
  background: rgba(250, 247, 240, 0.94);
}

.guide-emergency__number {
  font-family: var(--font-serif);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 400;
  letter-spacing: 0.06em;
  color: var(--deep-green);
  line-height: 1;
}

.guide-emergency__card strong {
  color: rgba(16, 20, 18, 0.84);
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 18px;
  letter-spacing: 0.04em;
}

.guide-emergency__card p {
  color: rgba(16, 20, 18, 0.62);
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .guide-emergency {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 920px) {
  .guide-hero__layout,
  .guide-facts,
  .guide-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .guide-hero,
  .guide-section {
    padding-inline: 18px;
  }

  .guide-step {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
