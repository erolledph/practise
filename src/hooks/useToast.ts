import { useState, useCallback } from 'react'
import { ToastMessage } from '@/types'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((
    message: string, 
    type: ToastMessage['type'] = 'info', 
    duration: number = 4000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastMessage = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => 
    addToast(message, 'success', duration), [addToast])
  
  const error = useCallback((message: string, duration?: number) => 
    addToast(message, 'error', duration), [addToast])
  
  const warning = useCallback((message: string, duration?: number) => 
    addToast(message, 'warning', duration), [addToast])
  
  const info = useCallback((message: string, duration?: number) => 
    addToast(message, 'info', duration), [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}