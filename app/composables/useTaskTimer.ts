const STORAGE_KEY = 'tasklog-active-timer'

export interface RunningTimer {
  skillId: string
  startedAt: number
  title: string
}

export const useTaskTimer = () => {
  const runningTask = useState<RunningTimer | null>('task-timer-running', () => null)
  const now = useState<number>('task-timer-now', () => Date.now())

  const elapsedSeconds = computed(() => {
    const task = runningTask.value
    if (!task || typeof task.startedAt !== 'number' || !Number.isFinite(now.value)) return 0
    const sec = Math.floor((now.value - task.startedAt) / 1000)
    return Number.isFinite(sec) && sec >= 0 ? sec : 0
  })

  const elapsedFormatted = computed(() => {
    const s = elapsedSeconds.value
    if (!Number.isFinite(s) || s < 0) return '0:00'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  })

  const elapsedMinutes = computed(() => Math.floor(elapsedSeconds.value / 60))

  function persist() {
    if (process.client && runningTask.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(runningTask.value))
    } else if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function load() {
    if (!process.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as RunningTimer
      if (data?.skillId && data?.startedAt && data?.title) {
        runningTask.value = data
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function start(skillId: string, title: string) {
    const startedAt = Date.now()
    runningTask.value = { skillId, startedAt, title }
    now.value = startedAt
    persist()
  }

  /** Відновити таймер з того ж моменту (після скасування в модалці) */
  function resume(skillId: string, title: string, startedAt: number) {
    const validStartedAt = typeof startedAt === 'number' && Number.isFinite(startedAt) ? startedAt : Date.now()
    runningTask.value = { skillId, startedAt: validStartedAt, title }
    now.value = Date.now()
    persist()
  }

  function stop(): RunningTimer | null {
    const task = runningTask.value
    runningTask.value = null
    persist()
    return task
  }

  function isRunningFor(skillId: string) {
    return runningTask.value?.skillId === skillId
  }

  function isOtherRunning(skillId: string) {
    const task = runningTask.value
    return task !== null && task.skillId !== skillId
  }

  let intervalId: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    load()
    intervalId = setInterval(() => {
      if (runningTask.value) {
        now.value = Date.now()
      }
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return {
    runningTask,
    elapsedSeconds,
    elapsedFormatted,
    elapsedMinutes,
    start,
    resume,
    stop,
    isRunningFor,
    isOtherRunning,
    load
  }
}
