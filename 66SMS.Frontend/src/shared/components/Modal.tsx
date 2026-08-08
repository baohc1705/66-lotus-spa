import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Body cuộn; kết hợp fullHeight để form dài gần bằng màn hình */
  scrollable?: boolean;
  /** Gần full chiều cao thiết bị, chừa khoảng nhỏ quanh mép */
  fullHeight?: boolean;
  /** Căn giữa theo chiều dọc (confirm / alert) */
  centered?: boolean;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-xs",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  scrollable = false,
  fullHeight = false,
  centered = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const tall = fullHeight || scrollable;

  return createPortal(
    <div
      className={
        "modal fade fixed inset-0 z-50 flex justify-center font-sans " +
        (tall
          ? "items-stretch p-3"
          : centered
            ? "items-center overflow-y-auto p-4"
            : "items-start overflow-y-auto p-4 pt-20")
      }
    >
      <div
        className="modal-backdrop absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={
          "modal-dialog relative z-10 flex w-full flex-col " +
          sizeClass[size] +
          (tall ? " h-full max-h-full" : " mb-8")
        }
      >
        <div
          className={
            "modal-content flex min-h-0 flex-col overflow-hidden rounded bg-white " +
            "text-sm text-kit-body shadow-kit-modal " +
            (tall ? "h-full" : "")
          }
        >
          {title ? (
            <div className="modal-header flex shrink-0 items-center justify-between border-b border-black/5 bg-kit-page px-4 py-3">
              <h5 className="modal-title m-0 text-lg font-normal text-kit-heading">
                {title}
              </h5>
              <button
                type="button"
                onClick={onClose}
                className="btn-close text-xl leading-none text-kit-muted hover:text-kit-heading"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          ) : null}
          <div
            className={
              "modal-body px-4 py-4 " +
              (tall
                ? "min-h-0 flex-1 overflow-y-auto"
                : scrollable
                  ? "max-h-96 overflow-y-auto"
                  : "")
            }
          >
            {children}
          </div>
          {footer ? (
            <div className="modal-footer flex shrink-0 justify-end gap-0 border-t border-black/5 bg-kit-page px-4 py-3">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
