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
    if (!task) return 0
    return Math.floor((now.value - task.startedAt) / 1000)
  })

  const elapsedFormatted = computed(() => {
    const s = elapsedSeconds.value
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
    runningTask.value = {
      skillId,
      startedAt: Date.now(),
      title
    }
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
    stop,
    isRunningFor,
    isOtherRunning,
    load
  }
}
