<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { t } from '../../i18n/site'
import { scrollToAnchor } from '../../utils/scroll'

type Item = { id: string; label: string }

const props = defineProps<{ items: Item[] }>()

const activeId = ref<string>(props.items[0]?.id ?? '')
let observer: IntersectionObserver | null = null
const ratios = new Map<string, number>()

const setupObserver = async () => {
  await nextTick()
  observer?.disconnect()
  observer = null
  ratios.clear()

  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).id
        if (!id) return
        ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)
      })

      let nextId = activeId.value
      let max = 0
      ratios.forEach((ratio, id) => {
        if (ratio > max) {
          max = ratio
          nextId = id
        }
      })
      if (max > 0 && nextId !== activeId.value) activeId.value = nextId
    },
    {
      // The viewport "active band" — anything with > X% inside this band is
      // the currently active section. The negative top margin pushes the
      // band below the sticky site header so e.g. the header itself never
      // counts as "in view".
      rootMargin: '-30% 0px -45% 0px',
      threshold: [0.05, 0.2, 0.4, 0.6, 0.8],
    },
  )

  props.items.forEach((item) => {
    const el = document.getElementById(item.id)
    if (el) observer?.observe(el)
  })
}

const goTo = (id: string) => {
  // Optimistically highlight the chip the user just tapped — the
  // IntersectionObserver will catch up once the smooth scroll lands.
  activeId.value = id
  scrollToAnchor(id)
}

onMounted(() => {
  void setupObserver()
})

watch(
  () => props.items.map((item) => item.id).join('|'),
  () => {
    void setupObserver()
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  ratios.clear()
})
</script>

<template>
  <nav class="section-nav" :aria-label="t('detail.subnav.aria')">
    <div class="section-nav__inner">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="section-nav__chip"
        :class="{ 'is-active': activeId === item.id }"
        :aria-current="activeId === item.id ? 'true' : undefined"
        @click="goTo(item.id)"
      >
        {{ item.label }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.section-nav {
  position: sticky;
  top: var(--site-header-h, 52px);
  z-index: 14;
  background: rgba(250, 247, 240, 0.92);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.section-nav__inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 10px clamp(20px, 3vw, 48px);
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.section-nav__inner::-webkit-scrollbar {
  display: none;
}

.section-nav__chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgba(16, 20, 18, 0.58);
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  line-height: 1;
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
}

.section-nav__chip:hover,
.section-nav__chip:focus-visible {
  color: var(--deep-green);
  background: rgba(31, 58, 52, 0.05);
  outline: none;
}

.section-nav__chip.is-active {
  background: rgba(31, 58, 52, 0.1);
  border-color: rgba(31, 58, 52, 0.2);
  color: var(--deep-green);
}

@media (prefers-reduced-motion: reduce) {
  .section-nav__chip {
    transition: none;
  }
}
</style>
