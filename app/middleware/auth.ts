// Protect /skills/new and /skills/[id]: auth only.
// On server: redirect to home so the page is never rendered with authUser=null (session is client-only).
// On client: restore session (await initAuth), then check authUser.
export default defineNuxtRouteMiddleware(async () => {
  if (process.server) {
    return navigateTo('/')
  }
  const { authUser, initAuth } = useAuth()
  await initAuth()
  if (!authUser.value) {
    return navigateTo('/')
  }
})
