import { useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import type { Result } from "@/shared/types/common.types";
import { notificationApi } from "../api/notification.api";
import { useMyNotifications } from "../hooks/useMyNotifications";
import { useNotificationUiStore } from "../stores/notificationUiStore";
import { eventBadgeClass, eventLabel } from "../utils/notificationEvent";

export function MyNotificationsPanel() {
  const { isLoading, isError, refetch } = useMyNotifications();
  const items = useNotificationUiStore((s) => s.items);
  const unreadCount = useNotificationUiStore((s) => s.unreadCount);
  const markAllReadLocal = useNotificationUiStore((s) => s.markAllRead);
  const clearLocal = useNotificationUiStore((s) => s.clear);

  useEffect(() => {
    if (unreadCount <= 0) return;

    markAllReadLocal();
    notificationApi.markAllRead().catch((error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? "Không đánh dấu đã đọc được";
      toast.error(msg);
    });
  }, [unreadCount, markAllReadLocal]);

  const handleClear = () => {
    notificationApi
      .clearAll()
      .then(() => {
        clearLocal();
      })
      .catch((error: AxiosError<Result<unknown>>) => {
        const msg = error.response?.data?.message ?? "Không xóa thông báo được";
        toast.error(msg);
      });
  };

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-lotus-rose" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-error-text font-medium mb-3">Không thể tải thông báo</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-lotus-rose font-semibold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-lotus-rose" />
          <h2 className="text-lg font-semibold text-lotus-deep">Thông báo</h2>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-lotus-stone hover:text-lotus-rose transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-lotus-stone text-sm">
          Chưa có thông báo nào
        </div>
      ) : (
        <ul className="divide-y divide-lotus-cream border border-lotus-cream rounded-xl overflow-hidden">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "px-4 py-3 bg-white hover:bg-lotus-cream/40 transition-colors",
                item.isRead === false && "bg-lotus-rose/5",
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-md",
                    eventBadgeClass(item.eventType, "lotus"),
                  )}
                >
                  {eventLabel(item.eventType)}
                </span>
                <span className="text-xs text-lotus-stone shrink-0">
                  {formatDateTimeDisplay(item.createdAt)}
                </span>
              </div>
              <p className="text-sm text-lotus-deep leading-snug">{item.message}</p>
              {item.appointmentId != null && (
                <p className="text-xs text-lotus-rose mt-1.5 font-medium">
                  Lịch hẹn #{item.appointmentId}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
