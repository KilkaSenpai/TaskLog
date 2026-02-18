<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">
          {{ skill?.title || 'Задача' }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">Відстежуйте прогрес та оновлюйте деталі.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-100"
        >
          <ArrowLeft :size="16" />
          Назад
        </NuxtLink>
        <UiButton
          variant="ghost"
          data-fancybox
          data-src="#skill-tips"
          type="button"
        >
          <Info :size="16" />
          Підказки
        </UiButton>
        <UiButton
          variant="secondary"
          :aria-pressed="isFavorite"
          @click="onToggleFavorite"
        >
          <Heart v-if="isFavorite" :size="16" class="text-rose-500 fill-rose-500" />
          <Heart v-else :size="16" class="text-slate-500" />
          Обране
        </UiButton>
      </div>
    </div>

    <div
      v-if="loadingSkill"
      class="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600"
    >
      Завантаження...
    </div>
    <div
      v-else-if="skillError"
      class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      Помилка: {{ skillError }}
    </div>
    <div
      v-else-if="!skill"
      class="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600"
    >
      Задачу не знайдено.
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <UiCard class="p-6">
        <h2 class="text-lg font-semibold text-slate-900">Деталі</h2>
        <form class="mt-4 grid gap-4" @submit.prevent="onSave">
          <label class="grid gap-2 text-sm font-medium text-slate-700">
            Назва
            <UiInput v-model="form.title" />
          </label>
          <label class="grid gap-2 text-sm font-medium text-slate-700">
            Опис
            <UiTextarea v-model="form.description" rows="4" />
          </label>
          <p v-if="skill.estimate_minutes" class="text-sm text-slate-600">
            Оцінка часу: <strong>{{ skill.estimate_minutes }} хв</strong>
          </p>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 text-sm font-medium text-slate-700">
              Рівень складності
              <UiSelect v-model="form.level">
                <option value="easy">Легко</option>
                <option value="medium">Середньо</option>
                <option value="hard">Важко</option>
              </UiSelect>
            </label>
            <label class="grid gap-2 text-sm font-medium text-slate-700">
              Статус
              <UiSelect v-model="form.status">
                <option value="planned" disabled>Заплановано (за замовчуванням)</option>
                <option value="active">Активна</option>
                <option value="paused">Призупинено</option>
                <option value="done">Виконано</option>
                <option value="archived">Архів</option>
              </UiSelect>
            </label>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UiButton
              type="button"
              variant="secondary"
              :disabled="improveLoading"
              @click="onImproveWithAi"
            >
              {{ improveLoading ? 'Обробка...' : 'Покращити опис за допомогою AI' }}
            </UiButton>
          </div>
          <p v-if="improveError" class="text-sm text-rose-600">{{ improveError }}</p>
          <div class="flex flex-wrap gap-3">
            <UiButton type="submit" :disabled="saving">
              {{ saving ? 'Збереження...' : 'Зберегти зміни' }}
            </UiButton>
            <UiButton variant="danger" type="button" @click="onDelete">
              Видалити
            </UiButton>
          </div>
          <p v-if="saveError" class="text-sm text-rose-600">Помилка: {{ saveError }}</p>
        </form>
      </UiCard>

      <div class="grid gap-6">
        <UiCard v-if="skill.estimate_minutes && skill.estimate_minutes > 0" class="p-6">
          <h2 class="text-lg font-semibold text-slate-900">Прогрес</h2>
          <div class="mt-3">
            <div class="mb-1 flex justify-between text-sm text-slate-600">
              <span>{{ totalMinutes }} / {{ skill.estimate_minutes }} хв</span>
              <span>{{ progressPercent }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full skill-detail-progress-track">
              <div
                class="h-full rounded-full bg-indigo-500 transition-all"
                :style="{ width: `${Math.min(progressPercent, 100)}%` }"
              />
            </div>
          </div>
        </UiCard>
        <UiCard class="p-6">
          <h2 class="text-lg font-semibold text-slate-900">Таймер</h2>
          <p class="mt-1 text-sm text-slate-500">
            Запустіть таймер і зупиніть — час автоматично додасться в прогрес.
          </p>
          <div v-if="isOtherRunning(skill.id)" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Зараз трекається задача «{{ runningTask?.title }}».
            <NuxtLink :to="`/skills/${runningTask?.skillId}`" class="font-medium text-amber-900 underline hover:no-underline">
              Перейти до неї
            </NuxtLink>
            або
            <button type="button" class="font-medium text-amber-900 underline hover:no-underline" @click="onStopOtherTimer">
              зупинити таймер
            </button>
          </div>
          <template v-else-if="isRunningFor(skill.id)">
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <span class="text-2xl font-mono font-semibold tabular-nums text-indigo-600">{{ elapsedFormatted }}</span>
              <UiButton variant="danger" @click="onStopTimer">
                Зупинити
              </UiButton>
            </div>
            <div class="mt-3">
              <label class="block text-sm font-medium text-slate-700">Примітка (опційно)</label>
              <UiTextarea v-model="timerNote" rows="2" class="mt-1" placeholder="Що робили?" />
            </div>
          </template>
          <template v-else>
            <UiButton class="mt-4" @click="onStartTimer">
              <Timer :size="18" />
              Старт таймер
            </UiButton>
          </template>
        </UiCard>
        <UiCard class="p-6">
          <h2 class="text-lg font-semibold text-slate-900">Записати прогрес</h2>
          <form class="mt-4 grid gap-4" @submit.prevent="onLog">
            <label class="grid gap-2 text-sm font-medium text-slate-700">
              Хвилини
              <UiInput v-model.number="logForm.minutes" type="number" min="1" />
            </label>
            <label class="grid gap-2 text-sm font-medium text-slate-700">
              Примітка
              <UiTextarea v-model="logForm.note" rows="3" />
            </label>
            <UiButton type="submit" :disabled="logging">
              {{ logging ? 'Додавання...' : 'Додати запис' }}
            </UiButton>
            <p v-if="logError" class="text-sm text-rose-600">Помилка: {{ logError }}</p>
          </form>
        </UiCard>

        <UiCard class="p-6 anchor-target" id="logs">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-slate-900">Історія прогресу</h2>
            <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {{ skill.estimate_minutes ? `${totalMinutes} / ${skill.estimate_minutes} хв` : `Всього хвилин: ${totalMinutes}` }}
            </span>
          </div>
          <div
            v-if="logsLoading"
            class="mt-4 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600"
          >
            Завантаження записів...
          </div>
          <div
            v-else-if="logsError"
            class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            Помилка: {{ logsError }}
          </div>
          <EmptyState
            v-else-if="logs.length === 0"
            class="mt-4"
            title="Ще немає записів"
            description="Запишіть сесію, щоб побачити прогрес тут."
          />
          <div v-else class="mt-4 grid gap-3">
            <div
              v-for="log in logs"
              :key="log.id"
              class="rounded-xl border border-slate-200 bg-white/80 p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <strong class="text-sm text-slate-900">{{ log.minutes }} хв</strong>
                <UiButton variant="secondary" size="sm" @click="onDeleteLog(log.id)">
                  Видалити
                </UiButton>
              </div>
              <p class="mt-2 text-sm text-slate-500">{{ log.note || 'Без примітки' }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ formatDate(log.created_at) }}</p>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <div id="skill-tips" style="display: none">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
        <h3 class="text-lg font-semibold text-slate-900">Швидкі підказки</h3>
        <div class="mt-4 grid gap-3 text-sm text-slate-600">
          <p class="flex items-start gap-2">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">1</span>
            Записуйте короткі сесії одразу після практики.
          </p>
          <p class="flex items-start gap-2">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">2</span>
            Додавайте коротку примітку про те, що вивчили.
          </p>
          <p class="flex items-start gap-2">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">3</span>
            Позначайте виконано лише після хоча б одного запису.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Skill, SkillLevel, SkillStatus } from '@/types/skill'
import { ArrowLeft, Heart, Info, Timer } from 'lucide-vue-next'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const { authUser, openAuth } = useAuth()
const { fetchSkillById, updateSkill, deleteSkill } = useSkills()
const { improveTask, improveLoading, improveError } = useAiAssistant()
const { logs, fetchLogs, createLog, deleteLog, subscribeToLogs, loading, error } =
  useLogs()
const { favorites, fetchFavorites, toggleFavorite } = useFavorites()
const {
  runningTask,
  elapsedFormatted,
  elapsedMinutes,
  start: startTimer,
  stop: stopTimer,
  isRunningFor,
  isOtherRunning
} = useTaskTimer()

const timerNote = ref('')

const { pushToast } = useToasts()

const skill = ref<Skill | null>(null)
const loadingSkill = ref(true)
const skillError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const logging = ref(false)
const logError = ref<string | null>(null)

const form = reactive<{
  title: string
  description: string
  level: SkillLevel
  status: SkillStatus
}>({
  title: '',
  description: '',
  level: 'easy',
  status: 'planned'
})

const logForm = reactive({
  minutes: 30,
  note: ''
})

const logsLoading = loading
const logsError = error

const isFavorite = computed(() => {
  return favorites.value.some(
    (favorite) => favorite.skill_id === skill.value?.id
  )
})

const totalMinutes = computed(() => {
  return logs.value.reduce((sum, log) => sum + (log.minutes || 0), 0)
})

const progressPercent = computed(() => {
  const est = skill.value?.estimate_minutes
  if (!est || est <= 0) return 0
  return Math.round((totalMinutes.value / est) * 100)
})

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleString()
}

const resetForm = () => {
  if (!skill.value) return
  form.title = skill.value.title
  form.description = skill.value.description || ''
  form.level = skill.value.level
  form.status = skill.value.status
}

const onImproveWithAi = async () => {
  const result = await improveTask(form.title, form.description)
  if (result) {
    form.title = result.title
    form.description = result.description
  }
}

const loadSkill = async () => {
  const id = authUser.value?.id
  if (!id) {
    skillError.value = 'Увійдіть, щоб переглянути задачу.'
    loadingSkill.value = false
    return
  }
  loadingSkill.value = true
  skillError.value = null
  try {
    const data = await fetchSkillById(route.params.id as string, id)
    skill.value = data
    resetForm()
  } catch (err) {
    skillError.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loadingSkill.value = false
  }
}

const onSave = async () => {
  if (!skill.value) return
  const id = authUser.value?.id
  if (!id) {
    openAuth('login')
    return
  }
  if (form.status === 'done' && logs.value.length === 0) {
    pushToast({
      message: 'Додайте хоча б один запис перед позначенням як виконано.',
      tone: 'danger'
    })
    return
  }
  saving.value = true
  saveError.value = null
  try {
    const updated = await updateSkill(
      skill.value.id,
      {
        title: form.title.trim(),
        description: form.description.trim() || null,
        level: form.level,
        status: form.status
      },
      id
    )
    skill.value = updated
    pushToast({
      message: 'Успішно збережено!',
      tone: 'success'
    })
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    saving.value = false
  }
}

const onDelete = async () => {
  if (!skill.value) return
  const id = authUser.value?.id
  if (!id) {
    openAuth('login')
    return
  }
  const confirmed = confirm('Видалити цю задачу та всі записи?')
  if (!confirmed) return
  try {
    await deleteSkill(skill.value.id, id)
    await router.push('/')
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const onLog = async () => {
  if (!skill.value) return
  logging.value = true
  logError.value = null
  try {
    await createLog({
      skill_id: skill.value.id,
      minutes: Number(logForm.minutes),
      note: logForm.note.trim() || null
    })
    logForm.note = ''
  } catch (err) {
    logError.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    logging.value = false
  }
}

const onDeleteLog = async (logId: string) => {
  await deleteLog(logId)
}

const onToggleFavorite = async () => {
  if (!skill.value || !process.client) return
  const id = authUser.value?.id
  if (!id) {
    openAuth('login')
    return
  }
  await toggleFavorite(skill.value.id, id)
}

const onStartTimer = () => {
  if (!skill.value) return
  startTimer(skill.value.id, skill.value.title)
}

const onStopTimer = async () => {
  const minutes = Math.max(1, elapsedMinutes.value)
  const task = stopTimer()
  if (!task || !skill.value || task.skillId !== skill.value.id) return
  try {
    await createLog({
      skill_id: skill.value.id,
      minutes,
      note: timerNote.value.trim() || null
    })
    timerNote.value = ''
    pushToast({ message: `Додано ${minutes} хв у прогрес`, tone: 'success' })
  } catch (err) {
    pushToast({
      message: err instanceof Error ? err.message : 'Не вдалося зберегти запис',
      tone: 'danger'
    })
  }
}

const onStopOtherTimer = async () => {
  const task = stopTimer()
  if (!task) return
  pushToast({ message: 'Таймер зупинено', tone: 'info' })
}

let stopLogs: (() => void) | null = null

onMounted(async () => {
  await loadSkill()
  if (process.client && authUser.value?.id) {
    await fetchFavorites(authUser.value.id)
  }
  await fetchLogs(route.params.id as string)
  stopLogs = subscribeToLogs(() => fetchLogs(route.params.id as string))
  if (route.hash === '#logs') {
    await nextTick()
    document.getElementById('logs')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
})

onBeforeUnmount(() => {
  stopLogs?.()
})
</script>
