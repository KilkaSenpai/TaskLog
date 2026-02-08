const LOCAL_USER_KEY = 'skillboard-user-id'

export const useLocalUserId = () => {
  const userId = useState<string>('local-user-id', () => 'anon')

  if (process.client && userId.value === 'anon') {
    const existing = localStorage.getItem(LOCAL_USER_KEY)
    if (existing) {
      userId.value = existing
    } else {
      const generated = `user_${crypto.randomUUID()}`
      localStorage.setItem(LOCAL_USER_KEY, generated)
      userId.value = generated
    }
  }

  return userId
}
