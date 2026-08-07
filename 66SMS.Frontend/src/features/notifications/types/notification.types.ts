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
