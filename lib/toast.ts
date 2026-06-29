export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
}

type Listener = (toasts: ToastItem[]) => void

class ToastManager {
  private toasts: ToastItem[] = []
  private listeners: Set<Listener> = new Set()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private notify() {
    this.listeners.forEach(l => l([...this.toasts]))
  }

  add(message: string, type: ToastType = 'info', duration = 4500): string {
    const id = Math.random().toString(36).slice(2, 9)
    this.toasts = [...this.toasts, { id, message, type, duration }]
    this.notify()
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration)
    }
    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  success(msg: string) { return this.add(msg, 'success') }
  error(msg: string)   { return this.add(msg, 'error')   }
  info(msg: string)    { return this.add(msg, 'info')     }
  warning(msg: string) { return this.add(msg, 'warning')  }
}

export const toast = new ToastManager()
