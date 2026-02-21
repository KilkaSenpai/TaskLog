<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-2xl font-semibold text-slate-900">
      Новий пароль
    </h1>
    <p class="mt-1 text-sm text-slate-500">
      Введіть новий пароль для облікового запису. Після зміни потрібно буде увійти знову.
    </p>

    <div
      v-if="linkError"
      class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
    >
      <p class="font-medium">
        {{ linkError }}
      </p>
      <p class="mt-1 text-amber-700">
        Запросите новий лист для скидання пароля з форми входу («Забули пароль?»).
      </p>
      <NuxtLink
        to="/"
        class="mt-3 inline-block font-medium text-amber-800 underline hover:no-underline"
      >
        На головну
      </NuxtLink>
    </div>

    <form
      v-else-if="ready"
      class="mt-6 space-y-4"
      @submit.prevent="onSubmit"
    >
      <AuthPasswordField
        v-model="password"
        label="Новий пароль"
        :invalid="invalid.password"
        @update:modelValue="invalid.password = false"
      />
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-slate-700">
          Підтвердіть пароль
        </label>
        <input
          v-model="confirmPassword"
          type="password"
          class="block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm"
          :class="invalid.confirm ? 'border-2 border-rose-500' : 'border border-slate-300'"
          placeholder="Повторіть пароль"
          @input="invalid.confirm = false"
        />
        <p v-if="invalid.confirm" class="text-sm text-rose-600">
          {{ invalid.confirm }}
        </p>
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Збереження...' : 'Зберегти пароль' }}
      </button>
      <p v-if="error" class="text-sm text-rose-600">
        {{ error }}
      </p>
    </form>

    <p v-else-if="!clientReady" class="mt-6 text-sm text-slate-500">
      Завантаження...
    </p>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Новий пароль — TaskLog',
  description: 'Введіть новий пароль для облікового запису після скидання.'
})

const supabase = useSupabase()
const { authUser, openAuth, pushToast } = useAuth()
const router = useRouter()

const clientReady = ref(false)
const ready = ref(false)
const linkError = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const invalid = reactive<{ password: boolean; confirm: string | false }>({
  password: false,
  confirm: false
})

function parseHashParams(): Record<string, string> {
  if (typeof window === 'undefined' || !window.location.hash) return {}
  const hash = window.location.hash.slice(1)
  return Object.fromEntries(
    hash.split('&').map((part) => {
      const [key, ...rest] = part.split('=')
      return [key, decodeURIComponent(rest.join('=').replace(/\+/g, ' '))]
    })
  )
}

onMounted(async () => {
  clientReady.value = true

  const params = parseHashParams()
  if (params.error || params.error_code) {
    linkError.value = params.error_description
      ? decodeURIComponent(params.error_description.replace(/\+/g, ' '))
      : 'Посилання для скидання пароля недійсне або застаріло.'
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    return
  }
  if (params.access_token && params.refresh_token && params.type === 'recovery') {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token
    })
    if (sessionError) {
      pushToast({ message: 'Посилання недійсне або застаріле.', tone: 'danger' })
      router.replace('/')
      return
    }
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    pushToast({ message: 'Посилання для відновлення недійсне або вже використане.', tone: 'danger' })
    router.replace('/')
    return
  }
  ready.value = true
})

async function onSubmit() {
  error.value = ''
  invalid.password = false
  invalid.confirm = false

  const p = password.value
  const c = confirmPassword.value

  if (!p || p.length < 6) {
    invalid.password = true
    pushToast({ message: 'Пароль має бути не менше 6 символів.', tone: 'danger' })
    return
  }
  if (p !== c) {
    invalid.confirm = 'Паролі не збігаються.'
    pushToast({ message: 'Паролі не збігаються.', tone: 'danger' })
    return
  }

  loading.value = true
  try {
    const { error: updateError } = await supabase.auth.updateUser({ password: p })
    if (updateError) {
      error.value = updateError.message
      pushToast({ message: updateError.message || 'Не вдалося оновити пароль.', tone: 'danger' })
      loading.value = false
      return
    }
    await supabase.auth.signOut()
    await router.replace('/')
    openAuth('login')
    pushToast({
      message: 'Пароль оновлено. Увійдіть з новим паролем.',
      tone: 'success'
    })
  } catch (e) {
    pushToast({ message: 'Помилка при зміні пароля.', tone: 'danger' })
  } finally {
    loading.value = false
  }
}
</script>
