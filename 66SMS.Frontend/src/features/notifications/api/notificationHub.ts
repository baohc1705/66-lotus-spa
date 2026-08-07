import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { NotificationMessage } from "../types/notification.types";

let connection: signalR.HubConnection | null = null;
let connectionEpoch = 0;

function getHubUrl(): string {
  const raw = String(import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7000/api/v1")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  return raw.replace(/\/api\/v1\/?$/i, "") + "/hubs/notifications";
}

type ConnectOptions = {
  onMessage: (msg: NotificationMessage) => void;
  onReconnected?: () => void;
};

export function connectNotificationHub(options: ConnectOptions): Promise<boolean> {
  const token = useAuthStore.getState().accessToken;
  if (!token) return Promise.resolve(false);

  const epoch = ++connectionEpoch;

  if (connection) {
    connection.stop().catch(() => {});
    connection = null;
  }

  const hub = new signalR.HubConnectionBuilder()
    .withUrl(getHubUrl(), {
      accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
    })
    .withAutomaticReconnect()
    .build();

  // Dang ky handler TRUOC start (docs Microsoft)
  hub.on("ReceiveNotification", options.onMessage);
  if (options.onReconnected) {
    hub.onreconnected(() => {
      if (epoch !== connectionEpoch) return;
      options.onReconnected?.();
    });
  }

  connection = hub;

  return hub
    .start()
    .then(() => {
      if (epoch !== connectionEpoch) return false;
      console.info("[SignalR] connected", getHubUrl());
      return true;
    })
    .catch((err: unknown) => {
      console.error("[SignalR] start failed", err);
      if (connection === hub) connection = null;
      return false;
    });
}

export function disconnectNotificationHub(): Promise<void> {
  connectionEpoch++;
  if (!connection) return Promise.resolve();

  const current = connection;
  connection = null;
  return current.stop().catch((err: unknown) => {
    console.error("[SignalR] stop failed", err);
  });
}

export function joinSalon(salonId: number): Promise<void> {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
    return Promise.resolve();
  }
  return connection.invoke("JoinSalon", salonId).then(() => {
    console.info("[SignalR] joined salon", salonId);
  }).catch((err: unknown) => {
    console.error("[SignalR] JoinSalon failed", err);
  });
}

export function leaveSalon(salonId: number): Promise<void> {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
    return Promise.resolve();
  }
  return connection.invoke("LeaveSalon", salonId).catch((err: unknown) => {
    console.error("[SignalR] LeaveSalon failed", err);
  });
}
