import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  connectNotificationHub,
  disconnectNotificationHub,
  joinSalon,
  leaveSalon,
} from "../api/notificationHub";
import { useNotificationUiStore } from "../stores/notificationUiStore";
import type { BookingNotificationMessage, NotificationMessage } from "../types/notification.types";

function handleBookingNotification(msg: BookingNotificationMessage, queryClient: ReturnType<typeof useQueryClient>) {
  toast.info(msg.title || "Thông báo lịch hẹn", { description: msg.message });
  useNotificationUiStore.getState().add(msg);
  queryClient.invalidateQueries({ queryKey: ["cashier-daily"] });
  queryClient.invalidateQueries({ queryKey: ["cashier-weekly"] });
  queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
  queryClient.invalidateQueries({ queryKey: ["staff-schedule-daily"] });
  queryClient.invalidateQueries({ queryKey: ["staff-schedule-weekly"] });
}

function joinCurrentSalon(joinedSalonRef: { current: number | null }) {
  const salonId = useAuthStore.getState().getEffectiveSalonId();
  if (salonId == null) return;
  joinSalon(salonId).then(() => {
    joinedSalonRef.current = salonId;
  });
}

export function useNotifications() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const queryClient = useQueryClient();
  const joinedSalonRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthReady || !accessToken) {
      disconnectNotificationHub();
      joinedSalonRef.current = null;
      return;
    }

    let active = true;

    connectNotificationHub({
      onMessage: (msg: NotificationMessage) => {
        if (!active) return;
        if ((msg.domain || "").toLowerCase() !== "booking") return;
        handleBookingNotification(msg as BookingNotificationMessage, queryClient);
      },
      onReconnected: () => {
        if (!active) return;
        joinedSalonRef.current = null;
        joinCurrentSalon(joinedSalonRef);
      },
    }).then((ok) => {
      if (!ok || !active) return;
      joinCurrentSalon(joinedSalonRef);
    });

    return () => {
      active = false;
      disconnectNotificationHub();
      joinedSalonRef.current = null;
    };
  }, [isAuthReady, accessToken, queryClient]);

  useEffect(() => {
    if (!isAuthReady || !accessToken || salonId == null) return;

    const prev = joinedSalonRef.current;
    if (prev === salonId) return;

    if (prev != null) {
      leaveSalon(prev).then(() => joinSalon(salonId)).then(() => {
        joinedSalonRef.current = salonId;
      });
      return;
    }

    joinSalon(salonId).then(() => {
      joinedSalonRef.current = salonId;
    });
  }, [isAuthReady, accessToken, salonId]);
}
