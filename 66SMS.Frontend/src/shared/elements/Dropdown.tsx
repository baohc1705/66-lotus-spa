import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import {
  resolveButtonSize,
  resolveButtonVariant,
  type ButtonSize,
  type ButtonVariant,
} from "@/shared/elements/Button";

export type DropdownPlacement = "bottom" | "top" | "left" | "right";

export type DropdownItem =
  | {
      type: "item";
      label: string;
      icon?: ReactNode;
      danger?: boolean;
      onClick?: () => void;
    }
  | { type: "header"; label: string }
  | { type: "divider" };

type DropdownProps = {
  label?: string;
  trigger?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  split?: boolean;
  placement?: DropdownPlacement;
  menuAlign?: "left" | "right";
  wide?: boolean;
  className?: string;
  items?: DropdownItem[];
  children?: ReactNode;
};

const defaultItems: DropdownItem[] = [
  { type: "item", label: "Menus" },
  { type: "item", label: "Settings" },
  { type: "header", label: "Header" },
  { type: "item", label: "Actions" },
  { type: "divider" },
  { type: "item", label: "Dividers" },
];

function Chevron({ placement }: { placement: DropdownPlacement }) {
  const iconClass = "size-3.5 shrink-0 opacity-80";
  if (placement === "top") return <ChevronUp className={iconClass} />;
  if (placement === "left") return <ChevronLeft className={iconClass} />;
  if (placement === "right") return <ChevronRight className={iconClass} />;
  return <ChevronDown className={iconClass} />;
}

function menuCoords(
  rect: DOMRect,
  placement: DropdownPlacement,
  menuAlign: "left" | "right",
): { top: number; left: number; transform: string } {
  if (placement === "top") {
    if (menuAlign === "right") {
      return {
        top: rect.top - 4,
        left: rect.right,
        transform: "translate(-100%, -100%)",
      };
    }
    return {
      top: rect.top - 4,
      left: rect.left,
      transform: "translateY(-100%)",
    };
  }
  if (placement === "left") {
    return {
      top: rect.top,
      left: rect.left - 4,
      transform: "translateX(-100%)",
    };
  }
  if (placement === "right") {
    return { top: rect.top, left: rect.right + 4, transform: "none" };
  }
  if (menuAlign === "right") {
    return {
      top: rect.bottom + 4,
      left: rect.right,
      transform: "translateX(-100%)",
    };
  }
  return { top: rect.bottom + 4, left: rect.left, transform: "none" };
}

export function Dropdown({
  label = "",
  trigger,
  variant = "primary",
  size = "md",
  split = false,
  placement = "bottom",
  menuAlign = "left",
  wide = false,
  className = "",
  items = defaultItems,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current && rootRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !rootRef.current) {
      setCoords(null);
      return;
    }
    setCoords(menuCoords(rootRef.current.getBoundingClientRect(), placement, menuAlign));
  }, [open, placement, menuAlign]);

  const btnBase =
    "mb-0 mr-0 inline-flex items-center justify-center gap-1.5 font-sans font-medium " +
    "leading-normal transition-all rounded text-sm " +
    resolveButtonVariant(variant) +
    " " +
    resolveButtonSize(size) +
    (wide ? " !px-6" : "");

  const menu =
    open && coords
      ? createPortal(
          <div
            ref={menuRef}
            className={
              "fixed z-50 min-w-60 rounded border border-kit bg-kit-white py-1 " +
              "text-sm font-sans shadow-kit-pop"
            }
            style={{
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
            role="menu"
          >
            {children
              ? children
              : items.map((item: DropdownItem, index: number) => {
                  if (item.type === "divider") {
                    return (
                      <div
                        key={"d-" + index}
                        className="my-1 border-t border-kit"
                      />
                    );
                  }
                  if (item.type === "header") {
                    return (
                      <div
                        key={"h-" + index}
                        className="px-3 py-1 text-xs font-bold uppercase text-kit-muted"
                      >
                        {item.label}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={"i-" + index + "-" + item.label}
                      type="button"
                      role="menuitem"
                      className={
                        "flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-left text-sm " +
                        (item.danger
                          ? "text-kit-danger hover:bg-red-50 hover:text-kit-danger"
                          : "text-kit-body hover:bg-blue-50 hover:text-kit-primary")
                      }
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        setOpen(false);
                      }}
                    >
                      {item.icon ? (
                        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                          {item.icon}
                        </span>
                      ) : null}
                      {item.label}
                    </button>
                  );
                })}
          </div>,
          document.body,
        )
      : null;

  if (split) {
    return (
      <div
        ref={rootRef}
        className={
          "relative inline-flex " +
          (className.indexOf("mb-") < 0 ? "mb-2 " : "") +
          (className.indexOf("mr-") < 0 ? "mr-2 " : "") +
          className
        }
      >
        <button
          type="button"
          className={btnBase + " rounded-r-none border-r-0"}
        >
          {label}
        </button>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={
            btnBase +
            " rounded-l-none px-2 " +
            (size === "lg" ? "min-w-10" : size === "sm" ? "min-w-7" : "min-w-8")
          }
        >
          <span className="sr-only">Toggle Dropdown</span>
          <Chevron placement={placement} />
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={
        "relative inline-block " +
        (className.indexOf("mb-") < 0 ? "mb-2 " : "") +
        (className.indexOf("mr-") < 0 ? "mr-2 " : "") +
        className
      }
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={btnBase}
      >
        {trigger ? (
          trigger
        ) : (
          <>
            <span className="min-w-0 truncate whitespace-nowrap">{label}</span>
            <Chevron placement={placement} />
          </>
        )}
      </button>
      {menu}
    </div>
  );
}
