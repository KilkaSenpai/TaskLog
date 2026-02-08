<script setup lang="ts">
type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: 'sm' | 'md'
  }>(),
  {
    variant: 'default',
    size: 'md'
  }
)

const variants: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-indigo-100 text-indigo-700'
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs'
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-semibold tracking-tight',
      variants[props.variant],
      sizes[props.size]
    ]"
  >
    <slot />
  </span>
</template>
