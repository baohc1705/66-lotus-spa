import { useEffect, useState } from "react";
import {
  Toast,
  ToastStack,
  type ToastVariant,
} from "@/shared/components/Toast";
import {
  dismissKitToast,
  subscribeKitToast,
  type KitToastItem,
} from "@/shared/components/kitToast";

export function KitToaster() {
  const [items, setItems] = useState<KitToastItem[]>([]);

  useEffect(() => subscribeKitToast(setItems), []);

  if (items.length === 0) return null;

  return (
    <ToastStack position="top-right">
      {items.map((item: KitToastItem) => (
        <Toast
          key={item.id}
          title={item.title}
          message={item.message}
          variant={item.variant as ToastVariant}
          duration={item.duration}
          progress
          onClose={() => dismissKitToast(item.id)}
        />
      ))}
    </ToastStack>
  );
}
