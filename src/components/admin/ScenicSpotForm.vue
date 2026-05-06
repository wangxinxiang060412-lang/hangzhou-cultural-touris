<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ApiScenicSpot, ScenicSpotInput } from '../../services/api'

const props = defineProps<{
  mode: 'create' | 'edit'
  value?: ApiScenicSpot | null
}>()

const emit = defineEmits<{
  submit: [payload: ScenicSpotInput]
  cancel: []
}>()

const state = reactive({
  nameZh: '',
  nameEn: '',
  area: '',
  category: '',
  description: '',
  address: '',
  openingHours: '',
  tagsInput: '',
  reservationRequired: false,
  paid: false,
  featured: false,
})

const hydrate = () => {
  const current = props.value
  state.nameZh = current?.nameZh ?? ''
  state.nameEn = current?.nameEn ?? ''
  state.area = current?.area ?? ''
  state.category = current?.category ?? ''
  state.description = current?.description ?? ''
  state.address = current?.address ?? ''
  state.openingHours = current?.openingHours ?? ''
  state.tagsInput = (current?.tags ?? []).join('、')
  state.reservationRequired = current?.reservationRequired ?? false
  state.paid = current?.paid ?? false
  state.featured = current?.featured ?? false
}

watch(() => props.value?.id, hydrate, { immediate: true })
watch(() => props.mode, hydrate)

const isValid = computed(
  () => state.nameZh.trim() && state.nameEn.trim() && state.area.trim() && state.category.trim(),
)

const handleSubmit = () => {
  if (!isValid.value) return

  const tags = state.tagsInput
    .split(/[,，、\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)

  emit('submit', {
    nameZh: state.nameZh.trim(),
    nameEn: state.nameEn.trim(),
    area: state.area.trim(),
    category: state.category.trim(),
    description: state.description.trim(),
    address: state.address.trim(),
    openingHours: state.openingHours.trim(),
    tags,
    reservationRequired: state.reservationRequired,
    paid: state.paid,
    featured: state.featured,
  })
}
</script>

<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <header>
      <p>{{ mode === 'create' ? '新增景点' : `编辑 ${value?.nameZh ?? ''}` }}</p>
      <small>Scenic Spot</small>
    </header>

    <div class="entity-form__grid">
      <label>
        <span>中文名</span>
        <input v-model="state.nameZh" type="text" placeholder="如：西湖" required />
      </label>
      <label>
        <span>英文名</span>
        <input v-model="state.nameEn" type="text" placeholder="如：West Lake" required />
      </label>
      <label>
        <span>区域</span>
        <input v-model="state.area" type="text" placeholder="如：西湖区" required />
      </label>
      <label>
        <span>分类</span>
        <input v-model="state.category" type="text" placeholder="如：湖山风景" required />
      </label>
      <label class="entity-form__wide">
        <span>描述</span>
        <textarea v-model="state.description" rows="2" placeholder="一句话介绍这个景点。"></textarea>
      </label>
      <label class="entity-form__wide">
        <span>地址</span>
        <input v-model="state.address" type="text" />
      </label>
      <label>
        <span>开放时间</span>
        <input v-model="state.openingHours" type="text" placeholder="如：08:00-17:00" />
      </label>
      <label>
        <span>标签</span>
        <input v-model="state.tagsInput" type="text" placeholder="用逗号或空格分隔" />
      </label>
    </div>

    <div class="entity-form__toggles">
      <label><input v-model="state.reservationRequired" type="checkbox" />购票/分时</label>
      <label><input v-model="state.paid" type="checkbox" />收费</label>
      <label><input v-model="state.featured" type="checkbox" />首页推荐</label>
    </div>

    <div class="entity-form__actions">
      <button type="button" class="entity-form__cancel" @click="emit('cancel')">取消</button>
      <button type="submit" class="entity-form__submit" :disabled="!isValid">
        {{ mode === 'create' ? '创建景点' : '保存修改' }}
      </button>
    </div>
  </form>
</template>
