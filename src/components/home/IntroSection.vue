<script setup lang="ts">
import { visitGuideFacts } from '../../data/visitGuide'
import { pickLocalized, t } from '../../i18n/site'
import SectionLabel from '../common/SectionLabel.vue'
</script>

<template>
  <section id="concept" class="intro-section" aria-labelledby="intro-title">
    <div class="intro-section__inner">
      <SectionLabel :label="t('intro.eyebrow')" index="01" data-reveal="soft" />
      <div class="intro-section__content" data-reveal>
        <div class="intro-section__copy">
          <h2 id="intro-title">{{ t('intro.title') }}</h2>
          <p>{{ t('intro.body') }}</p>
        </div>

        <div class="intro-section__service">
          <div class="intro-section__service-head">
            <small>{{ t('intro.serviceEyebrow') }}</small>
            <h3>{{ t('intro.serviceTitle') }}</h3>
          </div>

          <div class="intro-section__facts">
            <article v-for="fact in visitGuideFacts" :key="fact.id">
              <small>{{ pickLocalized(fact.label) }}</small>
              <strong>{{ pickLocalized(fact.value) }}</strong>
              <p>{{ pickLocalized(fact.note) }}</p>
            </article>
          </div>

          <div class="intro-section__actions">
            <RouterLink to="/visit-guide">{{ t('intro.viewGuide') }}</RouterLink>
            <RouterLink to="/scenic-spots">{{ t('intro.openReservations') }}</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.intro-section {
  background: var(--paper-light);
  color: var(--ink);
}

.intro-section__inner {
  display: grid;
  grid-template-columns: minmax(12rem, 0.44fr) minmax(18rem, 0.9fr);
  gap: clamp(42px, 8vw, 132px);
  max-width: 1360px;
  margin: 0 auto;
  padding: clamp(104px, 13vw, 184px) clamp(20px, 3vw, 48px);
}

.intro-section__content {
  display: grid;
  gap: clamp(34px, 5vw, 58px);
}

.intro-section__copy h2 {
  font-family: var(--font-serif);
  font-size: clamp(34px, 4.6vw, 76px);
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.14;
}

.intro-section__copy p {
  margin-top: clamp(28px, 4vw, 48px);
  color: rgba(16, 20, 18, 0.64);
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.45vw, 22px);
  letter-spacing: 0.05em;
  line-height: 2;
}

.intro-section__service {
  display: grid;
  gap: 24px;
}

.intro-section__service-head small,
.intro-section__facts small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.intro-section__service-head h3 {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: clamp(24px, 2.4vw, 34px);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.intro-section__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.intro-section__facts article {
  display: grid;
  gap: 12px;
  padding: 22px;
  background: rgba(250, 247, 240, 0.92);
}

.intro-section__facts strong {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.6;
}

.intro-section__facts p {
  color: rgba(16, 20, 18, 0.6);
  font-size: 14px;
  line-height: 1.8;
}

.intro-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.intro-section__actions a {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(250, 247, 240, 0.84);
  color: rgba(16, 20, 18, 0.66);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: color 220ms ease, border-color 220ms ease, transform 220ms ease;
}

.intro-section__actions a:hover,
.intro-section__actions a:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.2);
  transform: translateX(2px);
  outline: none;
}

@media (max-width: 900px) {
  .intro-section__inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .intro-section__facts {
    grid-template-columns: 1fr;
  }
}
</style>
