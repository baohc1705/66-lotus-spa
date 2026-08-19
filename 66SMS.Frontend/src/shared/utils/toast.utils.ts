import type { ToastVariant } from "@/shared/components/Toast";

export type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
};

type Listener = (items: ToastItem[]) => void;

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

export function showSuccess(message: string) {
  show(message, "success", 3000);
}

export function showError(message: string) {
  show(message, "danger", 4000);
}

export function showWarning(message: string) {
  show(message, "warning", 3500);
}

export function showInfo(message: string) {
  show(message, "info", 3000);
}

export function subscribeToast(listener: Listener) {
  listeners.add(listener);
  listener(items);
  return () => listeners.delete(listener);
}

export function dismissToast(id: number) {
  items = items.filter((item: ToastItem) => item.id !== id);
  emit();
}

export const toast = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
};
