<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    modelModifiers?: Record<string, boolean>
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    modelValue: '',
    modelModifiers: () => ({}),
    size: 'md'
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | number): void
}>()

const attrs = useAttrs()

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base'
}

const base =
  'w-full rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none'

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  if (props.modelModifiers?.trim) {
    value = value.trim()
  }
  if (props.modelModifiers?.number) {
    value = Number(value)
  }
  emit('update:modelValue', value)
}
</script>

<template>
  <input
    v-bind="attrs"
    :value="props.modelValue"
    :class="[base, sizeClasses[props.size], attrs.class]"
    @input="updateValue"
  />
</template>
