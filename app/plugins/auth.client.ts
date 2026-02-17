export default defineNuxtPlugin(() => {
  if (!process.client) return
  const { initAuth } = useAuth()
  initAuth()
})
