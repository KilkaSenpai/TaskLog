<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="isAuthModalOpen"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4"
      >
        <div
          class="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
        >
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 class="text-base font-semibold text-slate-900">
              {{ pendingConfirmationEmail ? 'Підтвердження email' : (authMode === 'login' ? 'Вхід до TaskLog' : 'Реєстрація в TaskLog') }}
            </h2>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              @click="closeAuth"
              aria-label="Закрити"
            >
              <XIcon class="h-4 w-4" />
            </button>
          </div>

          <div v-if="pendingConfirmationEmail" class="px-6 py-6 space-y-4">
            <p class="text-sm text-slate-600">
              Лист для підтвердження надіслано на <strong>{{ pendingConfirmationEmail }}</strong>. Перевірте пошту та перейдіть за посиланням для підтвердження.
            </p>
            <p class="text-sm text-slate-500">
              Якщо листа немає — перевірте папку «Спам» або натисніть кнопку нижче, щоб надіслати лист повторно.
            </p>
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              :disabled="isAuthLoading"
              @click="resendConfirmationEmail(pendingConfirmationEmail)"
            >
              {{ isAuthLoading ? 'Надсилання...' : 'Надіслати лист повторно' }}
            </button>
          </div>

          <div v-else class="px-6 pt-4">
            <div class="auth-modal-tabs mb-4 flex rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600">
              <button
                type="button"
                class="auth-modal-tab flex-1 rounded-full px-3 py-1.5 transition cursor-pointer"
                :class="[
                  authMode === 'login'
                    ? 'auth-modal-tab-active bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                ]"
                @click="setMode('login')"
              >
                Вхід
              </button>
              <button
                type="button"
                class="auth-modal-tab flex-1 rounded-full px-3 py-1.5 transition cursor-pointer"
                :class="[
                  authMode === 'register'
                    ? 'auth-modal-tab-active bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                ]"
                @click="setMode('register')"
              >
                Реєстрація
              </button>
            </div>
          </div>

          <div v-if="!pendingConfirmationEmail" class="px-6 pb-6">
            <form
              v-if="authMode === 'login'"
              class="space-y-4"
              @submit.prevent="handleLogin"
            >
              <button
                type="button"
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                :disabled="isAuthLoading"
                @click="signInWithGoogle"
              >
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Увійти через Google
              </button>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200" />
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-white px-2 text-slate-500">або email та пароль</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-slate-700">
                  Email або логін
                </label>
                <input
                  v-model="identifier"
                  type="text"
                  class="block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors"
                  :class="loginInvalid.identifier ? 'border-1 border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'"
                  placeholder="you@example.com / your_login"
                  @input="loginInvalid.identifier = false"
                />
              </div>

              <AuthPasswordField
                v-model="password"
                label="Пароль"
                :invalid="loginInvalid.password"
                @copy="copyToClipboard(password)"
                @update:modelValue="loginInvalid.password = false"
              />

              <button
                type="submit"
                class="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                :disabled="isAuthLoading"
              >
                {{ isAuthLoading ? 'Вхід...' : 'Увійти' }}
              </button>

              <p class="text-center text-xs text-slate-500">
                <button
                  type="button"
                  class="font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  @click="showForgotPassword = true; if (identifier.includes('@')) forgotPasswordEmail = identifier"
                >
                  Забули пароль?
                </button>
              </p>

              <div
                v-if="showForgotPassword"
                class="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2"
              >
                <p class="text-sm font-medium text-slate-700">
                  Відновлення пароля
                </p>
                <input
                  v-model="forgotPasswordEmail"
                  type="email"
                  class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm"
                  placeholder="Введіть email облікового запису"
                />
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                    :disabled="isAuthLoading || !forgotPasswordEmail?.trim()"
                    @click="handleForgotPassword"
                  >
                    Надіслати посилання
                  </button>
                  <button
                    type="button"
                    class="auth-modal-cancel rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
                    @click="showForgotPassword = false"
                  >
                    Скасувати
                  </button>
                </div>
              </div>

              <p class="text-center text-xs text-slate-500">
                Немає облікового запису?
                <button
                  type="button"
                  class="font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  @click="switchToRegisterFromLogin"
                >
                  Зареєструватися
                </button>
              </p>
            </form>

            <form
              v-else
              class="space-y-4"
              @submit.prevent="handleRegister"
            >
              <button
                type="button"
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                :disabled="isAuthLoading"
                @click="signInWithGoogle"
              >
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Продовжити з Google
              </button>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200" />
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-white px-2 text-slate-500">або заповніть форму</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-slate-700">
                  Ім'я
                </label>
                <input
                  v-model="displayName"
                  type="text"
                  class="block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors"
                  :class="regInvalid.displayName ? 'border-1 border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'"
                  placeholder="Як до вас звертатися"
                  @input="regInvalid.displayName = false"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-slate-700">
                  Логін (латиниця)
                </label>
                <input
                  v-model="username"
                  type="text"
                  class="block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors"
                  :class="regInvalid.username ? 'border-1 border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'"
                  placeholder="your_login"
                  @input="regInvalid.username = false"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  v-model="email"
                  type="email"
                  class="block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors"
                  :class="regInvalid.email ? 'border-1 border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'"
                  placeholder="you@example.com"
                  @input="regInvalid.email = false"
                />
              </div>

              <AuthPasswordField
                v-model="password"
                label="Пароль"
                :invalid="regInvalid.password"
                @copy="copyToClipboard(password)"
                @update:modelValue="regInvalid.password = false"
              />

              <button
                type="submit"
                class="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 cursor-pointer"
                :disabled="isAuthLoading || !!usernameError || !!emailError"
              >
                {{ isAuthLoading ? 'Реєстрація...' : 'Зареєструватися' }}
              </button>

              <p class="text-center text-xs text-slate-500">
                Вже маєте обліковий запис?
                <button
                  type="button"
                  class="font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  @click="setMode('login')"
                >
                  Увійти
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X as XIcon } from 'lucide-vue-next'

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/

const {
  isAuthModalOpen,
  authMode,
  isAuthLoading,
  pendingConfirmationEmail,
  setMode,
  closeAuth,
  login,
  register,
  resetPassword,
  resendConfirmationEmail,
  signInWithGoogle
} = useAuth()

const { pushToast } = useToasts()

const identifier = ref('')
const username = ref('')
const email = ref('')
const password = ref('')

const displayName = ref('')
const showForgotPassword = ref(false)
const forgotPasswordEmail = ref('')

const loginInvalid = reactive({ identifier: false, password: false })
const regInvalid = reactive({ username: false, email: false, password: false, displayName: false })

watch(isAuthModalOpen, (open) => {
  if (!open) {
    showForgotPassword.value = false
    forgotPasswordEmail.value = ''
  }
})

watch(authMode, () => {
  showForgotPassword.value = false
  forgotPasswordEmail.value = ''
  loginInvalid.identifier = false
  loginInvalid.password = false
  regInvalid.username = false
  regInvalid.email = false
  regInvalid.password = false
  regInvalid.displayName = false
})

const handleForgotPassword = async () => {
  const email = forgotPasswordEmail.value?.trim()
  if (!email) {
    pushToast({ message: 'Введіть email.', tone: 'danger' })
    return
  }
  await resetPassword(email)
  showForgotPassword.value = false
  forgotPasswordEmail.value = ''
}

const usernameError = computed(() => {
  if (!username.value) return ''
  if (!USERNAME_REGEX.test(username.value)) {
    return 'Логін може містити лише латинські символи, цифри та _.'
  }
  if (username.value.length < 3) {
    return 'Логін має містити щонайменше 3 символи.'
  }
  return ''
})

const emailError = computed(() => {
  if (!email.value) return ''
  const valid = /\S+@\S+\.\S+/.test(email.value)
  return valid ? '' : 'Некоректний формат email.'
})

const handleLogin = async () => {
  const noIdentifier = !identifier.value?.trim()
  const noPassword = !password.value
  if (noIdentifier || noPassword) {
    loginInvalid.identifier = noIdentifier
    loginInvalid.password = noPassword
    pushToast({
      message: 'Введіть логін/email та пароль.',
      tone: 'danger'
    })
    return
  }

  await login({
    identifier: identifier.value.trim(),
    password: password.value
  })
}

const handleRegister = async () => {
  const noUsername = !username.value
  const noEmail = !email.value
  const noPassword = !password.value
  if (noUsername || noEmail || noPassword) {
    regInvalid.username = noUsername
    regInvalid.email = noEmail
    regInvalid.password = noPassword
    pushToast({
      message: 'Заповніть усі поля.',
      tone: 'danger'
    })
    return
  }

  if (usernameError.value) {
    regInvalid.username = true
    pushToast({
      message: usernameError.value,
      tone: 'danger'
    })
    return
  }

  if (emailError.value) {
    regInvalid.email = true
    pushToast({
      message: emailError.value,
      tone: 'danger'
    })
    return
  }

  await register({
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value,
    display_name: displayName.value.trim() || null
  })
}

const switchToRegisterFromLogin = () => {
  setMode('register')
}

const copyToClipboard = async (value: string) => {
  if (!value || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(value)
    pushToast({
      message: 'Пароль скопійовано',
      tone: 'success'
    })
  } catch {
    pushToast({
      message: 'Не вдалося скопіювати пароль.',
      tone: 'danger'
    })
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

