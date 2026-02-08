<template>
  <UiBadge :variant="variant">{{ label }}</UiBadge>
</template>

<script setup lang="ts">
import type { SkillStatus } from '@/types/skill'

const props = defineProps<{
  status: SkillStatus
}>()

const label = computed(() => {
  if (props.status === 'planned') return 'Заплановано'
  if (props.status === 'active') return 'Активна'
  if (props.status === 'paused') return 'Призупинено'
  if (props.status === 'done') return 'Виконано'
  return 'Архів'
})

const variant = computed(() => {
  if (props.status === 'planned') return 'info'
  if (props.status === 'active') return 'success'
  if (props.status === 'paused') return 'warning'
  if (props.status === 'done') return 'success'
  return 'danger'
})
</script>
