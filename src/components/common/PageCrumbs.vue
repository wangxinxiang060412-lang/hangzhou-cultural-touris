<script setup lang="ts">
import { t } from '../../i18n/site'

type Crumb = {
  label: string
  to?: string
}

defineProps<{
  items: Crumb[]
}>()
</script>

<template>
  <nav class="page-crumbs" :aria-label="t('page.crumbsAria')">
    <ol>
      <li v-for="item in items" :key="`${item.label}-${item.to ?? 'current'}`">
        <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.page-crumbs ol {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.page-crumbs li {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.page-crumbs li:not(:last-child)::after {
  content: '/';
  opacity: 0.32;
}

.page-crumbs a,
.page-crumbs span {
  color: inherit;
}

.page-crumbs a:hover,
.page-crumbs a:focus-visible {
  color: var(--deep-green);
  outline: none;
}
</style>
