<template>
  <section class="grid gap-4 md:grid-cols-3">
    <UiCard class="p-4">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Хвилин за тиждень
      </div>
      <div class="mt-2 text-2xl font-semibold text-slate-900">
        {{ minutes }}
      </div>
    </UiCard>
    <UiCard class="p-4">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Активних задач
      </div>
      <div class="mt-2 text-2xl font-semibold text-slate-900">
        {{ activeCount }}
      </div>
    </UiCard>
    <UiCard class="p-4">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Всього задач
      </div>
      <div class="mt-2 text-2xl font-semibold text-slate-900">
        {{ totalCount }}
      </div>
    </UiCard>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  minutes: number
  activeCount: number
  totalCount: number
}>()
</script>
