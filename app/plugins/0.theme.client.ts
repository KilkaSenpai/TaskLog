/**
 * Apply theme from localStorage before first paint so that after redirects
 * (e.g. email confirmation) the user sees their chosen theme immediately.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.client && typeof document !== 'undefined') {
    const stored = localStorage.getItem('tasklog-theme')
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored)
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }
})
