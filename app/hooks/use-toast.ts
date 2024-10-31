import * as React from "react"
import { toast as sonnerToast } from "sonner"

export function useToast() {
  const [toasts, setToasts] = React.useState<any[]>([])

  const toast = React.useCallback(({ title, description, ...props }: any) => {
    sonnerToast(title, {
      description,
      ...props,
    })
  }, [])

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      setToasts((toasts) => toasts.filter((toast) => toast.id !== toastId))
    },
  }
} 