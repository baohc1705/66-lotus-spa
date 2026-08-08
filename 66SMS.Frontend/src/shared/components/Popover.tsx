import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
type Placement = "top" | "right" | "bottom" | "left";

type PopoverProps = {
  trigger: ReactNode;
  content: ReactNode;
  title?: string;
  placement?: Placement;
  className?: string;
};

function posStyle(
  placement: Placement,
  rect: DOMRect,
): { top: number; left: number; transform: string } {
  if (placement === "right") {
    return { top: rect.top, left: rect.right + 8, transform: "none" };
  }
  if (placement === "bottom") {
    return { top: rect.bottom + 8, left: rect.left, transform: "none" };
  }
  if (placement === "left") {
    return {
      top: rect.top,
      left: rect.left - 8,
      transform: "translateX(-100%)",
    };
  }
  return { top: rect.top - 8, left: rect.left, transform: "translateY(-100%)" };
}

export function Popover({
  trigger,
  content,
  title,
  placement = "bottom",
  className = "",
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    setCoords(posStyle(placement, rootRef.current.getBoundingClientRect()));
  }, [open, placement]);

  return (
    <div ref={rootRef} className={"relative inline-block " + className}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e: { key: string }) => {
          if (e.key === "Enter" || e.key === " ") setOpen(!open);
        }}
        className="inline-flex"
      >
        {trigger}
      </span>
      {open && coords
        ? createPortal(
            <div
              className={
                "popover fixed z-50 min-w-48 max-w-80 rounded " +
                "border border-kit-primary/20 bg-kit-white text-sm font-sans text-kit-body shadow-kit-pop"
              }
              style={{
                top: coords.top,
                left: coords.left,
                transform: coords.transform,
              }}
            >
              {title ? (
                <div className="popover-header border-b border-black/5 px-3 py-2 font-bold">
                  {title}
                </div>
              ) : null}
              <div className="popover-body p-3">{content}</div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
