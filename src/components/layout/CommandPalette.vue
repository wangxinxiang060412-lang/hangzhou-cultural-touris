<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '../../i18n/site'
import { cityPasses, ensureCatalog, scenicSpots } from '../../stores/catalog'
import { cityEvents, ensureDiscovery, neighborhoods, themeJourneys } from '../../stores/discovery'
import { searchDiscovery, type DiscoveryResult } from '../../utils/discovery'

type DiscoveryKind = DiscoveryResult['kind']

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const activeIndex = ref(0)

const allResults = computed(() =>
  searchDiscovery(
    query.value,
    scenicSpots.value,
    cityPasses.value,
    neighborhoods.value,
    cityEvents.value,
    themeJourneys.value,
  ),
)

// Curated empty-state suggestions: first 3 featured spots + 2 events.
const suggestions = computed<DiscoveryResult[]>(() => {
  const featuredSpots: DiscoveryResult[] = scenicSpots.value
    .filter((spot) => spot.featured)
    .slice(0, 3)
    .map((spot) => ({
      id: spot.id,
      kind: 'spot',
      title: spot.nameZh,
      subtitle: spot.nameEn,
      summary: spot.description,
      tags: [spot.area, spot.category].filter(Boolean).slice(0, 3),
      to: `/scenic-spots/${spot.id}`,
    }))
  const earlyEvents: DiscoveryResult[] = cityEvents.value.slice(0, 2).map((event) => ({
    id: event.id,
    kind: 'event',
    title: event.name['zh-CN'],
    subtitle: event.nameEn,
    summary: event.description['zh-CN'],
    tags: [event.category['zh-CN'], event.monthLabel['zh-CN']].filter(Boolean),
    to: `/events#event-${event.id}`,
  }))
  return [...featuredSpots, ...earlyEvents]
})

const visibleResults = computed(() =>
  query.value.trim() ? allResults.value : suggestions.value,
)

const groups = computed(() => {
  // Preserve discovery order while grouping by kind, so the first item is
  // always the most relevant one and ↑↓ feels predictable.
  const order: DiscoveryKind[] = []
  const buckets = new Map<DiscoveryKind, DiscoveryResult[]>()
  for (const result of visibleResults.value) {
    if (!buckets.has(result.kind)) {
      buckets.set(result.kind, [])
      order.push(result.kind)
    }
    buckets.get(result.kind)!.push(result)
  }
  return order.map((kind) => ({ kind, items: buckets.get(kind)! }))
})

const groupLabel = (kind: DiscoveryKind) => {
  switch (kind) {
    case 'spot':
      return t('palette.group.spot')
    case 'pass':
      return t('palette.group.pass')
    case 'route':
      return t('palette.group.route')
    case 'neighborhood':
      return t('palette.group.neighborhood')
    case 'event':
      return t('palette.group.event')
    case 'journey':
      return t('palette.group.theme')
    default:
      return ''
  }
}

const flatList = computed(() => visibleResults.value)

const navigateActive = (delta: number) => {
  const total = flatList.value.length
  if (total === 0) return
  activeIndex.value = (activeIndex.value + delta + total) % total
  nextTick(() => {
    const el = document.getElementById(`palette-row-${activeIndex.value}`)
    el?.scrollIntoView({ block: 'nearest' })
  })
}

const openResult = async (result: DiscoveryResult) => {
  emit('close')
  await router.push(result.to)
  // Reset for next open.
  query.value = ''
  activeIndex.value = 0
}

const onInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    navigateActive(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    navigateActive(-1)
  } else if (event.key === 'Enter') {
    const target = flatList.value[activeIndex.value]
    if (target) {
      event.preventDefault()
      void openResult(target)
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      activeIndex.value = 0
      void ensureCatalog()
      void ensureDiscovery()
      await nextTick()
      inputRef.value?.focus()
      document.body.classList.add('is-palette-open')
    } else {
      document.body.classList.remove('is-palette-open')
    }
  },
)

watch(query, () => {
  activeIndex.value = 0
})

onMounted(() => {
  void ensureCatalog()
  void ensureDiscovery()
})

onBeforeUnmount(() => {
  document.body.classList.remove('is-palette-open')
})

const onBackdrop = () => emit('close')
const stop = (event: Event) => event.stopPropagation()
</script>

<template>
  <Transition name="palette">
    <div v-if="open" class="palette-backdrop" role="dialog" aria-modal="true" :aria-label="t('palette.title')" @click="onBackdrop">
      <div class="palette" @click="stop">
        <header class="palette__head">
          <span class="palette__icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="9" cy="9" r="6" />
              <path d="m17 17-3.5-3.5" stroke-linecap="round" />
            </svg>
          </span>
          <input
            ref="inputRef"
            v-model="query"
            type="search"
            class="palette__input"
            :placeholder="t('palette.placeholder')"
            :aria-label="t('palette.title')"
            autocomplete="off"
            spellcheck="false"
            @keydown="onInputKeydown"
          />
          <button type="button" class="palette__close" @click="emit('close')" :aria-label="t('palette.close')">
            ESC
          </button>
        </header>

        <div class="palette__body">
          <p v-if="!query.trim()" class="palette__sectionLabel">{{ t('palette.suggestions') }}</p>

          <div v-if="flatList.length === 0" class="palette__empty">{{ t('palette.empty') }}</div>

          <template v-else>
            <section v-for="group in groups" :key="group.kind" class="palette__group">
              <p class="palette__sectionLabel">{{ groupLabel(group.kind) }}</p>
              <button
                v-for="result in group.items"
                :id="`palette-row-${flatList.indexOf(result)}`"
                :key="`${result.kind}-${result.id}`"
                type="button"
                class="palette__row"
                :class="{ 'is-active': flatList.indexOf(result) === activeIndex }"
                @mouseenter="activeIndex = flatList.indexOf(result)"
                @click="openResult(result)"
              >
                <span class="palette__rowMain">
                  <strong>{{ result.title }}</strong>
                  <small>{{ result.subtitle }}</small>
                </span>
                <span class="palette__rowMeta">
                  <span v-for="tag in result.tags" :key="tag">{{ tag }}</span>
                </span>
              </button>
            </section>
          </template>
        </div>

        <footer class="palette__foot">
          <span>{{ t('palette.hint') }}</span>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  justify-items: center;
  align-items: start;
  padding: clamp(40px, 10vh, 96px) clamp(16px, 4vw, 48px);
  background: rgba(16, 20, 18, 0.36);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.palette {
  width: min(720px, 100%);
  display: grid;
  grid-template-rows: auto 1fr auto;
  max-height: min(560px, 80vh);
  border-radius: 14px;
  background: rgba(250, 247, 240, 0.98);
  border: 1px solid rgba(16, 20, 18, 0.1);
  box-shadow: 0 32px 64px rgba(36, 42, 39, 0.24);
  overflow: hidden;
}

.palette__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.palette__icon {
  color: rgba(16, 20, 18, 0.5);
  display: inline-grid;
  place-items: center;
}

.palette__input {
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 16px;
  letter-spacing: 0.02em;
  color: var(--ink);
  outline: none;
  min-height: 32px;
  padding: 0;
}

.palette__close {
  border: 1px solid rgba(16, 20, 18, 0.1);
  border-radius: 6px;
  background: transparent;
  color: rgba(16, 20, 18, 0.56);
  cursor: pointer;
  padding: 6px 10px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.16em;
}

.palette__close:hover,
.palette__close:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.3);
  outline: none;
}

.palette__body {
  overflow: auto;
  padding: 8px 0 16px;
}

.palette__sectionLabel {
  margin: 14px 18px 6px;
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.palette__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  width: 100%;
  padding: 10px 18px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 140ms ease, color 140ms ease;
}

.palette__row.is-active,
.palette__row:focus-visible {
  background: rgba(31, 58, 52, 0.08);
  color: var(--deep-green);
  outline: none;
}

.palette__rowMain {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.palette__rowMain strong {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette__rowMain small {
  color: rgba(16, 20, 18, 0.5);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.palette__rowMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  justify-content: flex-end;
  max-width: 50%;
}

.palette__rowMeta span {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(31, 58, 52, 0.06);
  color: rgba(16, 20, 18, 0.52);
  font-size: 11px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.palette__row.is-active .palette__rowMeta span {
  background: rgba(31, 58, 52, 0.16);
  color: var(--deep-green);
}

.palette__empty {
  padding: 32px 18px 24px;
  color: rgba(16, 20, 18, 0.6);
  font-size: 14px;
  text-align: center;
}

.palette__foot {
  padding: 10px 18px;
  border-top: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.16em;
}

.palette-enter-active,
.palette-leave-active {
  transition: opacity 180ms ease;
}

.palette-enter-active .palette,
.palette-leave-active .palette {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette,
.palette-leave-to .palette {
  opacity: 0;
  transform: translateY(-8px) scale(0.985);
}

@media (max-width: 640px) {
  .palette-backdrop {
    padding: 0;
    align-items: stretch;
  }

  .palette {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .palette__rowMeta {
    display: none;
  }
}
</style>
