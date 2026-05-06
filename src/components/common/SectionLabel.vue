<script setup lang="ts">
type SectionLabelProps = {
  label: string
  index?: string
}

defineProps<SectionLabelProps>()
</script>

<template>
  <p class="section-label">
    <span v-if="index" class="section-label__index">{{ index }}</span>
    <span>{{ label }}</span>
  </p>
</template>

<style scoped>
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  line-height: 1.2;
}

.section-label__index {
  color: rgba(16, 20, 18, 0.62);
  font-family: var(--font-serif);
  letter-spacing: 0.18em;
}
</style>
