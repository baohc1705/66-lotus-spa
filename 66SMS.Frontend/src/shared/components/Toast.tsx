import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export type ToastVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "focus"
  | "alternate"
  | "dark";

export type ToastPosition =
  | "top-right"
  | "bottom-right"
  | "bottom-left"
  | "top-left"
  | "top-full"
  | "bottom-full"
  | "top-center"
  | "bottom-center";

type ToastProps = {
  open?: boolean;
  title?: string;
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
  onClick?: () => void;
  progress?: boolean;
  duration?: number;
  rtl?: boolean;
  className?: string;
};

// Architect _toastr.scss base64 icons (same as live demo)
const ICON_SUCCESS =
  "url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLY2AYBfQMgf///3P8+/evAIgvA/FsIF+BavYDDWMBGroaSMMBiE8VC7AZDrIFaMFnii3AZTjUgsUUWUDA8OdAH6iQbQEhw4HyGsPEcKBXBIC4ARhex4G4BsjmweU1soIFaGg/WtoFZRIZdEvIMhxkCCjXIVsATV6gFGACs4Rsw0EGgIIH3QJYJgHSARQZDrWAB+jawzgs+Q2UO49D7jnRSRGoEFRILcdmEMWGI0cm0JJ2QpYA1RDvcmzJEWhABhD/pqrL0S0CWuABKgnRki9lLseS7g2AlqwHWQSKH4oKLrILpRGhEQCw2LiRUIa4lwAAAABJRU5ErkJggg==\")";
const ICON_ERROR =
  "url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=\")";
const ICON_INFO =
  "url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGwSURBVEhLtZa9SgNBEMc9sUxxRcoUKSzSWIhXpFMhhYWFhaBg4yPYiWCXZxBLERsLRS3EQkEfwCKdjWJAwSKCgoKCcudv4O5YLrt7EzgXhiU3/4+b2ckmwVjJSpKkQ6wAi4gwhT+z3wRBcEz0yjSseUTrcRyfsHsXmD0AmbHOC9Ii8VImnuXBPglHpQ5wwSVM7sNnTG7Za4JwDdCjxyAiH3nyA2mtaTJufiDZ5dCaqlItILh1NHatfN5skvjx9Z38m69CgzuXmZgVrPIGE763Jx9qKsRozWYw6xOHdER+nn2KkO+Bb+UV5CBN6WC6QtBgbRVozrahAbmm6HtUsgtPC19tFdxXZYBOfkbmFJ1VaHA1VAHjd0pp70oTZzvR+EVrx2Ygfdsq6eu55BHYR8hlcki+n+kERUFG8BrA0BwjeAv2M8WLQBtcy+SD6fNsmnB3AlBLrgTtVW1c2QN4bVWLATaIS60J2Du5y1TiJgjSBvFVZgTmwCU+dAZFoPxGEEs8nyHC9Bwe2GvEJv2WXZb0vjdyFT4Cxk3e/kIqlOGoVLwwPevpYHT+00T+hWwXDf4AJAOUqWcDhbwAAAAASUVORK5CYII=\")";
const ICON_WARNING =
  "url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGYSURBVEhL5ZSvTsNQFMbXZGICMYGYmJhAQIJAICYQPAACiSDB8AiICQQJT4CqQEwgJvYASAQCiZiYmJhAIBATCARJy+9rTsldd8sKu1M0+dLb057v6/lbq/2rK0mS/TRNj9cWNAKPYIJII7gIxCcQ51cvqID+GIEX8ASG4B1bK5gIZFeQfoJdEXOfgX4QAQg7kH2A65yQ87lyxb27sggkAzAuFhbbg1K2kgCkB1bVwyIR9m2L7PRPIhDUIXgGtyKw575yz3lTNs6X4JXnjV+LKM/m3MydnTbtOKIjtz6VhCBq4vSm3ncdrD2lk0VgUXSVKjVDJXJzijW1RQdsU7F77He8u68koNZTz8Oz5yGa6J3H3lZ0xYgXBK2QymlWWA+RWnYhskLBv2vmE+hBMCtbA7KX5drWyRT/2JsqZ2IvfB9Y4bWDNMFbJRFmC9E74SoS0CqulwjkC0+5bpcV1CZ8NMej4pjy0U+doDQsGyo1hzVJttIjhQ7GnBtRFN1UarUlH8F3xict+HY07rEzoUGPlWcjRFRr4/gChZgc3ZL2d8oAAAAASUVORK5CYII=\")";

function variantStyle(variant: ToastVariant): {
  bg: string;
  shadow: string;
  icon: string;
  text: string;
  toastClass: string;
} {
  if (variant === "success") {
    return {
      toastClass: "toast-success",
      bg: "bg-kit-success",
      text: "text-kit-white",
      icon: ICON_SUCCESS,
      shadow: "shadow-kit-toast",
    };
  }
  if (variant === "danger") {
    return {
      toastClass: "toast-error",
      bg: "bg-kit-danger",
      text: "text-kit-white",
      icon: ICON_ERROR,
      shadow: "shadow-kit-toast",
    };
  }
  if (variant === "warning") {
    return {
      toastClass: "toast-warning",
      bg: "bg-kit-warning",
      text: "text-kit-on-warning",
      icon: ICON_WARNING,
      shadow: "shadow-kit-toast",
    };
  }
  if (variant === "info") {
    return {
      toastClass: "toast-info",
      bg: "bg-kit-info",
      text: "text-kit-white",
      icon: ICON_INFO,
      shadow: "shadow-kit-toast",
    };
  }
  if (variant === "secondary") {
    return {
      toastClass: "toast-info",
      bg: "bg-kit-secondary",
      text: "text-kit-white",
      icon: ICON_INFO,
      shadow: "shadow-kit-toast",
    };
  }
  if (variant === "focus") {
    return {
      toastClass: "toast-info",
      bg: "bg-kit-focus",
      text: "text-kit-white",
      icon: ICON_INFO,
      shadow: "shadow-kit-toast",
    };
  }
  if (variant === "alternate") {
    return {
      toastClass: "toast-info",
      bg: "bg-kit-alt",
      text: "text-kit-white",
      icon: ICON_INFO,
      shadow: "shadow-kit-toast",
    };
  }
  if (variant === "dark") {
    return {
      toastClass: "toast-info",
      bg: "bg-kit-dark",
      text: "text-kit-white",
      icon: ICON_INFO,
      shadow: "shadow-kit-toast",
    };
  }
  return {
    toastClass: "toast-info",
    bg: "bg-kit-primary",
    text: "text-kit-white",
    icon: ICON_INFO,
    shadow: "shadow-kit-toast",
  };
}

/** Single toast — Architect #toast-container > .toast-* */
export function Toast({
  open = true,
  title,
  message,
  variant = "primary",
  onClose,
  onClick,
  progress = false,
  duration = 5000,
  rtl = false,
  className = "",
}: ToastProps) {
  if (!open) return null;
  const style = variantStyle(variant);

  return (
    <div
      role="alert"
      dir={rtl ? "rtl" : undefined}
      onClick={onClick}
      className={
        style.toastClass +
        " relative mb-2.5 w-72 max-w-full overflow-hidden rounded " +
        "py-2.5 pr-2.5 pl-12 font-sans text-sm opacity-90 " +
        "transition-opacity hover:cursor-pointer hover:opacity-100 " +
        style.bg +
        " " +
        style.text +
        " " +
        style.shadow +
        " " +
        className
      }
      style={{
        backgroundImage: style.icon,
        backgroundPosition: "15px center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {onClose ? (
        <button
          type="button"
          onClick={(e: { stopPropagation(): void }) => {
            e.stopPropagation();
            onClose();
          }}
          className={
            "toast-close-button absolute top-1 right-1 border-0 bg-transparent " +
            "p-0 text-lg font-bold leading-none opacity-80 hover:opacity-40 " +
            (variant === "warning" ? "text-kit-on-warning" : "text-kit-white")
          }
          aria-label="Close"
        >
          ×
        </button>
      ) : null}

      {title ? (
        <div className={"toast-title mb-0.5 font-bold " + (onClose ? "pr-5" : "")}>
          {title}
        </div>
      ) : null}
      <div className={"toast-message break-words " + (onClose && !title ? "pr-5" : "")}>
        {message}
      </div>

      {progress ? (
        <div className="toast-progress absolute bottom-0 left-0 h-1 w-full overflow-hidden">
          <div
            key={String(duration) + "-" + message + "-" + (title ?? "")}
            className="h-full bg-black/40"
            style={{
              width: "100%",
              animation: "toast-progress " + duration + "ms linear forwards",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function containerPosition(pos: ToastPosition): string {
  if (pos === "bottom-right") return "toast-bottom-right fixed bottom-3 right-3";
  if (pos === "bottom-left") return "toast-bottom-left fixed bottom-3 left-3";
  if (pos === "top-left") return "toast-top-left fixed top-3 left-3";
  if (pos === "top-full") return "toast-top-full-width fixed top-3 left-3 right-3";
  if (pos === "bottom-full") return "toast-bottom-full-width fixed bottom-3 left-3 right-3";
  if (pos === "top-center") return "toast-top-center fixed top-3 left-1/2 -translate-x-1/2";
  if (pos === "bottom-center") return "toast-bottom-center fixed bottom-3 left-1/2 -translate-x-1/2";
  return "toast-top-right fixed top-3 right-3";
}

type ToastStackProps = {
  children: ReactNode;
  position?: ToastPosition;
  className?: string;
};

export function ToastStack({
  children,
  position = "top-right",
  className = "",
}: ToastStackProps) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      id="toast-container"
      className={containerPosition(position) + " z-50 " + className}
    >
      {children}
    </div>,
    document.body
  );
}
