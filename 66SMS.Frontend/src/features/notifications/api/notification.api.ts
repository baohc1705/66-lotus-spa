import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";
import type { NotificationDto } from "../types/notification.types";

export const notificationApi = {
  getMine: (params?: { domain?: string; take?: number }) =>
    axiosInstance
      .get<Result<NotificationDto[]>>("/notifications", { params })
      .then((r) => r.data),

  markAllRead: () =>
    axiosInstance
      .post<Result<object>>("/notifications/mark-all-read")
      .then((r) => r.data),

  clearAll: () =>
    axiosInstance
      .delete<Result<object>>("/notifications")
      .then((r) => r.data),
};
