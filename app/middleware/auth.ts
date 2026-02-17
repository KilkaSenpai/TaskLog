// Захист маршрутів /skills/new та /skills/[id]: лише для авторизованих.
// На сервері не перевіряємо (уникаємо 500). На клієнті спочатку відновлюємо сесію (await initAuth), потім перевіряємо authUser.
export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return
  const { authUser, initAuth } = useAuth()
  await initAuth()
  if (!authUser.value) {
    return navigateTo('/')
  }
})
