import type { ToastVariant } from "@/shared/components/Toast";

export type KitToastItem = {
  id: number;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration: number;
};

type Listener = (items: KitToastItem[]) => void;

let seq = 1;
let items: KitToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn: Listener) => fn(items));
}

function push(message: string, variant: ToastVariant, title?: string) {
  const id = seq++;
  const duration = 4000;
  const item: KitToastItem = { id, message, variant, title, duration };
  items = [...items, item];
  emit();
  window.setTimeout(() => {
    items = items.filter((t: KitToastItem) => t.id !== id);
    emit();
  }, duration);
}

export function subscribeKitToast(listener: Listener): () => void {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}

export function dismissKitToast(id: number) {
  items = items.filter((t: KitToastItem) => t.id !== id);
  emit();
}

export const kitToast = {
  success: (message: string, title?: string) => push(message, "success", title),
  error: (message: string, title?: string) => push(message, "danger", title),
  warning: (message: string, title?: string) => push(message, "warning", title),
  info: (message: string, title?: string) => push(message, "info", title),
};

export const toast = kitToast;
