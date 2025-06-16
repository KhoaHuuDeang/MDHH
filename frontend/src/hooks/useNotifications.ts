import { toast } from 'react-toastify'

export const useNotifications = () => {
  const success = (message: string) => toast.success(message)
  const error = (message: string) => toast.error(message)
  const info = (message: string) => toast.info(message)
  
  return { success, error, info }
}

export default useNotifications