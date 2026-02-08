<template>
  <div class="fixed right-6 top-6 z-40 flex w-[320px] flex-col gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg"
      :class="toneClass(toast.tone)"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p v-if="toast.title" class="text-sm font-semibold text-slate-900">
            {{ toast.title }}
          </p>
          <p class="mt-1 text-sm text-slate-500">{{ toast.message }}</p>
        </div>
        <UiButton
          variant="ghost"
          size="sm"
          class="h-8 w-8 rounded-full p-0 text-slate-500"
          @click="removeToast(toast.id)"
        >
          ✕
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToasts()

const toneClass = (tone: string) => {
  if (tone === 'success') return 'border-emerald-200 bg-emerald-50/70'
  if (tone === 'warning') return 'border-amber-200 bg-amber-50/70'
  if (tone === 'danger') return 'border-rose-200 bg-rose-50/70'
  return 'border-indigo-200 bg-indigo-50/70'
}
</script>
