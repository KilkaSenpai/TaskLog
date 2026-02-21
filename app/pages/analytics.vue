<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-100">Аналітика</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Час, витрачений на задачі — по днях, тижнях або місяцях.
        </p>
      </div>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        На головну
      </NuxtLink>
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="opt in periodOptions"
        :key="opt.value"
        type="button"
        class="rounded-full px-4 py-2 text-sm font-semibold transition"
        :class="period === opt.value
          ? 'bg-indigo-600 text-white shadow'
          : 'border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
        @click="period = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 p-8 text-center text-slate-500 dark:text-slate-400">
      Завантаження…
    </div>
    <div
      v-else-if="chartData.labels.length === 0"
      class="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 p-8 text-center text-slate-600 dark:text-slate-300"
    >
      Немає записів за обраний період.
    </div>
    <div v-else class="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 p-4 sm:p-6">
      <ClientOnly>
        <TimeChart :chart-data="chartData" :is-dark="isDark" />
        <template #fallback>
          <div class="h-[300px] flex items-center justify-center text-slate-500">Завантаження графіка…</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillLog } from '@/types/skill'

definePageMeta({ middleware: ['auth'] })

useSeoMeta({
  title: 'Аналітика — TaskLog',
  description: 'Час, витрачений на задачі — графіки по днях, тижнях та місяцях.'
})

const { authUser } = useAuth()
const { skills, fetchSkills } = useSkills()
const { fetchLogsForSkillIds } = useLogs()

type PeriodKey = 'days' | 'week' | 'month'
const periodOptions: { value: PeriodKey; label: string }[] = [
  { value: 'days', label: 'Дні' },
  { value: 'week', label: 'Тиждень' },
  { value: 'month', label: 'Місяць' }
]

const period = ref<PeriodKey>('days')
const analyticsLogs = ref<SkillLog[]>([])
const loading = ref(true)

const fromIso = computed(() => {
  const d = new Date()
  switch (period.value) {
    case 'days':
      d.setDate(d.getDate() - 7)
      break
    case 'week':
      d.setDate(d.getDate() - 35)
      break
    case 'month':
      d.setMonth(d.getMonth() - 6)
      break
    default:
      d.setDate(d.getDate() - 7)
  }
  return d.toISOString()
})

function getDayKey(date: Date): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getMonthKey(date: Date): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
}

function formatDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

function formatWeekLabel(mondayKey: string): string {
  const [y, m, d] = mondayKey.split('-').map(Number)
  const mon = new Date(y, m - 1, d)
  const sun = new Date(mon)
  sun.setDate(sun.getDate() + 6)
  return mon.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) + ' – ' + sun.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })
}

const chartData = computed(() => {
  const logs = analyticsLogs.value
  if (logs.length === 0) return { labels: [] as string[], datasets: [{ label: 'Хвилини', data: [] as number[] }] }

  const buckets: Record<string, number> = {}

  if (period.value === 'days') {
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      buckets[getDayKey(d)] = 0
    }
    for (const log of logs) {
      const key = getDayKey(new Date(log.created_at))
      if (key in buckets) buckets[key] += log.minutes || 0
    }
    const labels = Object.keys(buckets).sort()
    return {
      labels: labels.map(formatDayLabel),
      datasets: [{ label: 'Хвилини', data: labels.map((k) => buckets[k]) }]
    }
  }

  if (period.value === 'week') {
    const mondays: string[] = []
    const now = new Date()
    const currentMonday = getMondayOfWeek(now)
    for (let w = 0; w < 5; w++) {
      const m = new Date(currentMonday)
      m.setDate(m.getDate() - w * 7)
      mondays.push(getDayKey(m))
    }
    mondays.reverse()
    for (const k of mondays) buckets[k] = 0
    for (const log of logs) {
      const monday = getMondayOfWeek(new Date(log.created_at))
      const key = getDayKey(monday)
      if (key in buckets) buckets[key] += log.minutes || 0
    }
    return {
      labels: mondays.map(formatWeekLabel),
      datasets: [{ label: 'Хвилини', data: mondays.map((k) => buckets[k]) }]
    }
  }

  if (period.value === 'month') {
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(getMonthKey(d))
    }
    for (const k of months) buckets[k] = 0
    for (const log of logs) {
      const key = getMonthKey(new Date(log.created_at))
      if (key in buckets) buckets[key] += log.minutes || 0
    }
    return {
      labels: months.map(formatMonthLabel),
      datasets: [{ label: 'Хвилини', data: months.map((k) => buckets[k]) }]
    }
  }

  return { labels: [] as string[], datasets: [{ label: 'Хвилини', data: [] as number[] }] }
})

const isDark = computed(() => {
  if (process.server) return false
  return document.documentElement.getAttribute('data-theme') === 'dark'
})

async function loadAnalytics() {
  const userId = authUser.value?.id
  if (!userId) return
  loading.value = true
  try {
    await fetchSkills({}, userId)
    const skillIds = (skills.value ?? []).map((s) => s.id)
    const list = await fetchLogsForSkillIds(skillIds, { since: fromIso.value })
    analyticsLogs.value = list
  } finally {
    loading.value = false
  }
}

watch([period, fromIso], () => {
  loadAnalytics()
}, { immediate: false })

onMounted(() => {
  loadAnalytics()
})
</script>
