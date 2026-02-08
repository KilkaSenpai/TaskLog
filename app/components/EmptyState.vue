<template>
  <div
    class="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center text-slate-600 shadow-sm"
  >
    <strong class="text-slate-900">{{ title }}</strong>
    <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
