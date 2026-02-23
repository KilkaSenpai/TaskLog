export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return
  const { initAuth } = useAuth()
  await initAuth()
})
