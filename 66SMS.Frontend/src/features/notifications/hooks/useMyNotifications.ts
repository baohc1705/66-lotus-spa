import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { notificationApi } from "../api/notification.api";
import { useNotificationUiStore } from "../stores/notificationUiStore";

export function useMyNotifications() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const setFromServer = useNotificationUiStore((s) => s.setFromServer);

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getMine({ take: 30 }),
    enabled: isAuthReady && !!accessToken,
  });

  useEffect(() => {
    if (query.data?.isSuccess && query.data.data) {
      setFromServer(query.data.data);
    }
  }, [query.data, setFromServer]);

  return query;
}
