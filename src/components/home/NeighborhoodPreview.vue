<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ArchiveHeader from '../common/ArchiveHeader.vue'
import { getSpotImage, getSpotImagePosition } from '../../data/spotImages'
import type { LocalizedText } from '../../i18n/site'
import { pickLocalized } from '../../i18n/site'
import { ensureDiscovery, neighborhoods } from '../../stores/discovery'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const cards = computed(() =>
  neighborhoods.value.slice(0, 3).map((item) => ({
    ...item,
    image: getSpotImage(item.leadSpotId),
    imagePosition: getSpotImagePosition(item.leadSpotId, 'featured'),
  })),
)

onMounted(() => {
  void ensureDiscovery()
})
</script>

<template>
  <section id="neighborhoods" class="neighborhood-preview" aria-labelledby="neighborhood-preview-title">
    <div class="neighborhood-preview__inner">
      <header class="neighborhood-preview__heading" data-reveal>
        <ArchiveHeader
          :title-zh="pickLocalized(text('按街区进入杭州', 'Hangzhou by Neighbourhood', 'エリアで入る杭州', '구역으로 들어가는 항저우'))"
          :title-en="pickLocalized(text('Neighbourhoods', 'Neighbourhoods', 'Neighbourhoods', 'Neighbourhoods'))"
          :description="pickLocalized(text('把城市拆成几片更容易进入的区域，而不是一次面对所有景点。', 'Enter Hangzhou through its districts instead of a flat attraction list.', '景点を一つずつではなく、エリアごとに入るための入口です。', '명소를 납작하게 나열하지 않고 구역 단위로 들어가게 해주는 입구입니다.'))"
        />
      </header>

      <div class="neighborhood-preview__grid">
        <RouterLink
          v-for="item in cards"
          :key="item.id"
          :to="`/neighborhoods#neighborhood-${item.id}`"
          class="neighborhood-preview__card"
          data-reveal
        >
          <img v-if="item.image" :src="item.image" :alt="pickLocalized(item.name)" :style="{ objectPosition: item.imagePosition }" />
          <div>
            <p>{{ pickLocalized(item.district) }}</p>
            <h3>{{ pickLocalized(item.name) }}</h3>
            <span>{{ pickLocalized(item.theme) }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.neighborhood-preview {
  background: var(--paper);
}

.neighborhood-preview__inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(84px, 11vw, 148px) clamp(20px, 3vw, 48px);
}

.neighborhood-preview__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 34px;
}

.neighborhood-preview__card {
  position: relative;
  aspect-ratio: 4 / 3.35;
  overflow: hidden;
  color: #f6f1e8;
  background: rgba(16, 20, 18, 0.08);
}

.neighborhood-preview__card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 320ms ease;
}

.neighborhood-preview__card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 14, 13, 0.12), rgba(11, 14, 13, 0.76));
}

.neighborhood-preview__card div {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 1;
  display: grid;
  gap: 6px;
  padding: 20px 20px 22px;
}

.neighborhood-preview__card p,
.neighborhood-preview__card span {
  font-size: 11px;
  letter-spacing: 0.2em;
  line-height: 1.5;
  text-transform: uppercase;
}

.neighborhood-preview__card h3 {
  max-width: 9ch;
  font-family: var(--font-serif);
  font-size: clamp(24px, 2.2vw, 34px);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.08;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.neighborhood-preview__card:hover img,
.neighborhood-preview__card:focus-visible img {
  transform: scale(1.04);
}

@media (max-width: 960px) {
  .neighborhood-preview__grid {
    grid-template-columns: 1fr;
  }

  .neighborhood-preview__card {
    aspect-ratio: 4 / 2.5;
  }
}
</style>
