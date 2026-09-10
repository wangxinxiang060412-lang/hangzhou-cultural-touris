<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ApiScenicSpot, ScenicSpotInput } from '../../services/api'
import { uploadScenicSpotImage } from '../../services/api'
import { getScenicSpotImage } from '../../utils/scenicSpotImages'

const props = defineProps<{
  mode: 'create' | 'edit'
  value?: ApiScenicSpot | null
  submitting?: boolean
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
  imageUrl: '',
  imagePosition: '50% 50%',
  imageUploading: false,
  imageError: '',
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
  state.imageUrl = current?.imageUrl ?? ''
  state.imagePosition = current?.imagePosition ?? '50% 50%'
  state.imageUploading = false
  state.imageError = ''
}

watch(() => props.value?.id, hydrate, { immediate: true })
watch(() => props.mode, hydrate)

const isValid = computed(
  () => state.nameZh.trim() && state.nameEn.trim() && state.area.trim() && state.category.trim(),
)
const previewSpot = computed(() => ({ imageUrl: state.imageUrl }))
const imagePreviewUrl = computed(() => getScenicSpotImage(previewSpot.value))

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result.replace(/^data:image\/[a-z0-9.+-]+;base64,/i, ''))
    }
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })

const handleImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    state.imageUploading = true
    state.imageError = ''
    const dataBase64 = await fileToBase64(file)
    const result = await uploadScenicSpotImage({
      fileName: file.name,
      mimeType: file.type,
      dataBase64,
    })
    state.imageUrl = result.imageUrl
  } catch (error) {
    state.imageError = error instanceof Error ? error.message : '图片上传失败'
  } finally {
    state.imageUploading = false
    input.value = ''
  }
}

const handleSubmit = () => {
  if (props.submitting || !isValid.value) return

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
    imageUrl: state.imageUrl,
    imagePosition: state.imagePosition.trim() || '50% 50%',
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
      <div class="entity-form__wide scenic-image-field">
        <div class="scenic-image-field__preview">
          <img v-if="imagePreviewUrl" :src="imagePreviewUrl" :alt="state.nameZh || '景点图片预览'" :style="{ objectPosition: state.imagePosition }" />
          <span v-else>{{ (state.nameEn || state.nameZh || 'HZ').slice(0, 2) }}</span>
        </div>
        <div class="scenic-image-field__body">
          <span>景点图片</span>
          <p>用于前台景点列表、详情页、首页推荐和组合票封面。</p>
          <div class="scenic-image-field__actions">
            <label class="scenic-image-field__upload">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                :disabled="submitting || state.imageUploading"
                @change="handleImageSelected"
              />
              {{ state.imageUploading ? '上传中' : imagePreviewUrl ? '更换图片' : '上传图片' }}
            </label>
            <input v-model="state.imagePosition" type="text" placeholder="裁剪位置，如 50% 50%" />
          </div>
          <small v-if="state.imageUrl">{{ state.imageUrl }}</small>
          <small v-if="state.imageError" class="scenic-image-field__error">{{ state.imageError }}</small>
        </div>
      </div>
    </div>

    <div class="entity-form__toggles">
      <label><input v-model="state.reservationRequired" type="checkbox" />购票/分时</label>
      <label><input v-model="state.paid" type="checkbox" />收费</label>
      <label><input v-model="state.featured" type="checkbox" />首页推荐</label>
    </div>

    <div class="entity-form__actions">
      <button type="button" class="entity-form__cancel" :disabled="submitting" @click="emit('cancel')">取消</button>
      <button type="submit" class="entity-form__submit" :disabled="!isValid || submitting">
        {{ submitting ? '保存中' : mode === 'create' ? '创建景点' : '保存修改' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.scenic-image-field {
  display: grid;
  grid-template-columns: minmax(120px, 0.42fr) minmax(0, 1fr);
  gap: 1px;
  background: rgba(16, 20, 18, 0.08);
}

.scenic-image-field__preview,
.scenic-image-field__body {
  background: rgba(250, 247, 240, 0.94);
}

.scenic-image-field__preview {
  display: grid;
  place-items: center;
  min-height: 168px;
  overflow: hidden;
}

.scenic-image-field__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.86) contrast(0.96);
}

.scenic-image-field__preview span {
  color: rgba(31, 58, 52, 0.42);
  font-family: var(--font-serif);
  font-size: clamp(34px, 6vw, 64px);
  letter-spacing: 0.16em;
}

.scenic-image-field__body {
  display: grid;
  align-content: center;
  gap: 10px;
  padding: 16px;
  min-width: 0;
}

.scenic-image-field__body > span {
  color: rgba(16, 20, 18, 0.44);
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.scenic-image-field__body p,
.scenic-image-field__body small {
  margin: 0;
  color: rgba(16, 20, 18, 0.58);
  font-size: 12px;
  letter-spacing: 0.04em;
  overflow-wrap: anywhere;
}

.scenic-image-field__actions {
  display: grid;
  grid-template-columns: auto minmax(120px, 1fr);
  gap: 10px;
  align-items: end;
}

.scenic-image-field__upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid rgba(31, 58, 52, 0.22);
  background: rgba(232, 239, 233, 0.68);
  color: var(--deep-green);
  cursor: pointer;
  padding: 0 14px;
  font-size: 11px;
  letter-spacing: 0.18em;
  white-space: nowrap;
}

.scenic-image-field__upload input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.scenic-image-field__actions > input {
  width: 100%;
  border: 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.14);
  background: transparent;
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
  outline: none;
}

.scenic-image-field__error {
  color: rgba(138, 106, 79, 0.9) !important;
}

@media (max-width: 640px) {
  .scenic-image-field,
  .scenic-image-field__actions {
    grid-template-columns: 1fr;
  }
}
</style>
