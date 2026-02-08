<template>
  <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
    <UiInput
      v-model="searchLocal"
      type="search"
      placeholder="Пошук за назвою або описом"
      class="min-w-[220px] flex-1"
      @update:model-value="emitChange"
    />
    <UiSelect
      v-model="statusLocal"
      class="w-[170px]"
      @update:model-value="emitChange"
    >
      <option value="all">Усі статуси</option>
      <option value="planned">Заплановано</option>
      <option value="active">Активна</option>
      <option value="paused">Призупинено</option>
      <option value="done">Виконано</option>
      <option value="archived">Архів</option>
    </UiSelect>
    <UiSelect
      v-model="levelLocal"
      class="w-[150px]"
      @update:model-value="emitChange"
    >
      <option value="all">Усі рівні</option>
      <option value="easy">Легко</option>
      <option value="medium">Середньо</option>
      <option value="hard">Важко</option>
    </UiSelect>
    <label class="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500/20">
      <input
        v-model="favoritesOnlyLocal"
        type="checkbox"
        class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        @change="emitChange"
      >
      <span>Тільки обрані</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { SkillLevel, SkillStatus } from '@/types/skill'

const props = defineProps<{
  search: string
  status: SkillStatus | 'all'
  level: SkillLevel | 'all'
  favoritesOnly?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:search', value: string): void
  (event: 'update:status', value: SkillStatus | 'all'): void
  (event: 'update:level', value: SkillLevel | 'all'): void
  (event: 'update:favoritesOnly', value: boolean): void
}>()

const searchLocal = ref(props.search)
const statusLocal = ref(props.status)
const levelLocal = ref(props.level)
const favoritesOnlyLocal = ref(props.favoritesOnly ?? false)

watch(
  () => props.search,
  (value) => {
    searchLocal.value = value
  }
)

watch(
  () => props.status,
  (value) => {
    statusLocal.value = value
  }
)

watch(
  () => props.level,
  (value) => {
    levelLocal.value = value
  }
)

watch(
  () => props.favoritesOnly,
  (value) => {
    favoritesOnlyLocal.value = value ?? false
  }
)

const emitChange = () => {
  emit('update:search', searchLocal.value)
  emit('update:status', statusLocal.value)
  emit('update:level', levelLocal.value)
  emit('update:favoritesOnly', favoritesOnlyLocal.value)
}
</script>
