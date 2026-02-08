type ToastTone = 'info' | 'warning' | 'danger' | 'success'

export type ToastItem = {
  id: string
  title?: string
  message: string
  tone: ToastTone
  timeout?: number
}

export const useToasts = () => {
  const toasts = useState<ToastItem[]>('toasts', () => [])

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const pushToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    const item: ToastItem = {
      id,
      timeout: 4000,
      ...toast
    }
    toasts.value = [...toasts.value, item]

    if (item.timeout && process.client) {
      window.setTimeout(() => removeToast(id), item.timeout)
    }
  }

  return {
    toasts,
    pushToast,
    removeToast
  }
}
