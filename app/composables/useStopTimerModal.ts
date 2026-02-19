export type CapturedStopTask = {
  skillId: string
  title: string
  minutes: number
  startedAt: number
}

export const useStopTimerModal = () => {
  const isOpen = useState<boolean>('stop-timer-modal-open', () => false)
  const capturedTask = useState<CapturedStopTask | null>('stop-timer-captured', () => null)

  const { runningTask, elapsedMinutes, stop: stopTimer } = useTaskTimer()

  /** Stops timer, captures task + minutes, opens modal */
  const requestStop = () => {
    if (!runningTask.value) return
    const minutes = Math.max(1, elapsedMinutes.value)
    const task = stopTimer()
    if (!task) return
    capturedTask.value = { skillId: task.skillId, title: task.title, minutes, startedAt: task.startedAt }
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    capturedTask.value = null
  }

  return { isOpen, capturedTask, requestStop, close }
}
