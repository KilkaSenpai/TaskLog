<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <div
    v-bind="attrs"
    :class="[
      'rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition hover:shadow-lg',
      attrs.class
    ]"
  >
    <slot />
  </div>
</template>
