<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ApiScenicSpot, ApiTicketType, TicketTypeInput } from '../../services/api'

const props = defineProps<{
  mode: 'create' | 'edit'
  value?: ApiTicketType | null
  spots: ApiScenicSpot[]
  defaultSpotId?: string
}>()

const emit = defineEmits<{
  submit: [payload: TicketTypeInput]
  cancel: []
}>()

const state = reactive({
  scenicSpotId: '',
  name: '',
  price: 0,
  description: '',
  availableFor: '',
})

const hydrate = () => {
  const current = props.value
  state.scenicSpotId = current?.scenicSpotId ?? props.defaultSpotId ?? props.spots[0]?.id ?? ''
  state.name = current?.name ?? ''
  state.price = current?.price ?? 0
  state.description = current?.description ?? ''
  state.availableFor = current?.availableFor ?? ''
}

watch(() => props.value?.id, hydrate, { immediate: true })
watch(() => props.mode, hydrate)
watch(() => props.defaultSpotId, (next) => {
  if (props.mode === 'create' && next) {
    state.scenicSpotId = next
  }
})

const isValid = computed(
  () =>
    state.scenicSpotId &&
    state.name.trim() &&
    Number.isFinite(state.price) &&
    state.price >= 0,
)

const handleSubmit = () => {
  if (!isValid.value) return

  emit('submit', {
    scenicSpotId: state.scenicSpotId,
    name: state.name.trim(),
    price: Math.round(state.price),
    description: state.description.trim(),
    availableFor: state.availableFor.trim(),
  })
}
</script>

<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <header>
      <p>{{ mode === 'create' ? '新增票种' : `编辑 ${value?.name ?? ''}` }}</p>
      <small>Ticket Type</small>
    </header>

    <div class="entity-form__grid">
      <label>
        <span>所属景点</span>
        <select v-model="state.scenicSpotId" required>
          <option v-for="spot in spots" :key="spot.id" :value="spot.id">{{ spot.nameZh }}</option>
        </select>
      </label>
      <label>
        <span>票种名</span>
        <input v-model="state.name" type="text" placeholder="如：成人票" required />
      </label>
      <label>
        <span>价格 (¥)</span>
        <input v-model.number="state.price" type="number" min="0" step="1" />
      </label>
      <label>
        <span>适用人群</span>
        <input v-model="state.availableFor" type="text" placeholder="如：18 周岁以上" />
      </label>
      <label class="entity-form__wide">
        <span>描述</span>
        <textarea v-model="state.description" rows="2" placeholder="票种描述。"></textarea>
      </label>
    </div>

    <div class="entity-form__actions">
      <button type="button" class="entity-form__cancel" @click="emit('cancel')">取消</button>
      <button type="submit" class="entity-form__submit" :disabled="!isValid">
        {{ mode === 'create' ? '创建票种' : '保存修改' }}
      </button>
    </div>
  </form>
</template>
