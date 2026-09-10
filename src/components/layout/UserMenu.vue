<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { currentUser, isAdmin, logout, userAvatarColor, userInitial } from '../../stores/auth'
import UserAvatar from './UserAvatar.vue'

const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const router = useRouter()

const roleLabel = computed(() =>
  currentUser.value?.role === '管理员' ? '管理员' : '普通用户',
)

const handleLogout = async () => {
  await logout()
  emit('close')
  if (route.meta.requiresAuth) {
    await router.push('/')
  }
}
</script>

<template>
  <div class="user-menu" role="menu">
    <div class="user-menu__profile">
      <UserAvatar :initial="userInitial" :color="userAvatarColor" :size="42" />
      <div class="user-menu__info">
        <p class="user-menu__name">{{ currentUser?.displayName }}</p>
        <small class="user-menu__role">{{ roleLabel }}</small>
      </div>
    </div>

    <div class="user-menu__meta">
      <span>{{ currentUser?.username }}</span>
      <span>{{ currentUser?.phoneMasked }}</span>
    </div>

    <div class="user-menu__divider" />

    <RouterLink
      v-if="isAdmin"
      to="/admin"
      class="user-menu__item"
      role="menuitem"
      @click="emit('close')"
    >
      进入后台
    </RouterLink>

    <RouterLink
      to="/orders"
      class="user-menu__item"
      role="menuitem"
      @click="emit('close')"
    >
      我的预约
    </RouterLink>

    <div class="user-menu__divider" />

    <button
      type="button"
      class="user-menu__item user-menu__item--logout"
      role="menuitem"
      @click="handleLogout"
    >
      退出登录
    </button>
  </div>
</template>

<style scoped>
.user-menu {
  width: clamp(220px, 24vw, 280px);
  display: grid;
  gap: 4px;
  padding: 14px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  border-radius: 14px;
  background: rgba(250, 247, 240, 0.98);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 48px rgba(36, 42, 39, 0.12);
}

.user-menu__profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 4px 10px;
}

.user-menu__info {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.user-menu__name {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.04em;
  color: var(--ink);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__role {
  color: rgba(16, 20, 18, 0.5);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.user-menu__meta {
  display: flex;
  gap: 12px;
  padding: 4px 4px 6px;
  color: rgba(16, 20, 18, 0.42);
  font-size: 12px;
  letter-spacing: 0.02em;
}

.user-menu__divider {
  height: 1px;
  background: rgba(16, 20, 18, 0.08);
  margin: 2px 0;
}

.user-menu__item {
  display: block;
  padding: 10px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.02em;
  text-align: left;
  width: 100%;
  transition: background 160ms ease, color 160ms ease;
}

.user-menu__item:hover,
.user-menu__item:focus-visible {
  background: rgba(31, 58, 52, 0.08);
  color: var(--deep-green);
  outline: none;
}

.user-menu__item--logout {
  color: rgba(16, 20, 18, 0.58);
}

.user-menu__item--logout:hover {
  background: rgba(180, 60, 40, 0.06);
  color: #9a3030;
}
</style>
