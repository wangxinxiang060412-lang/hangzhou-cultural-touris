<script setup lang="ts">
import SiteFooter from '../components/layout/SiteFooter.vue'
import { t } from '../i18n/site'
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="not-found-page" tabindex="-1">
      <section class="not-found-page__hero" data-reveal>
        <p class="not-found-page__eyebrow">404 · Missing Route</p>
        <h1>{{ t('notfound.title') }}</h1>
        <p class="not-found-page__description">{{ t('notfound.description') }}</p>

        <div class="not-found-page__actions">
          <RouterLink to="/" class="not-found-page__primary">{{ t('notfound.home') }}</RouterLink>
          <RouterLink to="/scenic-spots" class="not-found-page__secondary">
            {{ t('notfound.reservations') }}
          </RouterLink>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - var(--site-header-h, 52px));
  background: var(--paper-light);
  color: var(--ink);
}

.not-found-page__hero {
  max-width: 960px;
  margin: 0 auto;
  padding: clamp(96px, 14vw, 180px) clamp(20px, 3vw, 48px) clamp(86px, 11vw, 150px);
}

.not-found-page__eyebrow {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.not-found-page h1 {
  margin-top: 18px;
  font-family: var(--font-serif);
  font-size: clamp(44px, 7vw, 88px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
}

.not-found-page__description {
  max-width: 38rem;
  margin-top: 28px;
  color: rgba(16, 20, 18, 0.64);
  font-family: var(--font-serif);
  font-size: clamp(17px, 1.6vw, 24px);
  letter-spacing: 0.04em;
  line-height: 1.85;
}

.not-found-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.not-found-page__primary,
.not-found-page__secondary {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.not-found-page__primary {
  background: rgba(232, 239, 233, 0.94);
  color: var(--deep-green);
}

.not-found-page__secondary {
  color: rgba(16, 20, 18, 0.62);
}
</style>
