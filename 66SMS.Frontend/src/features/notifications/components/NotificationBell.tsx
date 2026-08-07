import { useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";
import type { Result } from "@/shared/types/common.types";
import { notificationApi } from "../api/notification.api";
import { useNotificationUiStore } from "../stores/notificationUiStore";
import { eventBadgeClass, eventLabel } from "../utils/notificationEvent";

type Props = {
  className?: string;
};

export function NotificationBell({ className }: Props) {
  const [open, setOpen] = useState(false);
  const unreadCount = useNotificationUiStore((s) => s.unreadCount);
  const items = useNotificationUiStore((s) => s.items);
  const markAllReadLocal = useNotificationUiStore((s) => s.markAllRead);
  const clearLocal = useNotificationUiStore((s) => s.clear);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      markAllReadLocal();
      notificationApi.markAllRead().catch((error: AxiosError<Result<unknown>>) => {
        const msg = error.response?.data?.message ?? "Không đánh dấu đã đọc được";
        toast.error(msg);
      });
    }
  };

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

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleOpen}
        title="Thông báo"
        className="w-8 h-8 rounded-[4px] bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-adminGold-600 text-adminGreen-950 text-[10px] leading-4 font-bold border border-white/40">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-80 max-h-96 bg-white rounded-[4px] shadow-lg border border-adminGray-100 z-50 flex flex-col overflow-hidden text-adminInk">
            <div className="px-3 py-2.5 border-b border-adminGray-100 flex items-center justify-between bg-adminGreen-50">
              <p className="text-xs font-bold text-adminGreen-800">Thông báo</p>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-2xs font-medium text-adminGray-600 hover:text-adminGreen-600"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-adminGray-600">
                  Chưa có thông báo mới
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-2.5 border-b border-adminGray-50 hover:bg-adminGreen-50/60"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={cn(
                          "text-2xs font-bold px-1.5 py-0.5 rounded-[3px]",
                          eventBadgeClass(item.eventType),
                        )}
                      >
                        {eventLabel(item.eventType)}
                      </span>
                      <span className="text-2xs text-adminGray-400">
                        {toLocalTimeOnly(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-adminInk leading-snug">{item.message}</p>
                    {item.customerName && (
                      <p className="text-2xs text-adminGreen-700 mt-1 font-medium">
                        #{item.appointmentId} · {item.customerName}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
