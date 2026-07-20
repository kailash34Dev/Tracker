import { create } from 'zustand';

interface ToastState {
  id: number;
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  showToast: (message: string, type?: 'success' | 'error') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  id: 0,
  visible: false,
  message: '',
  type: 'success',
  showToast: (message, type = 'success') => set({ id: Date.now(), visible: true, message, type }),
  hideToast: () => set({ visible: false }),
}));
