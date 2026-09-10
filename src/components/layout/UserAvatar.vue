<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  initial: string
  color: string
  size?: number
}>(), {
  size: 32,
})

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.42)}px`,
  backgroundColor: props.color,
}))
</script>

<template>
  <span class="user-avatar" :style="style" :aria-label="`用户头像：${initial}`">
    {{ initial }}
  </span>
</template>

<style scoped>
.user-avatar {
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.92);
  font-family: var(--font-serif);
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1;
  user-select: none;
  flex-shrink: 0;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.user-avatar:hover {
  transform: scale(1.06);
  box-shadow: 0 2px 8px rgba(16, 20, 18, 0.14);
}
</style>
