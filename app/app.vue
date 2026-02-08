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
        <nav class="flex items-center gap-2">
          <NuxtLink
            to="/"
            class="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            active-class="bg-indigo-100 text-indigo-700"
          >
            Задачі
          </NuxtLink>
          <NuxtLink
            to="/skills/new"
            class="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            active-class="bg-indigo-100 text-indigo-700"
          >
            Нова задача
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl px-6 py-8">
      <NuxtPage />
    </main>
    <ToastHost />
  </div>
</template>

<script setup lang="ts">
const { skills, fetchSkills } = useSkills()
const { logs, fetchLogs } = useLogs()
const { pushToast } = useToasts()
const router = useRouter()

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
  if ((skills.value ?? []).length === 0) {
    await fetchSkills()
  }
  if ((logs.value ?? []).length === 0) {
    await fetchLogs()
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      showLogReminder()
    }
  })
  document.addEventListener('mouseleave', onMouseLeave)
})
</script>
