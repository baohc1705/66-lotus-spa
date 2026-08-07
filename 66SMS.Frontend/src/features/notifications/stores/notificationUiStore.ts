import { create } from "zustand";
import type {
  BookingNotificationPayload,
  NotificationMessage,
} from "../types/notification.types";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  eventType: string;
  domain: string;
  createdAt: string;
  customerName?: string | null;
  appointmentId?: number | null;
};

type NotificationUiState = {
  unreadCount: number;
  items: NotificationItem[];
  add: (msg: NotificationMessage) => void;
  clear: () => void;
  markAllRead: () => void;
};

let seq = 0;

export const useNotificationUiStore = create<NotificationUiState>((set) => ({
  unreadCount: 0,
  items: [],
  add: (msg) =>
    set((state) => {
      const payload = msg.payload as
        | BookingNotificationPayload
        | null
        | undefined;
      const item: NotificationItem = {
        id: `${Date.now()}-${seq++}`,
        title: msg.title || "Thông báo",
        message: msg.message,
        eventType: msg.eventType,
        domain: msg.domain,
        createdAt: new Date().toISOString(),
        customerName: payload?.customerName ?? null,
        appointmentId: payload?.appointmentId ?? null,
      };

      return {
        unreadCount: state.unreadCount + 1,
        items: [item, ...state.items].slice(0, 30),
      };
    }),
  clear: () => set({ unreadCount: 0, items: [] }),
  markAllRead: () => set({ unreadCount: 0 }),
}));
