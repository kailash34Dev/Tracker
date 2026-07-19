import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  showToast: (message) => set({ visible: true, message }),
  hideToast: () => set({ visible: false }),
}));
