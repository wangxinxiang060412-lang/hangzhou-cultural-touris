<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ApiBookingSlot, ApiScenicSpot, BookingSlotInput } from '../../services/api'
import { formatLocalDate } from '../../utils/date'

const props = defineProps<{
  mode: 'create' | 'edit'
  value?: ApiBookingSlot | null
  spots: ApiScenicSpot[]
  defaultSpotId?: string
}>()

const emit = defineEmits<{
  submit: [payload: BookingSlotInput]
  cancel: []
}>()

const today = formatLocalDate(new Date())

const state = reactive({
  scenicSpotId: '',
  date: today,
  timeRange: '',
  capacity: 80,
  booked: 0,
})

const hydrate = () => {
  const current = props.value
  state.scenicSpotId = current?.scenicSpotId ?? props.defaultSpotId ?? props.spots[0]?.id ?? ''
  state.date = current?.date ?? today
  state.timeRange = current?.timeRange ?? '09:00-11:00'
  state.capacity = current?.capacity ?? 80
  state.booked = current?.booked ?? 0
}

watch(() => props.value?.id, hydrate, { immediate: true })
watch(() => props.mode, hydrate)
watch(() => props.defaultSpotId, (next) => {
  if (props.mode === 'create' && next) {
    state.scenicSpotId = next
  }
})

const bookedExceedsCapacity = computed(() => state.booked > state.capacity)
const isValid = computed(
  () =>
    state.scenicSpotId &&
    /^\d{4}-\d{2}-\d{2}$/.test(state.date) &&
    state.timeRange.trim().length > 0 &&
    state.capacity >= 1 &&
    state.booked >= 0 &&
    !bookedExceedsCapacity.value,
)

const handleSubmit = () => {
  if (!isValid.value) return

  emit('submit', {
    scenicSpotId: state.scenicSpotId,
    date: state.date,
    timeRange: state.timeRange.trim(),
    capacity: Math.round(state.capacity),
    booked: Math.round(state.booked),
  })
}
</script>

<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <header>
      <p>{{ mode === 'create' ? '新增时段' : `编辑 ${value?.date ?? ''} ${value?.timeRange ?? ''}` }}</p>
      <small>Booking Slot</small>
    </header>

    <div class="entity-form__grid">
      <label>
        <span>所属景点</span>
        <select v-model="state.scenicSpotId" :disabled="mode === 'edit'" required>
          <option v-for="spot in spots" :key="spot.id" :value="spot.id">{{ spot.nameZh }}</option>
        </select>
      </label>
      <label>
        <span>日期</span>
        <input v-model="state.date" type="date" required />
      </label>
      <label>
        <span>时段</span>
        <input v-model="state.timeRange" type="text" placeholder="如：09:00-11:00" required />
      </label>
      <label>
        <span>容量</span>
        <input v-model.number="state.capacity" type="number" min="1" step="1" required />
      </label>
      <label :class="{ 'has-warning': bookedExceedsCapacity }">
        <span>基础已约</span>
        <input v-model.number="state.booked" type="number" min="0" step="1" />
      </label>
    </div>

    <p v-if="bookedExceedsCapacity" class="entity-form__hint entity-form__hint--warning">
      基础已约人数不能超过容量。
    </p>

    <div class="entity-form__actions">
      <button type="button" class="entity-form__cancel" @click="emit('cancel')">取消</button>
      <button type="submit" class="entity-form__submit" :disabled="!isValid">
        {{ mode === 'create' ? '创建时段' : '保存修改' }}
      </button>
    </div>
  </form>
</template>
