import { create } from "zustand";
import type {
  BookingNotificationPayload,
  NotificationDto,
  NotificationItem,
  NotificationMessage,
} from "../types/notification.types";
import { parseBookingPayload } from "../types/notification.types";

type NotificationUiState = {
  unreadCount: number;
  items: NotificationItem[];
  setFromServer: (dtos: NotificationDto[]) => void;
  add: (msg: NotificationMessage) => void;
  clear: () => void;
  markAllRead: () => void;
};

let seq = 0;

function mapDto(dto: NotificationDto): NotificationItem {
  const booking =
    dto.domain === "booking" ? parseBookingPayload(dto.payloadJson) : {};

  return {
    id: String(dto.id),
    title: dto.title || "Thông báo",
    message: dto.message,
    eventType: dto.eventType,
    domain: dto.domain,
    createdAt: dto.createdAt,
    isRead: dto.isRead,
    customerName: booking.customerName ?? null,
    appointmentId: booking.appointmentId ?? null,
  };
}

export type { NotificationItem };

export const useNotificationUiStore = create<NotificationUiState>((set) => ({
  unreadCount: 0,
  items: [],
  setFromServer: (dtos) =>
    set({
      items: dtos.map(mapDto),
      unreadCount: dtos.filter((d: NotificationDto) => !d.isRead).length,
    }),
  add: (msg) =>
    set((state) => {
      const payload = msg.payload as BookingNotificationPayload | null | undefined;
      const booking =
        msg.domain === "booking"
          ? {
              customerName: payload?.customerName ?? null,
              appointmentId: payload?.appointmentId ?? null,
            }
          : {};

      const item: NotificationItem = {
        id: `tmp-${Date.now()}-${seq++}`,
        title: msg.title || "Thông báo",
        message: msg.message,
        eventType: msg.eventType,
        domain: msg.domain,
        createdAt: new Date().toISOString(),
        isRead: false,
        customerName: booking.customerName ?? null,
        appointmentId: booking.appointmentId ?? null,
      };

      return {
        unreadCount: state.unreadCount + 1,
        items: [item, ...state.items].slice(0, 30),
      };
    }),
  clear: () => set({ unreadCount: 0, items: [] }),
  markAllRead: () =>
    set((state) => ({
      unreadCount: 0,
      items: state.items.map((item) => ({ ...item, isRead: true })),
    })),
}));
