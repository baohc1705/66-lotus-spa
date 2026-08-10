import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Placement = "top" | "right" | "bottom" | "left";
type Align = "start" | "end";

type PopoverProps = {
  trigger: ReactNode;
  content: ReactNode;
  title?: ReactNode;
  titleAction?: ReactNode;
  placement?: Placement;
  align?: Align;
  className?: string;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
};

function posStyle(
  placement: Placement,
  align: Align,
  rect: DOMRect,
): { top: number; left: number; transform: string } {
  if (placement === "right") {
    return { top: rect.top, left: rect.right + 8, transform: "none" };
  }
  if (placement === "left") {
    return {
      top: rect.top,
      left: rect.left - 8,
      transform: "translateX(-100%)",
    };
  }
  if (placement === "top") {
    if (align === "end") {
      return {
        top: rect.top - 8,
        left: rect.right,
        transform: "translate(-100%, -100%)",
      };
    }
    return { top: rect.top - 8, left: rect.left, transform: "translateY(-100%)" };
  }
  if (align === "end") {
    return {
      top: rect.bottom + 8,
      left: rect.right,
      transform: "translateX(-100%)",
    };
  }
  return { top: rect.bottom + 8, left: rect.left, transform: "none" };
}

export function Popover({
  trigger,
  content,
  title,
  titleAction,
  placement = "bottom",
  align = "start",
  className = "",
  contentClassName = "",
  onOpenChange,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);

  function setOpenState(next: boolean) {
    setOpen(next);
    if (onOpenChange) onOpenChange(next);
  }

  useEffect(() => {
    if (!open) return;

    function onDocClick(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current && rootRef.current.contains(target)) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      setOpenState(false);
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    setCoords(posStyle(placement, align, rootRef.current.getBoundingClientRect()));
  }, [open, placement, align]);

  return (
    <div ref={rootRef} className={"relative inline-block " + className}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpenState(!open)}
        onKeyDown={(event: { key: string }) => {
          if (event.key === "Enter" || event.key === " ") setOpenState(!open);
        }}
        className="inline-flex"
      >
        {trigger}
      </span>
      {open && coords
        ? createPortal(
            <div
              ref={panelRef}
              className={
                "popover fixed z-50 min-w-48 max-w-80 rounded " +
                "border border-kit bg-kit-white text-sm font-sans text-kit-body shadow-kit-pop"
              }
              style={{
                top: coords.top,
                left: coords.left,
                transform: coords.transform,
              }}
            >
              {title || titleAction ? (
                <div className="popover-header flex items-center justify-between gap-2 border-b border-kit px-3 py-2">
                  {title ? (
                    <div className="min-w-0 font-bold text-kit-heading">{title}</div>
                  ) : (
                    <span />
                  )}
                  {titleAction ? (
                    <div className="shrink-0">{titleAction}</div>
                  ) : null}
                </div>
              ) : null}
              <div className={"popover-body " + (contentClassName || "p-3")}>
                {content}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
