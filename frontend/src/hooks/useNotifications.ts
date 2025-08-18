import { toast } from 'react-toastify'
import { useMemo } from 'react'

export const useNotifications = () => {
  return useMemo(() => ({
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message)
  }), [])
}

export default useNotifications