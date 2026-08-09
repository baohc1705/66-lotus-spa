import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl";

export type ModalTone =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "dark";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Body cuộn khi nội dung vượt max-height (mặc định bật) */
  scrollable?: boolean;
  /** Ép cao gần bằng màn hình (form rất dài nếu cần) */
  fullHeight?: boolean;
  /** Căn giữa theo chiều dọc */
  centered?: boolean;
  /** Màu header / footer */
  tone?: ModalTone;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-xs",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

function toneChrome(tone: ModalTone): { bar: string; title: string; close: string } {
  if (tone === "default") {
    return {
      bar: "border-kit bg-kit-page",
      title: "text-kit-heading",
      close: "text-kit-muted hover:text-kit-heading",
    };
  }
  if (tone === "warning") {
    return {
      bar: "border-transparent bg-kit-warning",
      title: "text-kit-on-warning",
      close: "text-kit-on-warning/80 hover:text-kit-on-warning",
    };
  }
  if (tone === "secondary") {
    return {
      bar: "border-transparent bg-kit-secondary",
      title: "text-kit-white",
      close: "text-kit-white/80 hover:text-kit-white",
    };
  }
  if (tone === "success") {
    return {
      bar: "border-transparent bg-kit-success",
      title: "text-kit-white",
      close: "text-kit-white/80 hover:text-kit-white",
    };
  }
  if (tone === "info") {
    return {
      bar: "border-transparent bg-kit-info",
      title: "text-kit-white",
      close: "text-kit-white/80 hover:text-kit-white",
    };
  }
  if (tone === "danger") {
    return {
      bar: "border-transparent bg-kit-danger",
      title: "text-kit-white",
      close: "text-kit-white/80 hover:text-kit-white",
    };
  }
  if (tone === "focus") {
    return {
      bar: "border-transparent bg-kit-focus",
      title: "text-kit-white",
      close: "text-kit-white/80 hover:text-kit-white",
    };
  }
  if (tone === "alternate") {
    return {
      bar: "border-transparent bg-kit-alt",
      title: "text-kit-white",
      close: "text-kit-white/80 hover:text-kit-white",
    };
  }
  if (tone === "dark") {
    return {
      bar: "border-transparent bg-kit-dark",
      title: "text-kit-white",
      close: "text-kit-white/80 hover:text-kit-white",
    };
  }
  return {
    bar: "border-transparent bg-kit-primary",
    title: "text-kit-white",
    close: "text-kit-white/80 hover:text-kit-white",
  };
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  scrollable = true,
  fullHeight = false,
  centered = true,
  tone = "default",
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

  const chrome = toneChrome(tone);

  return createPortal(
    <div
      className={
        "modal fade fixed inset-0 z-50 flex justify-center overflow-y-auto p-3 font-sans " +
        (fullHeight
          ? "items-stretch"
          : centered
            ? "items-center"
            : "items-start pt-16")
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
          "modal-dialog relative z-10 my-auto flex w-full flex-col " +
          sizeClass[size] +
          " max-h-[calc(100dvh-1.5rem)] " +
          (fullHeight ? "h-[calc(100dvh-1.5rem)]" : "")
        }
      >
        <div
          className={
            "modal-content flex max-h-full min-h-0 flex-col overflow-hidden rounded bg-kit-white " +
            "text-sm text-kit-body shadow-kit-modal " +
            (fullHeight ? "h-full" : "")
          }
        >
          {title ? (
            <div
              className={
                "modal-header flex shrink-0 items-center justify-between border-b px-4 py-2 " +
                chrome.bar
              }
            >
              <h5 className={"modal-title m-0 text-base font-medium " + chrome.title}>
                {title}
              </h5>
              <button
                type="button"
                onClick={onClose}
                className={"btn-close text-lg leading-none " + chrome.close}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          ) : null}
          <div
            className={
              "modal-body min-h-0 px-4 py-3 " +
              (scrollable || fullHeight ? "overflow-y-auto" : "") +
              (fullHeight ? " flex-1" : "")
            }
          >
            {children}
          </div>
          {footer ? (
            <div className="modal-footer flex shrink-0 justify-end gap-0 border-t border-kit bg-kit-page px-4 py-2">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
