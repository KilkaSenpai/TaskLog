// Protect /skills/new and /skills/[id]: auth only.
// No check on server (avoid 500). On client we restore session (await initAuth), then check authUser.
export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return
  const { authUser, initAuth } = useAuth()
  await initAuth()
  if (!authUser.value) {
    return navigateTo('/')
  }
})
