export type ImprovedTask = { title: string; description: string }

export const useAiAssistant = () => {
  const improveLoading = ref(false)
  const improveError = ref<string | null>(null)

  const improveTask = async (
    title: string,
    description: string
  ): Promise<ImprovedTask | null> => {
    improveLoading.value = true
    improveError.value = null
    try {
      const result = await $fetch<ImprovedTask>('/api/ai/improve', {
        method: 'POST',
        body: { title: title.trim(), description: description.trim() }
      })
      return result
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
          ? (err.data as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Помилка AI'
      improveError.value = message
      return null
    } finally {
      improveLoading.value = false
    }
  }

  return {
    improveLoading,
    improveError,
    improveTask
  }
}
