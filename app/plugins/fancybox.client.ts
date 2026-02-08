import { Fancybox } from '@fancyapps/ui'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  Fancybox.bind('[data-fancybox]', {
    dragToClose: false,
    placeFocusBack: false,
    theme: 'light',
    mainClass: 'fancybox-skill-theme'
  })
})
