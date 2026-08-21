import type { ToastVariant } from "@/shared/components/Toast";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
};

type Listener = (next: ToastItem[]) => void;

let seq = 1;
let items: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn: Listener) => fn(items));
}

function show(message: string, variant: ToastVariant, duration: number) {
  const id = seq++;
  items = [...items, { id, message, variant, duration }];
  emit();
  window.setTimeout(() => {
    items = items.filter((item: ToastItem) => item.id !== id);
    emit();
  }, duration);
}

export const showSuccess = (message: string) => {
  show(message, "success", 3000);
};

export const showError = (message: string) => {
  show(message, "danger", 4000);
};

export const showWarning = (message: string) => {
  show(message, "warning", 3500);
};

export const showInfo = (message: string) => {
  show(message, "info", 3000);
};

export const toast = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
};

export type KitToastItem = ToastItem;

export function subscribeKitToast(listener: Listener) {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}

export function dismissKitToast(id: number) {
  items = items.filter((item: ToastItem) => item.id !== id);
  emit();
}
