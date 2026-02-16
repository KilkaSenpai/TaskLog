<template>
  <div class="space-y-1.5">
    <label class="block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :type="isVisible ? 'text' : 'password'"
        :value="modelValue"
        lang="uk"
        autocomplete="off"
        class="block w-full rounded-lg border px-3 py-2 pr-20 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors"
        :class="invalid ? 'border-1 border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'"
        @compositionstart="isComposing = true"
        @compositionend="onCompositionEnd"
        @input="onInput"
      />
      <div class="absolute inset-y-0 right-2 flex items-center gap-1">
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          :aria-label="isVisible ? 'Приховати пароль' : 'Показати пароль'"
          @click="isVisible = !isVisible"
        >
          <component :is="isVisible ? EyeOffIcon : EyeIcon" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          aria-label="Скопіювати пароль"
          @click="$emit('copy')"
        >
          <CopyIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye as EyeIcon, EyeOff as EyeOffIcon, Copy as CopyIcon } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  label: string
  invalid?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  copy: []
}>()

const isVisible = ref(false)
const isComposing = ref(false)

function onInput(e: Event) {
  if (isComposing.value) return
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target?.value ?? '')
}

function onCompositionEnd(e: Event) {
  isComposing.value = false
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target?.value ?? '')
}
</script>
