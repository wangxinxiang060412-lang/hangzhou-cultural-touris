<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { ApiBookingSlot, ApiScenicSpot, BookingSlotInput } from '../../services/api'
import { formatLocalDate } from '../../utils/date'

const props = defineProps<{
  mode: 'create' | 'edit'
  value?: ApiBookingSlot | null
  spots: ApiScenicSpot[]
  defaultSpotId?: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: BookingSlotInput]
  cancel: []
}>()

const today = formatLocalDate(new Date())
const timeRangeOptions = [
  { value: '09:00-11:00', label: '上午', note: '开园后首批入园' },
  { value: '11:00-13:00', label: '中午', note: '午间错峰办理' },
  { value: '14:00-16:00', label: '下午', note: '常规下午时段' },
  { value: '16:00-18:00', label: '傍晚', note: '晚间活动前入园' },
  { value: '18:30-20:30', label: '夜场', note: '夜游或演出场次' },
]

const state = reactive({
  scenicSpotId: '',
  date: today,
  timeRange: '',
  capacity: 80,
  booked: 0,
})
const timePickerOpen = ref(false)

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
const timeRangeChoices = computed(() => {
  const hasCurrent = timeRangeOptions.some((option) => option.value === state.timeRange)
  if (!state.timeRange || hasCurrent) return timeRangeOptions

  return [
    { value: state.timeRange, label: '当前', note: '已保存的自定义时段' },
    ...timeRangeOptions,
  ]
})
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
  if (props.submitting || !isValid.value) return

  emit('submit', {
    scenicSpotId: state.scenicSpotId,
    date: state.date,
    timeRange: state.timeRange.trim(),
    capacity: Math.round(state.capacity),
    booked: Math.round(state.booked),
  })
}

const selectTimeRange = (value: string) => {
  state.timeRange = value
  timePickerOpen.value = false
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
        <button
          type="button"
          class="time-range-trigger"
          aria-haspopup="dialog"
          :aria-expanded="timePickerOpen"
          @click="timePickerOpen = true"
        >
          <strong>{{ state.timeRange || '选择时段' }}</strong>
          <small>点击选择</small>
        </button>
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
      <button type="button" class="entity-form__cancel" :disabled="submitting" @click="emit('cancel')">取消</button>
      <button type="submit" class="entity-form__submit" :disabled="!isValid || submitting">
        {{ submitting ? '保存中' : mode === 'create' ? '创建时段' : '保存修改' }}
      </button>
    </div>

    <Teleport to="body">
      <div v-if="timePickerOpen" class="time-range-dialog" @keydown.esc="timePickerOpen = false">
        <button
          type="button"
          class="time-range-dialog__backdrop"
          aria-label="关闭时段选择"
          @click="timePickerOpen = false"
        ></button>
        <section
          class="time-range-dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="time-range-dialog-title"
        >
          <header>
            <p id="time-range-dialog-title">选择办理时段</p>
            <button type="button" aria-label="关闭时段选择" @click="timePickerOpen = false">×</button>
          </header>
          <div class="time-range-dialog__options">
            <button
              v-for="option in timeRangeChoices"
              :key="option.value"
              type="button"
              :class="{ 'is-selected': state.timeRange === option.value }"
              @click="selectTimeRange(option.value)"
            >
              <span>{{ option.label }}</span>
              <strong>{{ option.value }}</strong>
              <small>{{ option.note }}</small>
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </form>
</template>

<style scoped>
.time-range-trigger {
  display: grid;
  gap: 4px;
  width: 100%;
  min-height: 45px;
  border: 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.14);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.time-range-trigger:focus-visible {
  outline: 2px solid rgba(10, 110, 92, 0.3);
  outline-offset: 3px;
}

.time-range-trigger strong {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.time-range-trigger small {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.time-range-dialog {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 20px;
}

.time-range-dialog__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(16, 20, 18, 0.36);
  cursor: pointer;
}

.time-range-dialog__panel {
  position: relative;
  width: min(520px, 100%);
  max-height: min(720px, calc(100vh - 40px));
  overflow: auto;
  border: 1px solid rgba(16, 20, 18, 0.14);
  background: rgba(250, 247, 240, 0.98);
  box-shadow: 0 24px 80px rgba(16, 20, 18, 0.22);
}

.time-range-dialog__panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 12px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.time-range-dialog__panel header p {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 20px;
  letter-spacing: 0.06em;
}

.time-range-dialog__panel header button {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  border-radius: 50%;
  background: rgba(250, 247, 240, 0.92);
  color: rgba(16, 20, 18, 0.6);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}

.time-range-dialog__options {
  display: grid;
  gap: 10px;
  padding: 16px;
}

.time-range-dialog__options button {
  display: grid;
  grid-template-columns: 62px 1fr;
  gap: 4px 14px;
  align-items: center;
  min-height: 76px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(255, 255, 255, 0.38);
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
  padding: 12px 14px;
  text-align: left;
}

.time-range-dialog__options button:hover,
.time-range-dialog__options button:focus-visible,
.time-range-dialog__options button.is-selected {
  border-color: rgba(10, 110, 92, 0.36);
  background: rgba(232, 239, 233, 0.88);
  outline: none;
}

.time-range-dialog__options span {
  grid-row: span 2;
  color: var(--deep-green);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.time-range-dialog__options strong {
  font-size: 18px;
  letter-spacing: 0.04em;
}

.time-range-dialog__options small {
  color: rgba(16, 20, 18, 0.54);
  font-size: 12px;
  letter-spacing: 0.04em;
}

@media (max-width: 560px) {
  .time-range-dialog {
    align-items: end;
    padding: 0;
  }

  .time-range-dialog__panel {
    width: 100%;
    max-height: 86vh;
  }

  .time-range-dialog__options button {
    grid-template-columns: 1fr;
  }

  .time-range-dialog__options span {
    grid-row: auto;
  }
}
</style>
