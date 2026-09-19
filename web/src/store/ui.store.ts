import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface UiState {
  toasts: Toast[];
  mobileMenuOpen: boolean;
  pushToast: (toast: Omit<Toast, 'id'>) => number;
  dismissToast: (id: number) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

let nextToastId = 1;
const TOAST_TTL_MS = 5000;

/** Ephemeral client-only UI state: toasts and the mobile menu. */
export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  mobileMenuOpen: false,
  pushToast: (toast) => {
    const id = nextToastId++;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, TOAST_TTL_MS);
    return id;
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useUiStore.getState().pushToast({ tone: 'success', title, description }),
  error: (title: string, description?: string) =>
    useUiStore.getState().pushToast({ tone: 'error', title, description }),
  info: (title: string, description?: string) =>
    useUiStore.getState().pushToast({ tone: 'info', title, description }),
};
