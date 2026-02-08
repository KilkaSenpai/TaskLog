<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">Нова задача</h1>
        <p class="mt-1 text-sm text-slate-500">Створіть задачу або виклик.</p>
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
          <UiTextarea v-model="form.description" rows="4" />
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

const { createSkill } = useSkills()
const userId = useLocalUserId()
const router = useRouter()

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

const saving = ref(false)
const error = ref<string | null>(null)

const onSubmit = async () => {
  if (!form.title.trim()) return
  saving.value = true
  error.value = null
  try {
    const created = await createSkill({
      title: form.title.trim(),
      description: form.description.trim() || null,
      level: form.level,
      status: form.status,
      user_id: userId.value
    })
    await router.push(`/skills/${created.id}`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    saving.value = false
  }
}
</script>
