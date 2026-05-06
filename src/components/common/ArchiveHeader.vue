<script setup lang="ts">
type ArchiveHeaderProps = {
  eyebrow?: string
  titleZh: string
  titleEn?: string
  description?: string
}

defineProps<ArchiveHeaderProps>()
</script>

<template>
  <header class="archive-header">
    <p v-if="eyebrow" class="archive-header__eyebrow">{{ eyebrow }}</p>
    <div class="archive-header__title-row">
      <h2 class="archive-header__title">{{ titleZh }}</h2>
      <p v-if="titleEn" class="archive-header__title-en">{{ titleEn }}</p>
    </div>
    <p v-if="description" class="archive-header__description">{{ description }}</p>
  </header>
</template>

<style scoped>
.archive-header {
  max-width: 42rem;
}

.archive-header__eyebrow {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  line-height: 1.2;
  text-transform: uppercase;
}

.archive-header__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 14px 18px;
  margin-top: 16px;
}

.archive-header__title {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: clamp(38px, 5vw, 76px);
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 0.98;
}

.archive-header__title-en {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.28em;
}

.archive-header__description {
  max-width: 30rem;
  margin-top: 22px;
  color: rgba(16, 20, 18, 0.66);
  font-family: var(--font-serif);
  font-size: clamp(15px, 1.2vw, 18px);
  letter-spacing: 0.04em;
  line-height: 1.9;
}
</style>
