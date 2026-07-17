import { useToast } from '../context/ToastContext'

const typeStyles = {
  success: 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  error: 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
}

const typeIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg ${typeStyles[toast.type]} animate-fade-in`}
          role="alert"
        >
          <span className="font-bold text-lg leading-none">{typeIcons[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-60 hover:opacity-100 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
