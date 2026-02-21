/**
 * Adds canonical URL (rel="canonical") for the current page.
 * Uses NUXT_PUBLIC_SITE_URL or request origin + baseURL + path.
 */
export default defineNuxtPlugin(() => {
  const route = useRoute()
  const config = useRuntimeConfig().public
  const app = useRuntimeConfig().app

  useHead(() => {
    const basePath = app.baseURL === '/' ? '' : app.baseURL.replace(/\/$/, '')
    const path = route.path.startsWith('/') ? route.path : `/${route.path}`
    const pathname = basePath + path

    let origin: string
    if (config.siteUrl && typeof config.siteUrl === 'string') {
      origin = config.siteUrl.replace(/\/$/, '')
    } else if (import.meta.server) {
      try {
        const requestURL = useRequestURL()
        origin = requestURL.origin
      } catch {
        origin = ''
      }
    } else if (import.meta.client && typeof window !== 'undefined') {
      origin = window.location.origin
    } else {
      origin = ''
    }

    const canonical = origin ? `${origin}${pathname}` : pathname

    return {
      link: [{ rel: 'canonical', href: canonical }]
    }
  })
})
