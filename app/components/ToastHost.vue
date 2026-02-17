<template>
  <div class="fixed right-6 top-6 z-[100] flex w-[320px] flex-col gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item rounded-2xl border-2 bg-white/95 p-4 shadow-lg"
      :class="toneClass(toast.tone)"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <AlertCircle
            v-if="toast.tone === 'danger'"
            class="mt-0.5 h-6 w-6 shrink-0 text-rose-500"
          />
          <Check
            v-else-if="toast.tone === 'success'"
            class="mt-0.5 h-6 w-6 shrink-0 text-emerald-600"
          />
          <HelpCircle
            v-else
            class="mt-0.5 h-6 w-6 shrink-0 text-amber-600"
          />
          <div>
            <p
              v-if="toast.title"
              class="toast-title text-sm font-semibold text-slate-900"
            >
              {{ toast.title }}
            </p>
            <p class="toast-message mt-1 text-sm text-slate-500">
              {{ toast.message }}
            </p>
          </div>
        </div>
        <UiButton
          variant="ghost"
          size="sm"
          class="toast-close h-8 w-8 rounded-full p-0 text-slate-500"
          @click="removeToast(toast.id)"
        >
          ✕
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Check, HelpCircle } from 'lucide-vue-next'

const { toasts, removeToast } = useToasts()

const toneClass = (tone: string) => {
  if (tone === 'success') return 'border-emerald-500 bg-emerald-50/90'
  if (tone === 'danger') return 'border-rose-500 bg-rose-50/90'
  if (tone === 'warning' || tone === 'info') return 'border-amber-500 bg-amber-50/90'
  return 'border-amber-500 bg-amber-50/90'
}
</script>
