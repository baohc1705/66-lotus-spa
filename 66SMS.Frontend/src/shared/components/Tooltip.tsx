import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Placement = "top" | "right" | "bottom" | "left";

type TooltipProps = {
  children: ReactNode;
  text: string;
  placement?: Placement;
  variant?: "dark" | "light";
  className?: string;
};

const ARROW = 6;
const GAP = 6;

function posStyle(
  placement: Placement,
  rect: DOMRect,
): { top: number; left: number; transform: string } {
  const offset = ARROW + GAP;
  if (placement === "right") {
    return {
      top: rect.top + rect.height / 2,
      left: rect.right + offset,
      transform: "translateY(-50%)",
    };
  }
  if (placement === "bottom") {
    return {
      top: rect.bottom + offset,
      left: rect.left + rect.width / 2,
      transform: "translateX(-50%)",
    };
  }
  if (placement === "left") {
    return {
      top: rect.top + rect.height / 2,
      left: rect.left - offset,
      transform: "translate(-100%, -50%)",
    };
  }
  return {
    top: rect.top - offset,
    left: rect.left + rect.width / 2,
    transform: "translate(-50%, -100%)",
  };
}

function arrowClass(placement: Placement, light: boolean): string {
  const base = "absolute h-0 w-0 border-[6px] border-transparent";
  if (placement === "right") {
    return (
      base +
      " top-1/2 left-0 -translate-x-full -translate-y-1/2 " +
      (light ? "border-r-white" : "border-r-gray-800")
    );
  }
  if (placement === "bottom") {
    return (
      base +
      " top-0 left-1/2 -translate-x-1/2 -translate-y-full " +
      (light ? "border-b-white" : "border-b-gray-800")
    );
  }
  if (placement === "left") {
    return (
      base +
      " top-1/2 right-0 translate-x-full -translate-y-1/2 " +
      (light ? "border-l-white" : "border-l-gray-800")
    );
  }
  return (
    base +
    " bottom-0 left-1/2 -translate-x-1/2 translate-y-full " +
    (light ? "border-t-white" : "border-t-gray-800")
  );
}

export function Tooltip({
  children,
  text,
  placement = "top",
  variant = "dark",
  className = "",
}: TooltipProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);
  const light = variant === "light";

  useEffect(() => {
    if (!open || !ref.current) return;
    setCoords(posStyle(placement, ref.current.getBoundingClientRect()));
  }, [open, placement]);

  const innerClass = light
    ? "max-w-48 rounded border border-kit bg-kit-white px-2 py-1 text-center " +
      "text-sm leading-normal text-kit-heading shadow-kit-card"
    : "max-w-48 rounded bg-kit-dark px-2 py-1 text-center text-sm leading-normal text-kit-white";

  return (
    <span
      ref={ref}
      className={"relative inline-flex " + className}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && coords
        ? createPortal(
            <span
              role="tooltip"
              className="pointer-events-none fixed z-50 font-sans transition-opacity duration-200"
              style={{
                top: coords.top,
                left: coords.left,
                transform: coords.transform,
              }}
            >
              <span className={"relative block " + innerClass}>{text}</span>
              <span className={arrowClass(placement, light)} aria-hidden />
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
