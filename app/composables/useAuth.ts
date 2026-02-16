import type { AuthError, Session, User } from '@supabase/supabase-js'

type AuthMode = 'login' | 'register'

type RegisterPayload = {
  username: string
  email: string
  password: string
  display_name?: string | null
}

type LoginPayload = {
  identifier: string
  password: string
}

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/

export const useAuth = () => {
  const supabase = useSupabase()
  const { pushToast } = useToasts()

  const authSession = useState<Session | null>('auth-session', () => null)
  const authUser = useState<User | null>('auth-user', () => null)

  const isAuthModalOpen = useState<boolean>('auth-modal-open', () => false)
  const authMode = useState<AuthMode>('auth-mode', () => 'login')
  const isAuthLoading = useState<boolean>('auth-loading', () => false)

  const openAuth = (mode: AuthMode = 'login') => {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  const closeAuth = () => {
    isAuthModalOpen.value = false
  }

  const setMode = (mode: AuthMode) => {
    authMode.value = mode
  }

  const handleAuthError = (error: AuthError | null) => {
    if (!error) return

    const msg = error.message?.toLowerCase() ?? ''

    if (msg.includes('email') || msg.includes('already registered') || error.message?.includes('already been registered')) {
      pushToast({
        message: 'Email вже зареєстрований',
        tone: 'danger'
      })
      return
    }

    if (msg.includes('invalid login credentials')) {
      pushToast({
        message: 'Невірні дані для входу.',
        tone: 'danger'
      })
      return
    }

    pushToast({
      message: error.message || 'Сталася помилка під час авторизації.',
      tone: 'danger'
    })
  }

  const register = async ({ username, email, password, display_name }: RegisterPayload) => {
    isAuthLoading.value = true

    try {
      if (!USERNAME_REGEX.test(username)) {
        pushToast({
          message:
            'Логін може містити лише латинські символи, цифри та символ підкреслення (_).',
          tone: 'danger'
        })
        return
      }

      const emailValid = /\S+@\S+\.\S+/.test(email)
      if (!emailValid) {
        pushToast({
          message: 'Некоректний формат email.',
          tone: 'danger'
        })
        return
      }

      const { data: existingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .limit(1)

      if (profilesError) {
        pushToast({
          message: 'Не вдалося перевірити логін. Спробуйте ще раз.',
          tone: 'danger'
        })
        return
      }

      if (existingProfiles && existingProfiles.length > 0) {
        pushToast({
          message: 'Такий логін вже зайнято.',
          tone: 'danger'
        })
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error || !data.user) {
        handleAuthError(error)
        return
      }

      const { user, session } = data
      if (session) {
        authSession.value = session
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: user.id,
        username,
        email,
        display_name: display_name?.trim() || null
      })

      if (profileError) {
        pushToast({
          message: 'Користувача створено, але не вдалося зберегти профіль.',
          tone: 'warning'
        })
      }

      authUser.value = user

      pushToast({
        message: 'Реєстрація успішна! Перевірте email для підтвердження, якщо потрібно.',
        tone: 'success'
      })

      closeAuth()
    } catch (error) {
      pushToast({
        message: 'Сталася неочікувана помилка під час реєстрації.',
        tone: 'danger'
      })
    } finally {
      isAuthLoading.value = false
    }
  }

  const login = async ({ identifier, password }: LoginPayload) => {
    isAuthLoading.value = true

    try {
      const isEmail = identifier.includes('@')
      let emailToUse = identifier

      if (!isEmail) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, email')
          .eq('username', identifier)
          .maybeSingle()

        if (profileError) {
          pushToast({
            message: 'Не вдалося знайти обліковий запис. Спробуйте ще раз.',
            tone: 'danger'
          })
          return
        }

        if (!profile?.email) {
          pushToast({
            message: 'Обліковий запис не знайдено. Бажаєте зареєструватися?',
            tone: 'warning'
          })
          setMode('register')
          isAuthModalOpen.value = true
          return
        }

        emailToUse = profile.email
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password
      })

      if (error || !data.user) {
        if (
          error &&
          error.message.toLowerCase().includes('invalid login credentials')
        ) {
          pushToast({
            message: 'Невірний пароль. Перевірте дані або відновіть пароль через посилання нижче.',
            tone: 'danger'
          })
          return
        }

        handleAuthError(error)
        return
      }

      authUser.value = data.user
      authSession.value = data.session ?? null

      pushToast({
        message: 'Вхід виконано.',
        tone: 'success'
      })

      closeAuth()
    } catch (error) {
      pushToast({
        message: 'Сталася неочікувана помилка під час входу.',
        tone: 'danger'
      })
    } finally {
      isAuthLoading.value = false
    }
  }

  const logout = async () => {
    isAuthLoading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        handleAuthError(error)
        return
      }

      authUser.value = null
      authSession.value = null

      const skills = useState<unknown[]>('skills', () => [])
      const logs = useState<unknown[]>('skill-logs', () => [])
      skills.value = []
      logs.value = []

      pushToast({
        message: 'Ви вийшли з облікового запису.',
        tone: 'success'
      })
    } finally {
      isAuthLoading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    if (!email?.trim()) return
    let redirectTo: string | undefined
    if (typeof window !== 'undefined') {
      const config = useRuntimeConfig()
      const base = (config.app?.baseURL as string) || '/'
      const path = base === '/' ? '/reset-password' : `${base.replace(/\/$/, '')}/reset-password`
      redirectTo = `${window.location.origin}${path}`
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo
    })
    if (error) {
      pushToast({
        message: error.message || 'Не вдалося надіслати лист. Перевірте email.',
        tone: 'danger'
      })
      return
    }
    pushToast({
      message: 'Перевірте пошту — надіслано посилання для відновлення пароля.',
      tone: 'success'
    })
  }

  const initAuth = async () => {
    if (!process.client) return

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (!error && session) {
      authSession.value = session
      authUser.value = session.user
    }

    supabase.auth.onAuthStateChange((_event, sessionChange) => {
      authSession.value = sessionChange
      authUser.value = sessionChange?.user ?? null
    })
  }

  return {
    authSession,
    authUser,
    isAuthModalOpen,
    authMode,
    isAuthLoading,
    openAuth,
    closeAuth,
    setMode,
    register,
    login,
    logout,
    resetPassword,
    initAuth
  }
}

