<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authError, authLoading, closeLoginModal, login, loginModalOpen, pendingAuthRedirect, register } from '../../stores/auth'

type View = 'login' | 'register'

const view = ref<View>('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')
const phone = ref('')
const usernameInput = ref<HTMLInputElement | null>(null)
const router = useRouter()

const normalizedPhone = computed(() => phone.value.replace(/\D/g, ''))
const phoneIsValid = computed(() => /^1[3-9]\d{9}$/.test(normalizedPhone.value))
const passwordIsStrong = computed(() => password.value.length >= 8 && /[A-Za-z]/.test(password.value) && /\d/.test(password.value))
const passwordsMatch = computed(() => password.value === confirmPassword.value)
const registerHint = computed(() => {
  if (view.value !== 'register') return ''
  if (username.value.trim().length > 0 && username.value.trim().length < 3) return '用户名至少3个字符'
  if (password.value.length > 0 && !passwordIsStrong.value) return '密码至少8位，且需包含字母和数字'
  if (confirmPassword.value.length > 0 && !passwordsMatch.value) return '两次输入的密码不一致'
  if (displayName.value.trim().length > 0 && displayName.value.trim().length < 2) return '昵称至少2个字符'
  if (phone.value.trim().length > 0 && !phoneIsValid.value) return '请输入有效的11位手机号'
  return '注册需填写真实手机号，系统仅保存脱敏号码'
})

const isValid = computed(() => {
  if (view.value === 'login') {
    return username.value.trim().length >= 3 && password.value.length >= 1
  }
  return (
    username.value.trim().length >= 3 &&
    passwordIsStrong.value &&
    passwordsMatch.value &&
    displayName.value.trim().length >= 2 &&
    phoneIsValid.value
  )
})

const resetForm = () => {
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
  displayName.value = ''
  phone.value = ''
}

const switchView = (target: View) => {
  view.value = target
  resetForm()
}

const handleSubmit = async () => {
  if (!isValid.value || authLoading.value) return

  const redirectTo = pendingAuthRedirect.value
  let ok = false
  if (view.value === 'login') {
    ok = await login(username.value.trim(), password.value)
  } else {
    ok = await register(
      username.value.trim(),
      password.value,
      displayName.value.trim(),
      normalizedPhone.value,
    )
  }

  if (ok && redirectTo) {
    pendingAuthRedirect.value = null
    await router.push(redirectTo)
  }
}

const handleOverlayClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('login-overlay')) {
    closeLoginModal()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeLoginModal()
}

watch(loginModalOpen, async (open) => {
  if (open) {
    view.value = 'login'
    resetForm()
    await nextTick()
    usernameInput.value?.focus()
  }
})
</script>

<template>
  <Transition name="login-modal">
    <div
      v-if="loginModalOpen"
      class="login-overlay"
      @click="handleOverlayClick"
      @keydown="handleKeydown"
    >
      <div class="login-card" role="dialog" aria-modal="true" :aria-label="view === 'login' ? '登录' : '注册'">
        <button type="button" class="login-card__close" aria-label="关闭" @click="closeLoginModal">
          ×
        </button>

        <header class="login-card__header">
          <p class="login-card__brand">杭州文旅</p>
          <h2 class="login-card__title">
            {{ view === 'login' ? '欢迎回来' : '创建账号' }}
          </h2>
          <p class="login-card__subtitle">
            {{ view === 'login' ? '登录后即可预约景点、管理行程' : '注册后即可预约景点、管理行程' }}
          </p>
        </header>

        <form class="login-card__form" @submit.prevent="handleSubmit">
          <label class="login-field">
            <span>用户名</span>
            <input
              ref="usernameInput"
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              autocomplete="username"
              :disabled="authLoading"
            />
          </label>

          <label class="login-field">
            <span>密码</span>
            <input
              v-model="password"
              type="password"
              :placeholder="view === 'login' ? '请输入密码' : '至少8位，含字母和数字'"
              autocomplete="current-password"
              :disabled="authLoading"
            />
          </label>

          <template v-if="view === 'register'">
            <label class="login-field">
              <span>确认密码</span>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                autocomplete="new-password"
                :disabled="authLoading"
              />
            </label>

            <label class="login-field">
              <span>昵称</span>
              <input
                v-model="displayName"
                type="text"
                placeholder="您的昵称（至少2个字符）"
                :disabled="authLoading"
              />
            </label>

            <label class="login-field">
              <span>手机号</span>
              <input
                v-model="phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                placeholder="如 13900007788"
                :disabled="authLoading"
              />
            </label>

            <p class="login-card__validation" :class="{ 'is-warning': registerHint && registerHint !== '注册需填写真实手机号，系统仅保存脱敏号码' }">
              {{ registerHint }}
            </p>
          </template>

          <p v-if="authError" class="login-card__error" role="alert">
            {{ authError }}
          </p>

          <button
            type="submit"
            class="login-card__submit"
            :disabled="!isValid || authLoading"
          >
            {{ authLoading ? '请稍候…' : view === 'login' ? '登 录' : '注 册' }}
          </button>
        </form>

        <footer class="login-card__footer">
          <template v-if="view === 'login'">
            <span>还没有账号？</span>
            <button type="button" class="login-card__switch" @click="switchView('register')">
              立即注册
            </button>
          </template>
          <template v-else>
            <span>已有账号？</span>
            <button type="button" class="login-card__switch" @click="switchView('login')">
              返回登录
            </button>
          </template>
        </footer>

        <p class="login-card__hint">
          演示账号：admin / traveler，密码：123456
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(16, 20, 18, 0.38);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: grid;
  gap: 0;
  padding: clamp(28px, 4vw, 40px);
  border: 1px solid rgba(16, 20, 18, 0.1);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(250, 247, 240, 0.98), rgba(244, 239, 230, 0.96));
  box-shadow:
    0 24px 64px rgba(16, 20, 18, 0.14),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
}

.login-card__close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: rgba(16, 20, 18, 0.4);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: background 160ms ease, color 160ms ease;
}

.login-card__close:hover {
  background: rgba(16, 20, 18, 0.06);
  color: var(--ink);
}

.login-card__header {
  display: grid;
  gap: 8px;
  margin-bottom: 28px;
  text-align: center;
}

.login-card__brand {
  margin: 0;
  color: rgba(16, 20, 18, 0.36);
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.login-card__title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(22px, 3vw, 26px);
  font-weight: 400;
  letter-spacing: 0.1em;
  color: var(--ink);
}

.login-card__subtitle {
  margin: 0;
  color: rgba(16, 20, 18, 0.5);
  font-size: 13px;
  letter-spacing: 0.02em;
}

.login-card__form {
  display: grid;
  gap: 18px;
}

.login-field {
  display: grid;
  gap: 8px;
}

.login-field span {
  color: rgba(16, 20, 18, 0.5);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.login-field small {
  letter-spacing: 0.06em;
  text-transform: none;
}

.login-field input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  color: var(--ink);
  font-family: inherit;
  font-size: 15px;
  letter-spacing: 0.02em;
  outline: none;
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.login-field input::placeholder {
  color: rgba(16, 20, 18, 0.3);
}

.login-field input:focus {
  border-color: rgba(31, 58, 52, 0.36);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 0 0 3px rgba(31, 58, 52, 0.08);
}

.login-field input:disabled {
  opacity: 0.6;
}

.login-card__error {
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(180, 60, 40, 0.07);
  color: #9a3030;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.login-card__validation {
  margin: -4px 0 0;
  color: rgba(16, 20, 18, 0.42);
  font-size: 12px;
  letter-spacing: 0.04em;
  line-height: 1.6;
}

.login-card__validation.is-warning {
  color: rgba(138, 106, 79, 0.9);
}

.login-card__submit {
  margin-top: 4px;
  padding: 14px;
  border: 1px solid var(--deep-green);
  border-radius: 10px;
  background: var(--deep-green);
  color: var(--paper-light);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.22em;
  transition: background 180ms ease, transform 120ms ease, opacity 180ms ease;
}

.login-card__submit:hover:not(:disabled) {
  background: #16302b;
}

.login-card__submit:active:not(:disabled) {
  transform: scale(0.98);
}

.login-card__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-card__footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  color: rgba(16, 20, 18, 0.5);
  font-size: 13px;
}

.login-card__switch {
  border: 0;
  background: transparent;
  color: var(--deep-green);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.02em;
  padding: 2px 4px;
  transition: color 160ms ease;
}

.login-card__switch:hover {
  color: var(--westlake-green);
}

.login-card__hint {
  margin: 16px 0 0;
  text-align: center;
  color: rgba(16, 20, 18, 0.32);
  font-size: 11px;
  letter-spacing: 0.04em;
}

/* Transition */
.login-modal-enter-active,
.login-modal-leave-active {
  transition: opacity 220ms ease;
}

.login-modal-enter-active .login-card,
.login-modal-leave-active .login-card {
  transition: opacity 220ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.login-modal-enter-from,
.login-modal-leave-to {
  opacity: 0;
}

.login-modal-enter-from .login-card,
.login-modal-leave-to .login-card {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
</style>
