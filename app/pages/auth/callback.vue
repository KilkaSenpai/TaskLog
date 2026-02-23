<template>
  <div class="flex min-h-[40vh] flex-col items-center justify-center px-4">
    <p class="text-sm text-slate-500">
      {{ statusText }}
    </p>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Вхід — TaskLog',
  description: 'Завершення входу через Google.'
})

const { initAuth, ensureProfileForOAuthUser, authUser } = useAuth()
const { pushToast } = useToasts()
const statusText = ref('Вхід…')

onMounted(async () => {
  if (!import.meta.client) return

  await initAuth()

  if (authUser.value) {
    statusText.value = 'Налаштування профілю…'
    await ensureProfileForOAuthUser()
    pushToast({ message: 'Вхід виконано.', tone: 'success' })
  }

  await navigateTo('/')
})
</script>
