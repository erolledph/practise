import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastMessage } from "@/types"

interface ToastProps {
  toast: ToastMessage
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'toast-success'
      case 'error':
        return 'toast-error'
      case 'warning':
        return 'toast-warning'
      default:
        return 'toast-info'
    }
  }

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-smooth",
        getToastStyles(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={handleRemove}
            className="ml-4 inline-flex h-5 w-5 items-center justify-center rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-smooth"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}