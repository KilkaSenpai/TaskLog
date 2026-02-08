<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    modelValue: '',
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
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <select
    v-bind="attrs"
    :value="props.modelValue"
    :class="[base, sizeClasses[props.size], attrs.class]"
    @change="updateValue"
  >
    <slot />
  </select>
</template>
