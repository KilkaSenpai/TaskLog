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
          <button
            type="button"
            class="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 cursor-pointer"
            :aria-label="theme === 'dark' ? 'Переключити на світлу тему' : 'Переключити на темну тему'"
            @click="toggleTheme"
          >
            <Moon v-if="theme === 'dark'" class="h-4 w-4" />
            <Sun v-else class="h-4 w-4" />
          </button>
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
    <div
      v-if="runningTask"
      class="timer-bar sticky top-16 z-10 border-b border-slate-200 bg-indigo-50/90 py-2 backdrop-blur"
    >
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-indigo-900">Трекається:</span>
          <NuxtLink
            :to="`/skills/${runningTask.skillId}`"
            class="font-semibold text-indigo-700 underline hover:no-underline"
          >
            {{ runningTask.title }}
          </NuxtLink>
          <span class="font-mono text-sm tabular-nums text-indigo-600">{{ timerElapsedFormatted }}</span>
        </div>
        <UiButton variant="secondary" size="sm" @click="onStopTimerFromHeader">
          Зупинити таймер
        </UiButton>
      </div>
    </div>
    <main class="mx-auto w-full max-w-6xl px-6 py-8">
      <NuxtPage />
    </main>
    <ToastHost />
    <AuthModal />
  </div>
</template>

<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const route = useRoute()
const { authUser, initAuth, openAuth, logout } = useAuth()

const showAuthInHeader = computed(() => route.path !== '/reset-password')
const isLoggedIn = computed(() => showAuthInHeader.value && !!authUser.value)
const { skills, fetchSkills } = useSkills()
const { logs, fetchLogs, createLog } = useLogs()
const { pushToast } = useToasts()
const {
  runningTask,
  elapsedFormatted: timerElapsedFormatted,
  elapsedMinutes: timerElapsedMinutes,
  stop: stopTimer
} = useTaskTimer()

const onStopTimerFromHeader = async () => {
  const minutes = Math.max(1, timerElapsedMinutes.value)
  const task = stopTimer()
  if (!task) return
  try {
    await createLog({
      skill_id: task.skillId,
      minutes,
      note: null
    })
    pushToast({ message: `Додано ${minutes} хв у прогрес`, tone: 'success' })
  } catch {
    pushToast({ message: 'Таймер зупинено', tone: 'info' })
  }
}

type ThemeMode = 'light' | 'dark'
const theme = ref<ThemeMode>('light')

const applyTheme = (mode: ThemeMode) => {
  if (!process.client) return
  const root = document.documentElement
  root.setAttribute('data-theme', mode)
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  if (process.client) {
    localStorage.setItem('tasklog-theme', theme.value)
  }
  applyTheme(theme.value)
}

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
  if (process.client) {
    const stored = localStorage.getItem('tasklog-theme')
    if (stored === 'light' || stored === 'dark') {
      theme.value = stored
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark'
    }
    applyTheme(theme.value)
  }

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
