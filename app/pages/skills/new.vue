<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">Нова задача</h1>
        <p class="mt-1 text-sm text-slate-500">Опишіть задачу вільним текстом — AI допоможе сформулювати назву та опис.</p>
      </div>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-100"
      >
        Назад
      </NuxtLink>
    </div>

    <UiCard class="mt-6 p-6">
      <form class="grid gap-4" @submit.prevent="onSubmit">
        <label class="grid gap-2 text-sm font-medium text-slate-700">
          Назва
          <UiInput v-model="form.title" required />
        </label>
        <label class="grid gap-2 text-sm font-medium text-slate-700">
          Опис
          <UiTextarea
            v-model="form.description"
            rows="4"
            placeholder="Наприклад: вивчити React hooks до п'ятниці, зробити сторінку логіну"
          />
        </label>
        <div class="flex flex-wrap items-center gap-2">
          <UiButton
            type="button"
            variant="secondary"
            :disabled="improveLoading"
            @click="onImproveWithAi"
          >
            {{ improveLoading ? 'Обробка...' : 'Сформулювати задачу за допомогою AI' }}
          </UiButton>
          <span
            class="relative inline-flex cursor-help text-slate-400 hover:text-slate-600 group"
            tabindex="0"
            role="img"
            aria-label="Підказка"
          >
            <Info :size="18" />
            <span
              class="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden w-64 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 group-hover:block group-focus-within:block"
              role="tooltip"
            >
              Крок 1: введіть у полі вище (або в назву) що хочете зробити.<br>
              Крок 2: натисніть кнопку — AI заповнить назву та опис.<br>
              Крок 3: підправте за потреби і натисніть «Створити задачу».
            </span>
          </span>
        </div>
        <p v-if="improveError" class="text-sm text-rose-600">{{ improveError }}</p>
        <p v-if="improveError && improveError.includes('GROQ_API_KEY')" class="mt-1 text-sm text-slate-600">
          Додайте ключ у файл <code class="rounded bg-slate-200 px-1 dark:bg-slate-700">.env</code> у корені проєкту: <code class="rounded bg-slate-200 px-1 dark:bg-slate-700">GROQ_API_KEY=ваш_ключ</code>, потім перезапустіть сервер (<code class="rounded bg-slate-200 px-1 dark:bg-slate-700">npm run dev</code>).
        </p>
        <label class="grid gap-2 text-sm font-medium text-slate-700">
          Оцінка часу
          <div class="flex items-center gap-2">
            <UiInput
              v-model.number="form.estimateValue"
              type="number"
              min="0"
              step="1"
              :placeholder="form.estimateUnit === 'hours' ? 'Наприклад 2' : 'Наприклад 120'"
              class="min-w-0 flex-1"
            />
            <UiSelect v-model="form.estimateUnit" class="!w-[150px] shrink-0">
              <option value="minutes">хв</option>
              <option value="hours">год</option>
            </UiSelect>
          </div>
        </label>
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
            <UiSelect
              v-model="form.status"
              disabled
              class="cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200"
            >
              <option value="planned">Заплановано (за замовчуванням)</option>
            </UiSelect>
          </label>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton type="submit" :disabled="saving">
            {{ saving ? 'Збереження...' : 'Створити задачу' }}
          </UiButton>
        </div>
        <p v-if="error" class="text-sm text-rose-600">Помилка: {{ error }}</p>
      </form>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import type { SkillLevel, SkillStatus } from '@/types/skill'
import { Info } from 'lucide-vue-next'

definePageMeta({ middleware: ['auth'] })

const { authUser, openAuth } = useAuth()
const { createSkill } = useSkills()
const { improveTask, improveLoading, improveError } = useAiAssistant()
const router = useRouter()

const onImproveWithAi = async () => {
  const result = await improveTask(form.title, form.description)
  if (result) {
    form.title = result.title
    form.description = result.description
  }
}

type EstimateUnit = 'minutes' | 'hours'

const form = reactive<{
  title: string
  description: string
  level: SkillLevel
  status: SkillStatus
  estimateValue: number | null
  estimateUnit: EstimateUnit
}>({
  title: '',
  description: '',
  level: 'easy',
  status: 'planned',
  estimateValue: null,
  estimateUnit: 'minutes'
})

const saving = ref(false)
const error = ref<string | null>(null)

const onSubmit = async () => {
  if (!form.title.trim()) return
  const id = authUser.value?.id
  if (!id) {
    openAuth('register')
    return
  }
  saving.value = true
  error.value = null
  try {
    const created = await createSkill({
      title: form.title.trim(),
      description: form.description.trim() || null,
      level: form.level,
      status: form.status,
      user_id: id,
      estimate_minutes: (() => {
        const v = form.estimateValue
        if (v == null || v <= 0) return null
        return form.estimateUnit === 'hours' ? Math.round(v * 60) : Math.round(v)
      })()
    })
    await router.push(`/skills/${created.id}`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    saving.value = false
  }
}
</script>
