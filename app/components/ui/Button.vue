<script setup lang="ts">
defineOptions({ inheritAttrs: false })

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button'
  }
)

const attrs = useAttrs()

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 disabled:opacity-60 disabled:cursor-not-allowed'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-600 hover:to-indigo-500',
  secondary:
    'bg-white text-slate-900 border border-slate-300 shadow-sm hover:border-slate-400 hover:bg-slate-100',
  ghost:
    'bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100',
  danger:
    'bg-gradient-to-br from-rose-600 via-rose-600 to-rose-500 text-white shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-rose-400'
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  icon: 'p-0'
}
</script>

<template>
  <button
    v-bind="attrs"
    :type="props.type"
    :class="[base, variantClasses[props.variant], sizeClasses[props.size], attrs.class]"
  >
    <slot />
  </button>
</template>
