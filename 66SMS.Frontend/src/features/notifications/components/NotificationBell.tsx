import { Bell } from "lucide-react";
import { toast } from "@/shared/components/kitToast";
import type { AxiosError } from "axios";
import { Popover } from "@/shared/components/Popover";
import { Badge } from "@/shared/elements/Badge";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";
import type { Result } from "@/shared/types/common.types";
import { notificationApi } from "../api/notification.api";
import { useNotificationUiStore } from "../stores/notificationUiStore";
import {
  eventBadgeVariant,
  eventLabel,
} from "../utils/notificationEvent";

type Props = {
  className?: string;
  variant?: "dark" | "light";
};

export function NotificationBell({ className, variant = "dark" }: Props) {
  const unreadCount = useNotificationUiStore((s) => s.unreadCount);
  const items = useNotificationUiStore((s) => s.items);
  const markAllReadLocal = useNotificationUiStore((s) => s.markAllRead);
  const clearLocal = useNotificationUiStore((s) => s.clear);
  const isLight = variant === "light";

  function handleOpenChange(open: boolean) {
    if (!open) return;
    if (unreadCount <= 0) return;

    markAllReadLocal();
    notificationApi.markAllRead().catch((error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? "Không đánh dấu đã đọc được";
      toast.error(msg);
    });
  }

  function handleClear() {
    notificationApi
      .clearAll()
      .then(() => {
        clearLocal();
      })
      .catch((error: AxiosError<Result<unknown>>) => {
        const msg = error.response?.data?.message ?? "Không xóa thông báo được";
        toast.error(msg);
      });
  }

  function renderItems() {
    if (items.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-xs text-kit-muted">
          Chưa có thông báo mới
        </div>
      );
    }

    const rows = [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      rows.push(
        <div
          key={item.id}
          className="border-b border-kit px-3 py-2.5 last:border-b-0 hover:bg-kit-page"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <Badge
              variant={eventBadgeVariant(item.eventType)}
              soft
              className="px-1.5 py-0.5 text-2xs normal-case"
            >
              {eventLabel(item.eventType)}
            </Badge>
            <span className="text-2xs text-kit-muted">
              {toLocalTimeOnly(item.createdAt)}
            </span>
          </div>
          <p className="text-xs leading-snug text-kit-body">{item.message}</p>
          {item.customerName ? (
            <p className="mt-1 text-2xs font-medium text-kit-primary">
              #{item.appointmentId} · {item.customerName}
            </p>
          ) : null}
        </div>,
      );
    }
    return rows;
  }

  return (
    <Popover
      className={className ?? ""}
      placement="bottom"
      align="end"
      onOpenChange={handleOpenChange}
      title="Thông báo"
      titleAction={
        items.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-2xs font-medium text-kit-muted hover:text-kit-danger"
          >
            Xóa tất cả
          </button>
        ) : null
      }
      contentClassName="max-h-96 w-80 overflow-y-auto p-0"
      content={renderItems()}
      trigger={
        <span
          title="Thông báo"
          className={
            "relative inline-flex h-8 w-8 items-center justify-center rounded border " +
            (isLight
              ? "h-9 w-9 border-kit bg-kit-page text-kit-body hover:bg-blue-50 hover:text-kit-primary"
              : "border-white/20 bg-white/10 text-kit-white hover:bg-white/20")
          }
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <Badge
              variant={isLight ? "primary" : "warning"}
              pill
              className="absolute -right-1 -top-1 min-w-4 px-1 py-0 text-2xs leading-4"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </span>
      }
    />
  );
}
