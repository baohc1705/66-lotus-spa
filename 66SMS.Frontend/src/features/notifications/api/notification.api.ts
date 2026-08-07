import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result } from "@/shared/types/common.types";
import type { NotificationDto } from "../types/notification.types";

export const notificationApi = {
  getMine: (params?: { domain?: string; take?: number }) =>
    axiosInstance
      .get<Result<NotificationDto[]>>(API.notifications.base, { params })
      .then((r) => r.data),

  markAllRead: () =>
    axiosInstance
      .post<Result<object>>(API.notifications.markAllRead)
      .then((r) => r.data),

  clearAll: () =>
    axiosInstance
      .delete<Result<object>>(API.notifications.base)
      .then((r) => r.data),
};
