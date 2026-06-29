'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { toast, type ToastItem } from '@/lib/toast'
import { cn } from '@/lib/utils'

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />,
  error:   <XCircle      className="w-4 h-4 shrink-0 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />,
  info:    <Info          className="w-4 h-4 shrink-0 text-blue-500" />,
}

const BAR_COLOR = {
  success: 'bg-emerald-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 w-full max-w-sm rounded-xl border border-border',
        'bg-card/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-4 py-3.5',
        'animate-[slideInRight_0.3s_ease_forwards]',
      )}
      role="alert"
    >
      {/* Progress bar */}
      {item.duration > 0 && (
        <span
          className={cn('absolute bottom-0 left-0 h-[2px] rounded-b-xl', BAR_COLOR[item.type])}
          style={{ animation: `shrink ${item.duration}ms linear forwards` }}
        />
      )}

      {ICONS[item.type]}

      <p className="flex-1 text-sm text-foreground leading-snug">{item.message}</p>

      <button
        onClick={onDismiss}
        className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => toast.subscribe(setToasts), [])

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} item={t} onDismiss={() => toast.remove(t.id)} />
        ))}
      </div>
    </>
  )
}
