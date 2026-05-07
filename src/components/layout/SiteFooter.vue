<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { t } from '../../i18n/site'
import { scrollToAnchor } from '../../utils/scroll'

const route = useRoute()
const router = useRouter()

const goToAnchor = async (anchor: string) => {
  if (route.name !== 'home') {
    await router.push({ path: '/', hash: `#${anchor}` })
    return
  }

  scrollToAnchor(anchor)
}

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer" :aria-label="t('footer.aria')">
    <div class="site-footer__inner">
      <div class="site-footer__bar" data-reveal="line">
        <span class="site-footer__cell">{{ t('site.travelLabel') }}</span>
        <span class="site-footer__cell site-footer__cell--mid">{{ t('footer.brandLine') }}</span>
        <span class="site-footer__cell site-footer__cell--right">© MMXXVI · {{ year }}</span>
      </div>

      <div class="site-footer__layout" data-reveal>
        <div class="site-footer__lead">
          <p class="site-footer__title">{{ t('nav.home') }}</p>
          <p class="site-footer__line">{{ t('site.concept') }}</p>
        </div>

        <nav class="site-footer__index" :aria-label="t('footer.sectionAria')">
          <p class="site-footer__index-label">{{ t('footer.section') }}</p>
          <ul>
            <li><button type="button" @click="goToAnchor('opening')">{{ t('footer.opening') }}</button></li>
            <li><button type="button" @click="goToAnchor('notices')">{{ t('footer.notices') }}</button></li>
            <li><button type="button" @click="goToAnchor('concept')">{{ t('footer.intro') }}</button></li>
            <li><button type="button" @click="goToAnchor('weather')">{{ t('footer.weather') }}</button></li>
            <li><button type="button" @click="goToAnchor('reservations')">{{ t('footer.reservations') }}</button></li>
            <li><button type="button" @click="goToAnchor('seasons')">{{ t('footer.seasons') }}</button></li>
            <li><button type="button" @click="goToAnchor('places')">{{ t('footer.places') }}</button></li>
            <li><button type="button" @click="goToAnchor('routes')">{{ t('footer.routes') }}</button></li>
            <li><button type="button" @click="goToAnchor('impressions')">{{ t('footer.impressions') }}</button></li>
          </ul>
        </nav>

        <nav class="site-footer__pages" :aria-label="t('footer.pagesAria')">
          <p class="site-footer__index-label">{{ t('footer.pages') }}</p>
          <ul>
            <li><RouterLink to="/">{{ t('page.home') }}</RouterLink></li>
            <li><RouterLink to="/scenic-spots">{{ t('nav.reservations') }}</RouterLink></li>
            <li><RouterLink to="/booking">{{ t('booking.title') }}</RouterLink></li>
            <li><RouterLink to="/orders">{{ t('page.orders') }}</RouterLink></li>
            <li><RouterLink to="/routes">{{ t('nav.routes') }}</RouterLink></li>
            <li><RouterLink to="/visit-guide">{{ t('page.visitGuide') }}</RouterLink></li>
          </ul>
        </nav>

        <div class="site-footer__contact" :aria-label="t('footer.contactAria')">
          <p class="site-footer__index-label">{{ t('footer.contact') }}</p>
          <dl>
            <div>
              <dt>{{ t('footer.contactTourismHotline') }}</dt>
              <dd><a href="tel:12301">12301</a></dd>
            </div>
            <div>
              <dt>{{ t('footer.contactCityHotline') }}</dt>
              <dd><a href="tel:12345">12345</a></dd>
            </div>
            <div>
              <dt>{{ t('footer.contactEmail') }}</dt>
              <dd><a href="mailto:visit@hangzhou.example.gov.cn">visit@hangzhou.example.gov.cn</a></dd>
            </div>
            <div>
              <dt>{{ t('footer.contactHours') }}</dt>
              <dd>{{ t('footer.contactHoursValue') }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="site-footer__legal">
        <p class="site-footer__meta">{{ t('footer.bottomLine') }} · MMXXVI</p>
        <p class="site-footer__legal-note">{{ t('footer.legalNote') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 0;
  background:
    linear-gradient(180deg, rgba(250, 247, 240, 0.78), rgba(244, 239, 230, 0.92)),
    var(--paper);
  border-top: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.66);
}

.site-footer__inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(36px, 4vw, 56px) clamp(20px, 3vw, 48px) clamp(28px, 3vw, 40px);
}

.site-footer__bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  font-size: 10.5px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.42);
}

.site-footer__cell {
  white-space: nowrap;
}

.site-footer__cell--mid {
  justify-self: center;
}

.site-footer__cell--right {
  justify-self: end;
}

.site-footer__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.9fr) minmax(0, 0.7fr) minmax(0, 0.95fr);
  gap: clamp(24px, 3.4vw, 56px);
  align-items: start;
  padding: clamp(40px, 5vw, 70px) 0 clamp(28px, 3.5vw, 44px);
}

.site-footer__contact dl {
  display: grid;
  gap: 14px;
  margin: 0;
}

.site-footer__contact dl div {
  display: grid;
  gap: 4px;
}

.site-footer__contact dt {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.site-footer__contact dd {
  margin: 0;
  color: rgba(16, 20, 18, 0.72);
  font-family: var(--font-serif);
  font-size: 14px;
  letter-spacing: 0.04em;
}

.site-footer__contact a {
  color: inherit;
  border-bottom: 1px solid rgba(16, 20, 18, 0.18);
  transition: color 220ms ease, border-color 220ms ease;
}

.site-footer__contact a:hover,
.site-footer__contact a:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.42);
  outline: none;
}

.site-footer__legal {
  display: grid;
  gap: 6px;
}

.site-footer__legal-note {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  line-height: 1.7;
  letter-spacing: 0.04em;
  max-width: 60rem;
}

.site-footer__title {
  font-family: var(--font-serif);
  font-size: clamp(40px, 5vw, 78px);
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 0.96;
  color: rgba(16, 20, 18, 0.86);
}

.site-footer__line {
  margin-top: 18px;
  max-width: 28rem;
  font-family: var(--font-serif);
  font-size: clamp(14px, 1vw, 17px);
  letter-spacing: 0.04em;
  line-height: 1.85;
  color: rgba(16, 20, 18, 0.6);
}

.site-footer__index-label,
.site-footer__pages .site-footer__index-label {
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.4);
  margin-bottom: 18px;
}

.site-footer__index ul,
.site-footer__pages ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.site-footer__index button,
.site-footer__pages a {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0 0 0 0;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  color: rgba(16, 20, 18, 0.62);
  font-family: var(--font-serif);
  font-size: 14px;
  letter-spacing: 0.04em;
  transition: color 240ms ease, transform 240ms ease, padding 240ms ease;
}

.site-footer__index button::before,
.site-footer__pages a::before {
  content: '';
  display: inline-block;
  width: 0;
  height: 1px;
  background: currentColor;
  opacity: 0.55;
  transition: width 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.site-footer__index button:hover,
.site-footer__index button:focus-visible,
.site-footer__pages a:hover,
.site-footer__pages a:focus-visible,
.site-footer__pages a.router-link-active {
  color: var(--deep-green);
  transform: translateX(2px);
  outline: none;
}

.site-footer__index button:hover::before,
.site-footer__index button:focus-visible::before,
.site-footer__pages a:hover::before,
.site-footer__pages a:focus-visible::before,
.site-footer__pages a.router-link-active::before {
  width: 18px;
}

@media (prefers-reduced-motion: reduce) {
  .site-footer__index button,
  .site-footer__pages a,
  .site-footer__index button::before,
  .site-footer__pages a::before {
    transition: none;
  }
}

.site-footer__meta {
  padding-top: clamp(20px, 2.5vw, 30px);
  border-top: 1px solid rgba(16, 20, 18, 0.08);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.42);
}

@media (max-width: 980px) {
  .site-footer__bar {
    grid-template-columns: 1fr 1fr;
  }

  .site-footer__cell--mid {
    display: none;
  }

  .site-footer__layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .site-footer__line {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .site-footer__inner {
    padding-inline: 18px;
  }

  .site-footer__bar {
    font-size: 10px;
    letter-spacing: 0.22em;
    gap: 8px;
  }

  .site-footer__title {
    font-size: clamp(32px, 13vw, 56px);
  }

  .site-footer__line {
    font-size: 14px;
  }

  .site-footer__meta {
    font-size: 10px;
    letter-spacing: 0.22em;
    line-height: 1.7;
  }
}
</style>
