<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="min-w-0 flex-1">
        <template v-if="loadingSkill">
          <div class="skeleton-line mb-2" style="width: 70%; max-width: 420px; height: 32px; border-radius: 6px"></div>
          <div class="skeleton-line" style="width: 40%; max-width: 240px; height: 14px; border-radius: 4px"></div>
        </template>
        <template v-else>
          <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {{ skill?.title || 'Задача' }}
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Відстежуйте прогрес та оновлюйте деталі.</p>
        </template>
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
      class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-600 dark:bg-slate-800/80">
        <div class="skeleton-line mb-4" style="width: 25%; height: 24px"></div>
        <div class="skeleton-line mb-6" style="width: 100%; height: 40px"></div>
        <div class="skeleton-line mb-6" style="width: 100%; height: 96px"></div>
        <div class="mb-4 flex gap-4">
          <div class="skeleton-line flex-1" style="height: 20px"></div>
          <div class="skeleton-line flex-1" style="height: 20px"></div>
        </div>
        <div class="mt-6 flex gap-3">
          <div class="skeleton-pill" style="width: 120px; height: 36px"></div>
          <div class="skeleton-pill" style="width: 100px; height: 36px"></div>
        </div>
      </div>
      <div class="grid gap-6">
        <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-600 dark:bg-slate-800/80">
          <div class="skeleton-line mb-3" style="width: 30%; height: 20px"></div>
          <div class="skeleton-line mt-4" style="width: 100%; height: 8px; border-radius: 9999px"></div>
        </div>
        <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-600 dark:bg-slate-800/80">
          <div class="skeleton-line mb-2" style="width: 40%; height: 20px"></div>
          <div class="skeleton-line mt-3" style="width: 80%; height: 14px"></div>
          <div class="skeleton-line mt-4" style="width: 100%; height: 40px"></div>
          <div class="skeleton-line mt-3" style="width: 60%; height: 36px"></div>
        </div>
        <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-600 dark:bg-slate-800/80">
          <div class="skeleton-line mb-2" style="width: 35%; height: 20px"></div>
          <div class="skeleton-line mt-3" style="width: 90%; height: 14px"></div>
          <div class="skeleton-line mt-4" style="width: 100%; height: 40px"></div>
          <div class="skeleton-line mt-3" style="width: 100%; height: 64px"></div>
          <div class="skeleton-line mt-3" style="width: 100px; height: 36px"></div>
        </div>
        <div class="skeleton-card rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-600 dark:bg-slate-800/80">
          <div class="skeleton-line mb-4" style="width: 45%; height: 20px"></div>
          <div class="skeleton-line" style="width: 100%; height: 56px"></div>
          <div class="skeleton-line mt-3" style="width: 100%; height: 56px"></div>
          <div class="skeleton-line mt-3" style="width: 100%; height: 56px"></div>
        </div>
      </div>
    </div>
    <div
      v-else-if="skillError"
      class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
    >
      Помилка: {{ skillError }}
    </div>
    <div
      v-else-if="!skill"
      class="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-400"
    >
      Задачу не знайдено.
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <UiCard class="p-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Деталі</h2>
        <form class="mt-4 grid gap-4" @submit.prevent="onSave">
          <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Назва
            <UiInput v-model="form.title" />
          </label>
          <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Опис
            <UiTextarea v-model="form.description" rows="4" />
          </label>
          <p v-if="skill.estimate_minutes" class="text-sm text-slate-600 dark:text-slate-400">
            Оцінка часу: <strong>{{ formatEstimateMinutes(skill.estimate_minutes) }}</strong>
          </p>
          <div class="grid items-center gap-4 md:grid-cols-2">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Рівень складності: <span class="font-normal text-slate-600 dark:text-slate-400">{{ levelLabel }}</span>
            </p>
            <label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 md:text-right md:justify-end">
              <span>Статус</span>
              <UiSelect v-model="form.status" class="w-full min-w-[160px] md:w-[180px]">
                <option value="planned">Заплановано</option>
                <option value="active" :disabled="isBlockedByIncomplete">Активна (в роботі)</option>
                <option value="paused" :disabled="isBlockedByIncomplete">Призупинено</option>
                <option value="done"   :disabled="isBlockedByIncomplete">Виконано</option>
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
          <p v-if="saveError" class="text-sm text-rose-600 dark:text-rose-400">Помилка: {{ saveError }}</p>
        </form>
      </UiCard>

      <div class="grid gap-6">
        <UiCard v-if="skill.estimate_minutes && skill.estimate_minutes > 0" class="p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Прогрес</h2>
          <div class="mt-3">
            <div class="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>{{ formatEstimateMinutes(totalMinutes) }} / {{ formatEstimateMinutes(skill.estimate_minutes) }}</span>
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
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Пов’язані задачі</h2>
          <div v-if="linksLoading" class="mt-3 text-sm text-slate-500 dark:text-slate-400">Завантаження...</div>
          <EmptyState
            v-else-if="links.length === 0 && !showAddLink"
            class="mt-3"
            title="Немає зв’язків"
            description="Додайте зв’язок з іншою задачею."
          />
          <ul v-else-if="links.length > 0" class="mt-3 grid gap-2">
            <li
              v-for="link in links"
              :key="link.id"
              class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-700/50"
            >
              <NuxtLink
                :to="`/skills/${linkOtherSkillId(link)}`"
                class="font-medium text-slate-800 hover:text-indigo-600 hover:underline dark:text-slate-200 dark:hover:text-indigo-400"
              >
                {{ linkLabel(link) }}: {{ skillTitleById(linkOtherSkillId(link)) }}
              </NuxtLink>
              <UiButton variant="secondary" size="sm" @click="onDeleteLink(link.id)">
                Видалити
              </UiButton>
            </li>
          </ul>
          <div v-if="showAddLink && skill.status !== 'done' && skill.status !== 'archived'" class="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-700/50">
            <p class="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Додати зв’язок</p>
            <form class="grid gap-3" @submit.prevent="onAddLink">
              <label class="grid gap-1 text-sm text-slate-600 dark:text-slate-400">
                Задача
                <UiSelect v-model="addLinkForm.to_skill_id" required>
                  <option value="">— оберіть —</option>
                  <option
                    v-for="s in otherSkillsForLink"
                    :key="s.id"
                    :value="s.id"
                  >
                    {{ s.title }}
                  </option>
                </UiSelect>
              </label>
              <label class="grid gap-1 text-sm text-slate-600 dark:text-slate-400">
                Тип зв’язку
                <UiSelect v-model="addLinkForm.link_type" required>
                  <option value="blocks">Блокує (ця → обрана)</option>
                  <option value="blocked_by">Заблокована (обрана → ця)</option>
                  <option value="relates_to">Пов’язана з</option>
                  <option value="duplicates">Дублікат (ця → обрана)</option>
                  <option value="duplicated_by">Дубльована (обрана → ця)</option>
                </UiSelect>
              </label>
              <div class="flex gap-2">
                <UiButton type="submit" :disabled="addingLink">Додати</UiButton>
                <UiButton type="button" variant="secondary" @click="showAddLink = false">Скасувати</UiButton>
              </div>
              <p v-if="addLinkError" class="text-sm text-rose-600 dark:text-rose-400">{{ addLinkError }}</p>
            </form>
          </div>
          <UiButton
            v-else-if="skill.status !== 'done' && skill.status !== 'archived'"
            variant="secondary"
            class="mt-3"
            @click="showAddLink = true"
          >
            Додати зв’язок
          </UiButton>
        </UiCard>
        <template v-if="skill.status !== 'done' && skill.status !== 'archived'">
          <UiCard class="p-6">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Таймер</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Запустіть таймер і зупиніть — час автоматично додасться в прогрес.
            </p>
            <div v-if="isOtherRunning(skill.id)" class="other-timer-notice mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              Зараз трекається задача «{{ runningTask?.title }}».
              <NuxtLink :to="`/skills/${runningTask?.skillId}`" class="font-medium text-amber-900 underline hover:no-underline dark:text-amber-100">
                Перейти до неї
              </NuxtLink>
              або
              <button type="button" class="font-medium text-amber-900 underline hover:no-underline dark:text-amber-100" @click="onStopOtherTimer">
                зупинити таймер
              </button>
            </div>
            <template v-else-if="isRunningFor(skill.id)">
              <div class="mt-4 flex flex-wrap items-center gap-3">
                <span class="text-2xl font-mono font-semibold tabular-nums text-indigo-600">{{ elapsedFormatted }}</span>
                <UiButton variant="danger" @click="requestStopTimer">
                  Зупинити
                </UiButton>
              </div>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Натисніть «Зупинити» — зʼявиться вікно, де потрібно описати, що робили (мін. 4 символи).
              </p>
            </template>
            <template v-else-if="!isTaskInWorkForTimer">
              <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Переведіть задачу в «Активна», щоб запустити таймер.
              </p>
            </template>
            <template v-else>
              <UiButton class="mt-4" @click="onStartTimer">
                <Timer :size="18" />
                Старт таймер
              </UiButton>
            </template>
          </UiCard>
          <UiCard class="p-6">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Записати прогрес</h2>
            <form class="mt-4 grid gap-4" @submit.prevent="onLog">
              <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Хвилини
                <UiInput v-model.number="logForm.minutes" type="number" min="1" />
              </label>
              <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Примітка
                <UiTextarea v-model="logForm.note" rows="3" />
              </label>
              <UiButton type="submit" :disabled="logging">
                {{ logging ? 'Додавання...' : 'Додати запис' }}
              </UiButton>
              <p v-if="logError" class="text-sm text-rose-600 dark:text-rose-400">Помилка: {{ logError }}</p>
            </form>
          </UiCard>
        </template>

        <UiCard class="p-6 anchor-target" id="logs">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Історія прогресу</h2>
            <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              {{ skill.estimate_minutes ? `${formatEstimateMinutes(totalMinutes)} / ${formatEstimateMinutes(skill.estimate_minutes)}` : `Всього: ${formatEstimateMinutes(totalMinutes)}` }}
            </span>
          </div>
          <div
            v-if="logsLoading"
            class="mt-4 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-400"
          >
            Завантаження записів...
          </div>
          <div
            v-else-if="logsError"
            class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
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
              class="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-600 dark:bg-slate-700/50"
            >
              <div class="flex items-center justify-between gap-3">
                <strong class="text-sm text-slate-900 dark:text-slate-100">{{ log.minutes }} хв</strong>
                <UiButton variant="secondary" size="sm" @click="onDeleteLog(log.id)">
                  Видалити
                </UiButton>
              </div>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ log.note || 'Без примітки' }}</p>
              <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">{{ formatDate(log.created_at) }}</p>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <div id="skill-tips" style="display: none">
      <div class="skill-tips-inner rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 dark:border-slate-600 dark:bg-slate-800 dark:shadow-slate-900/50">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Швидкі підказки</h3>
        <div class="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-400">
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
import type { Skill, SkillLink, SkillLinkType, SkillStatus } from '@/types/skill'
import { formatEstimateMinutes } from '@/composables/useFormatEstimate'
import { ArrowLeft, Heart, Info, Timer } from 'lucide-vue-next'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const { authUser, openAuth } = useAuth()
const { skills, fetchSkills, fetchSkillById, updateSkill, deleteSkill, subscribeToSkills } = useSkills()
const { getOutwardLabel, getInwardLabel, fetchLinksBySkillId, createLink, deleteLink } = useSkillLinks()
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
const { requestStop: requestStopTimer } = useStopTimerModal()

const { pushToast } = useToasts()

const skill = ref<Skill | null>(null)
const links = ref<SkillLink[]>([])
const linksLoading = ref(false)
const loadingSkill = ref(true)
const skillError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const logging = ref(false)
const logError = ref<string | null>(null)
const showAddLink = ref(false)
const addingLink = ref(false)
const addLinkError = ref<string | null>(null)

const addLinkForm = reactive<{ to_skill_id: string; link_type: string }>({
  to_skill_id: '',
  link_type: 'blocks'
})

const otherSkillsForLink = computed(() => {
  const list = skills.value ?? []
  const currentId = skill.value?.id
  if (!currentId) return []
  return list.filter((s) => s.id !== currentId)
})

function linkOtherSkillId(link: SkillLink): string {
  const currentId = skill.value?.id
  if (!currentId) return ''
  return link.from_skill_id === currentId ? link.to_skill_id : link.from_skill_id
}

function linkLabel(link: SkillLink): string {
  const currentId = skill.value?.id
  if (!currentId) return ''
  return link.from_skill_id === currentId
    ? getOutwardLabel(link.link_type)
    : getInwardLabel(link.link_type)
}

function skillTitleById(id: string): string {
  const s = (skills.value ?? []).find((x) => x.id === id)
  return s?.title ?? id
}

const form = reactive<{
  title: string
  description: string
  status: SkillStatus
}>({
  title: '',
  description: '',
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

const levelLabel = computed(() => {
  const map: Record<string, string> = { easy: 'Легко', medium: 'Середньо', hard: 'Важко' }
  return skill.value ? (map[skill.value.level] ?? skill.value.level) : ''
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    planned: 'Заплановано',
    active: 'Активна',
    paused: 'Призупинено',
    done: 'Виконано',
    archived: 'Архів'
  }
  return skill.value ? (map[skill.value.status] ?? skill.value.status) : ''
})

/** Зв'язки "blocks", де поточна задача — to_skill_id (її хтось блокує) */
const blockingLinks = computed(() => {
  const currentId = skill.value?.id
  if (!currentId) return []
  return links.value.filter(
    (l) => l.to_skill_id === currentId && l.link_type === 'blocks'
  )
})

/** ID задач, які блокують поточну */
const blockerSkillIds = computed(() =>
  blockingLinks.value.map((l) => l.from_skill_id)
)

/** Блокуючі задачі, які ще не виконані й не в архіві (для повідомлень) */
const incompleteBlockers = computed(() => {
  const list = skills.value ?? []
  return blockerSkillIds.value
    .map((id) => list.find((s) => s.id === id))
    .filter((s): s is Skill => !!s && s.status !== 'done' && s.status !== 'archived')
})

/** Задачу не можна взяти в роботу: є блокери не в статусі Виконано/Архів (або статус блокера невідомий) */
const isBlockedByIncomplete = computed(() => {
  if (blockingLinks.value.length === 0) return false
  const list = skills.value ?? []
  return blockerSkillIds.value.some((id) => {
    const s = list.find((sk) => sk.id === id)
    return !s || (s.status !== 'done' && s.status !== 'archived')
  })
})

/** Таймер заблоковано лише якщо задача ще не в роботі; для active/paused таймер доступний */
const isTimerBlockedByBlocker = computed(
  () =>
    isBlockedByIncomplete.value &&
    skill.value?.status !== 'active' &&
    skill.value?.status !== 'paused'
)

/** Таймер доступний лише для статусу «Активна» */
const isTaskInWorkForTimer = computed(() => skill.value?.status === 'active')

const resetForm = () => {
  if (!skill.value) return
  form.title = skill.value.title
  form.description = skill.value.description || ''
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
    const [data, allSkills] = await Promise.all([
      fetchSkillById(route.params.id as string, id),
      (skills.value ?? []).length > 0 ? Promise.resolve(null) : fetchSkills({}, id).then(() => null)
    ])
    skill.value = data
    resetForm()
    linksLoading.value = true
    links.value = await fetchLinksBySkillId(data.id)
  } catch (err) {
    skillError.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loadingSkill.value = false
    linksLoading.value = false
  }
}

const loadLinks = async () => {
  if (!skill.value?.id) return
  linksLoading.value = true
  try {
    links.value = await fetchLinksBySkillId(skill.value.id)
  } finally {
    linksLoading.value = false
  }
}

const onAddLink = async () => {
  if (!skill.value || !addLinkForm.to_skill_id) return
  const id = authUser.value?.id
  if (!id) return
  addingLink.value = true
  addLinkError.value = null
  try {
    let fromId: string
    let toId: string
    let linkType: SkillLinkType
    const currentId = skill.value.id
    const selectedId = addLinkForm.to_skill_id
    const rawType = addLinkForm.link_type
    if (rawType === 'blocked_by') {
      fromId = selectedId
      toId = currentId
      linkType = 'blocks'
    } else if (rawType === 'duplicated_by') {
      fromId = selectedId
      toId = currentId
      linkType = 'duplicates'
    } else {
      fromId = currentId
      toId = selectedId
      linkType = rawType as SkillLinkType
    }
    await createLink({ from_skill_id: fromId, to_skill_id: toId, link_type: linkType })
    addLinkForm.to_skill_id = ''
    addLinkForm.link_type = 'blocks'
    showAddLink.value = false
    await loadLinks()
    if ((skills.value ?? []).length === 0) await fetchSkills({}, id)
    pushToast({ message: 'Зв’язок додано', tone: 'success' })
  } catch (err) {
    addLinkError.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    addingLink.value = false
  }
}

const onDeleteLink = async (linkId: string) => {
  try {
    await deleteLink(linkId)
    await loadLinks()
    pushToast({ message: 'Зв’язок видалено', tone: 'info' })
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const onSave = async () => {
  if (!skill.value) return
  const id = authUser.value?.id
  if (!id) {
    openAuth('login')
    return
  }
  if (
    (form.status === 'active' || form.status === 'paused') &&
    isBlockedByIncomplete.value
  ) {
    saveError.value =
      'Задачу не можна взяти в роботу: її блокують незавершені задачі. Переведіть блокуючі в «Виконано» або «Архів».'
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
        level: skill.value.level,
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
  if (isTimerBlockedByBlocker.value) {
    pushToast({
      message:
        'Задачу не можна взяти в роботу: її блокують незавершені задачі (Виконано або Архів).',
      tone: 'error'
    })
    return
  }
  startTimer(skill.value.id, skill.value.title)
}

const onStopOtherTimer = () => {
  requestStopTimer()
}

let stopLogs: (() => void) | null = null
let stopSkills: (() => void) | null = null

onMounted(async () => {
  await loadSkill()
  if (process.client && authUser.value?.id) {
    await fetchFavorites(authUser.value.id)
  }
  await fetchLogs(route.params.id as string)
  stopLogs = subscribeToLogs(() => fetchLogs(route.params.id as string))
  stopSkills = subscribeToSkills(() => loadSkill())
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
  stopSkills?.()
})
</script>
