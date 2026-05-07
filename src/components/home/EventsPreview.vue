<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ArchiveHeader from '../common/ArchiveHeader.vue'
import type { LocalizedText } from '../../i18n/site'
import { pickLocalized } from '../../i18n/site'
import { cityEvents, ensureDiscovery } from '../../stores/discovery'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const items = computed(() => cityEvents.value.slice(0, 4))

onMounted(() => {
  void ensureDiscovery()
})
</script>

<template>
  <section id="events" class="events-preview" aria-labelledby="events-preview-title">
    <div class="events-preview__inner">
      <header class="events-preview__heading" data-reveal>
        <ArchiveHeader
          :title-zh="pickLocalized(text('接下来在杭州有什么', 'What’s On Next', '次の杭州', '다음 항저우 일정'))"
          :title-en="pickLocalized(text('What’s On', 'What’s On', 'What’s On', 'What’s On'))"
          :description="pickLocalized(text('吸引人再来一次的，往往不是多一个景点，而是多一个值得这周就来的理由。', 'The best repeat-visit trigger is often a timely reason to come now.', '再訪のきっかけは、景点の数よりも「今行く理由」です。', '재방문을 끌어내는 건 명소 숫자보다 지금 와야 할 이유입니다.'))"
        />
      </header>

      <div class="events-preview__list">
        <RouterLink
          v-for="item in items"
          :key="item.id"
          :to="`/events#event-${item.id}`"
          class="events-preview__item"
          data-reveal
        >
          <p>{{ pickLocalized(item.monthLabel) }}</p>
          <h3>{{ pickLocalized(item.name) }}</h3>
          <span>{{ pickLocalized(item.category) }}</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.events-preview {
  background: var(--paper-light);
}

.events-preview__inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(84px, 11vw, 148px) clamp(20px, 3vw, 48px);
}

.events-preview__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 36px;
}

.events-preview__item {
  display: grid;
  gap: 12px;
  min-height: 180px;
  padding: 18px;
  border-top: 1px solid rgba(16, 20, 18, 0.12);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.74);
  transition: background 220ms ease;
}

.events-preview__item:hover,
.events-preview__item:focus-visible {
  background: linear-gradient(90deg, rgba(127, 156, 141, 0.09), transparent 42%);
}

.events-preview__item p,
.events-preview__item span {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.events-preview__item h3 {
  font-family: var(--font-serif);
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.2;
}

@media (max-width: 960px) {
  .events-preview__list {
    grid-template-columns: 1fr;
  }
}
</style>
