import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from './utils'
import type { Toast, ToastVariant } from '@/types'

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />,
  error:   <XCircle    size={16} className="text-red-400 flex-shrink-0" />,
  warning: <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />,
  info:    <Info       size={16} className="text-sky-400 flex-shrink-0" />,
}

const borders: Record<ToastVariant, string> = {
  success: 'border-emerald-500/30',
  error:   'border-red-500/30',
  warning: 'border-amber-500/30',
  info:    'border-sky-500/30',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useAppStore((s) => s.removeToast)
  const duration = toast.duration ?? 4000

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), duration)
    return () => clearTimeout(timer)
  }, [toast.id, duration, removeToast])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-xl',
        'bg-surface-900/95 backdrop-blur-xl border shadow-float',
        'max-w-sm w-full',
        borders[toast.variant]
      )}
    >
      {icons[toast.variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-surface-400 mt-0.5 truncate">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-surface-500 hover:text-surface-300 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastRegion() {
  const toasts = useAppStore((s) => s.toasts)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
