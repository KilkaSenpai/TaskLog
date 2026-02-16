<template>
  <div class="min-h-screen">
    <NuxtRouteAnnouncer />
    <header
      class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur"
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
            T
          </span>
          TaskLog
        </NuxtLink>
        <nav class="flex items-center gap-1 sm:gap-2">
          <template v-if="isLoggedIn">
            <button
              type="button"
              class="px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 cursor-pointer"
              @click="logout"
            >
              Вийти
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              class="px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 cursor-pointer"
              @click="openAuth('login')"
            >
              Увійти
            </button>
            <button
              type="button"
              class="ml-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 cursor-pointer"
              @click="openAuth('register')"
            >
              Реєстрація
            </button>
          </template>
        </nav>
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl px-6 py-8">
      <NuxtPage />
    </main>
    <ToastHost />
    <AuthModal />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { authUser, initAuth, openAuth, logout } = useAuth()

const showAuthInHeader = computed(() => route.path !== '/reset-password')
const isLoggedIn = computed(() => showAuthInHeader.value && !!authUser.value)
const { skills, fetchSkills } = useSkills()
const { logs, fetchLogs } = useLogs()
const { pushToast } = useToasts()

async function refreshDataForUser(userId: string) {
  await fetchSkills({}, userId)
  const skillIds = (skills.value ?? []).map((s) => s.id)
  await fetchLogs(undefined, skillIds)
}

watch(
  () => authUser.value?.id,
  (id) => {
    if (id && process.client) {
      refreshDataForUser(id)
    }
  },
  { immediate: false }
)

const hasActiveSkill = computed(() => {
  return (skills.value ?? []).some((skill) => skill.status === 'active')
})

const hasLogToday = computed(() => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return (logs.value ?? []).some((log) => new Date(log.created_at) >= start)
})

const showLogReminder = () => {
  if (hasActiveSkill.value && !hasLogToday.value) {
    pushToast({
      title: 'Час для логу',
      message: 'У вас є активні задачі, але сьогодні ще немає записів.',
      tone: 'warning'
    })
  }
}

const onMouseLeave = (event: MouseEvent) => {
  if (event.clientY <= 0) {
    showLogReminder()
  }
}

onMounted(async () => {
  await initAuth()
  const id = authUser.value?.id
  if (id) {
    if ((skills.value ?? []).length === 0) {
      await fetchSkills({}, id)
    }
    if ((logs.value ?? []).length === 0) {
      const skillIds = (skills.value ?? []).map((s) => s.id)
      await fetchLogs(undefined, skillIds)
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      showLogReminder()
    }
  })
  document.addEventListener('mouseleave', onMouseLeave)
})
</script>
