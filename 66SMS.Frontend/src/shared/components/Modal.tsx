import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  scrollable?: boolean;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-xs",
  md: "max-w-lg",
  lg: "max-w-3xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  scrollable = false,
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

  return createPortal(
    <div className="modal fade fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-20 font-sans">
      <div
        className="modal-backdrop absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={"modal-dialog relative z-10 mb-8 w-full " + sizeClass[size]}
      >
        <div className="modal-content overflow-hidden rounded bg-white text-sm text-kit-body shadow-kit-modal">
          {title ? (
            <div className="modal-header flex items-center justify-between border-b border-black/5 bg-kit-page px-4 py-3">
              <h5 className="modal-title m-0 text-lg font-normal text-kit-heading">{title}</h5>
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
              "modal-body px-4 py-4 " + (scrollable ? "max-h-[60vh] overflow-y-auto" : "")
            }
          >
            {children}
          </div>
          {footer ? (
            <div className="modal-footer flex justify-end gap-0 border-t border-black/5 bg-kit-page px-4 py-3">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
