const LOCAL_USER_KEY = 'skillboard-user-id'

export const useLocalUserId = () => {
  const userId = useState<string>('local-user-id', () => 'anon')

  if (import.meta.client) {
    const existing = localStorage.getItem(LOCAL_USER_KEY)
    if (existing) {
      userId.value = existing
    } else if (userId.value === 'anon' || !userId.value) {
      const generated = `user_${crypto.randomUUID()}`
      localStorage.setItem(LOCAL_USER_KEY, generated)
      userId.value = generated
    }
  }

  return userId
}
