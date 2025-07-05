import { create } from 'zustand';
import { toast, ToastOptions } from 'react-toastify';

interface NotificationState {
    notify: (message: string, type: 'success' | "error", options: ToastOptions) => void
}

const useNotificationStores = create<NotificationState>(() => ({
    notify: (message, type = 'success', options = {}) => {
        if (!message) return
        toast(message, { type, position: "top-right", autoClose: 3000, ...options })
    }
}))


export default useNotificationStores;

