<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">TaskLog</h1>
        <p class="mt-1 text-sm text-slate-500">
          Створюйте задачі, логуйте прогрес і переглядайте тижневі підсумки.
        </p>
      </div>
      <NuxtLink
        to="/skills/new"
        class="inline-flex items-center gap-2 rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-600 color-white"
      >
        Створити задачу
      </NuxtLink>
    </div>

    <div v-if="isInitialLoading" class="mt-6 grid gap-4 md:grid-cols-3">
      <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-4">
        <div class="skeleton-line" style="width: 50%"></div>
        <div class="skeleton-line" style="width: 30%; height: 28px"></div>
      </div>
      <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-4">
        <div class="skeleton-line" style="width: 55%"></div>
        <div class="skeleton-line" style="width: 35%; height: 28px"></div>
      </div>
      <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-4">
        <div class="skeleton-line" style="width: 45%"></div>
        <div class="skeleton-line" style="width: 25%; height: 28px"></div>
      </div>
    </div>
    <WeeklySummary
      v-else
      :minutes="weeklyMinutes"
      :active-count="activeSkills"
      :total-count="skillsList.length"
    />

    <section class="mt-8">
      <div v-if="isInitialLoading" class="flex flex-wrap gap-3">
        <div class="skeleton-line h-10 flex-1"></div>
        <div class="skeleton-line h-10 w-[160px]"></div>
        <div class="skeleton-line h-10 w-[160px]"></div>
      </div>
      <FilterBar
        v-else
        :search="filters.search"
        :status="filters.status"
        :level="filters.level"
        :favorites-only="filters.favoritesOnly"
        @update:search="filters.search = $event"
        @update:status="filters.status = $event"
        @update:level="filters.level = $event"
        @update:favorites-only="filters.favoritesOnly = $event"
      />

      <div v-if="isInitialLoading" class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 6" :key="n" class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-4">
          <div class="skeleton-line" style="width: 55%"></div>
          <div class="skeleton-line" style="width: 85%"></div>
          <div class="skeleton-line" style="width: 70%"></div>
          <div class="mt-3 flex gap-2">
            <div class="skeleton-pill"></div>
            <div class="skeleton-pill"></div>
          </div>
        </div>
      </div>
      <div v-else-if="error" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Помилка: {{ error }}
      </div>
      <EmptyState
        v-else-if="skillsList.length === 0"
        class="mt-6"
        :title="filters.favoritesOnly ? 'Немає обраних задач' : 'Ще немає задач'"
        :description="filters.favoritesOnly ? 'Додайте задачі в обране за допомогою сердечка на картці, або вимкніть фільтр.' : 'Створіть першу задачу, щоб почати відстежувати прогрес.'"
      >
        <button
          v-if="filters.favoritesOnly"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50"
          @click="filters.favoritesOnly = false"
        >
          Показати всі
        </button>
        <NuxtLink
          v-else
          to="/skills/new"
          class="inline-flex items-center gap-2 rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-600 color-white"
        >
          Створити задачу
        </NuxtLink>
      </EmptyState>

      <div v-else class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkillCard
          v-for="skill in skillsList"
          :key="skill.id"
          :skill="skill"
          :is-favorite="favoriteIds.has(skill.id)"
          :log-count="logCountBySkill[skill.id] || 0"
          @toggle-favorite="onToggleFavorite(skill.id)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { SkillLevel, SkillStatus } from '@/types/skill'

const { skills, loading, error, fetchSkills, subscribeToSkills } = useSkills()
const { logs, loading: logsLoading, fetchLogs, subscribeToLogs } = useLogs()
const { favorites, fetchFavorites, toggleFavorite } = useFavorites()
const userId = useLocalUserId()

const filters = reactive<{
  status: SkillStatus | 'all'
  level: SkillLevel | 'all'
  search: string
  favoritesOnly: boolean
}>({
  status: 'all',
  level: 'all',
  search: '',
  favoritesOnly: false
})

const skillsReady = ref(false)
const logsReady = ref(false)
const hydrated = ref(false)

const skillsList = computed(() => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/pages/index.vue:75',message:'compute skillsList',data:{skillsType:typeof skills.value,skillsIsArray:Array.isArray(skills.value)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  const list = skills.value ?? []
  if (!filters.favoritesOnly) return list
  return list.filter((skill) => favoriteIds.value.has(skill.id))
})

const favoriteIds = computed(() => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/pages/index.vue:81',message:'compute favoriteIds',data:{favoritesType:typeof favorites.value,favoritesIsArray:Array.isArray(favorites.value)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  return new Set(favorites.value.map((item) => item.skill_id))
})

const logCountBySkill = computed(() => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/pages/index.vue:88',message:'compute logCountBySkill',data:{logsType:typeof logs.value,logsIsArray:Array.isArray(logs.value)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  return logs.value.reduce<Record<string, number>>((acc, log) => {
    acc[log.skill_id] = (acc[log.skill_id] || 0) + 1
    return acc
  }, {})
})

const activeSkills = computed(() => {
  return skillsList.value.filter((skill) => skill.status === 'active').length
})

const weeklyMinutes = computed(() => {
  if (!logsReady.value) return 0
  const from = new Date()
  from.setDate(from.getDate() - 7)
  return logs.value.reduce((sum, log) => {
    const createdAt = new Date(log.created_at)
    if (createdAt >= from) {
      return sum + (log.minutes || 0)
    }
    return sum
  }, 0)
})

const isInitialLoading = computed(() => {
  return (
    !hydrated.value ||
    !skillsReady.value ||
    !logsReady.value ||
    loading.value ||
    logsLoading.value
  )
})


const refreshAll = async () => {
  await fetchSkills(filters, userId.value)
  skillsReady.value = true
  await fetchLogs(undefined, skills.value.map((s) => s.id))
  logsReady.value = true
  if (process.client) {
    await fetchFavorites(userId.value)
  }
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/pages/index.vue:113',message:'after refreshAll',data:{skillsIsArray:Array.isArray(skills.value),logsIsArray:Array.isArray(logs.value),favoritesIsArray:Array.isArray(favorites.value),isClient:process.client},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
}

const onToggleFavorite = async (skillId: string) => {
  if (!process.client) return
  await toggleFavorite(skillId, userId.value)
}

watch(
  () => ({ ...filters }),
  async () => {
    await fetchSkills(filters, userId.value)
  }
)

let stopSkills: (() => void) | null = null
let stopLogs: (() => void) | null = null

onMounted(async () => {
  hydrated.value = true
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/pages/index.vue:130',message:'onMounted start',data:{isClient:process.client},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  await refreshAll()
  stopSkills = subscribeToSkills(() => fetchSkills(filters, userId.value))
  stopLogs = subscribeToLogs(async () => {
    await fetchLogs(undefined, skills.value.map((s) => s.id))
  })
})

onBeforeUnmount(() => {
  stopSkills?.()
  stopLogs?.()
})
</script>
