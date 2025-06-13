import {create} from 'zustand';

interface LoadingState {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    clearLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set)=> ({
  isLoading : false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  clearLoading: () => set({ isLoading: false })
}));