export type BookingNotificationPayload = {
  appointmentId: number;
  staffId?: number | null;
  status: number;
  customerName?: string | null;
  appointmentDate?: string | null;
};

export type NotificationMessage<TPayload = unknown> = {
  domain: string;
  eventType: string;
  title: string;
  message: string;
  salonId?: number | null;
  customerUserId?: number | null;
  staffUserId?: number | null;
  payload?: TPayload | null;
};

export type BookingNotificationMessage =
  NotificationMessage<BookingNotificationPayload>;

export type NotificationDto = {
  id: number;
  domain: string;
  eventType: string;
  title: string;
  message: string;
  salonId?: number | null;
  payloadJson?: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  eventType: string;
  domain: string;
  createdAt: string;
  isRead?: boolean;
  customerName?: string | null;
  appointmentId?: number | null;
};

export function parseBookingPayload(payloadJson?: string | null): {
  customerName?: string | null;
  appointmentId?: number | null;
} {
  if (!payloadJson) return {};
  try {
    const parsed = JSON.parse(payloadJson) as BookingNotificationPayload;
    return {
      customerName: parsed.customerName ?? null,
      appointmentId: parsed.appointmentId ?? null,
    };
  } catch {
    return {};
  }
}
