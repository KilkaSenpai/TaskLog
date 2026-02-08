<template>
  <article
    class="flex min-h-full flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div class="flex items-center justify-between gap-3">
      <StatusBadge :status="skill.status" />
      <UiButton
        variant="secondary"
        size="icon"
        :aria-pressed="isFavorite"
        aria-label="Додати в обране"
        class="h-9 w-9 rounded-full"
        @click="$emit('toggle-favorite')"
      >
        <Heart v-if="isFavorite" :size="20" class="text-rose-500 fill-rose-500" />
        <Heart v-else :size="20" class="text-slate-500" />
      </UiButton>
    </div>
    <h3 class="mt-3 text-lg font-semibold text-slate-900">
      {{ skill.title }}
    </h3>
    <div class="mt-2 flex flex-wrap gap-2">
      <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
        Рівень складності: {{ levelLabel }}
      </span>
      <NuxtLink
        class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
        :to="`/skills/${skill.id}#logs`"
      >
        Записи: {{ logCount }}
      </NuxtLink>
    </div>
    <div class="mt-auto pt-3">
      <NuxtLink
        :to="`/skills/${skill.id}`"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      >
        Детальніше
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Skill } from '@/types/skill'
import { Heart } from 'lucide-vue-next'

const props = defineProps<{
  skill: Skill
  isFavorite: boolean
  logCount: number
}>()

defineEmits<{
  (event: 'toggle-favorite'): void
}>()

const levelLabel = computed(() => {
  const map: Record<string, string> = { easy: 'Легко', medium: 'Середньо', hard: 'Важко' }
  return map[props.skill.level] ?? props.skill.level
})
</script>
