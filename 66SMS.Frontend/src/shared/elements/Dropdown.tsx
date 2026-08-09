import { useEffect, useRef, useState, type ReactNode } from "react";
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

type DropdownItem =
  | { type: "item"; label: string; onClick?: () => void }
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

function menuPositionClass(placement: DropdownPlacement): string {
  if (placement === "top") return "bottom-full left-0 mb-1";
  if (placement === "left") return "right-full top-0 mr-1";
  if (placement === "right") return "left-full top-0 ml-1";
  return "left-0 top-full mt-1";
}

function Chevron({ placement }: { placement: DropdownPlacement }) {
  const iconClass = "size-3.5 shrink-0 opacity-80";
  if (placement === "top") return <ChevronUp className={iconClass} />;
  if (placement === "left") return <ChevronLeft className={iconClass} />;
  if (placement === "right") return <ChevronRight className={iconClass} />;
  return <ChevronDown className={iconClass} />;
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const btnBase =
    "mb-0 mr-0 inline-flex items-center justify-center gap-1.5 font-sans font-medium " +
    "leading-normal transition-all rounded text-sm " +
    resolveButtonVariant(variant) +
    " " +
    resolveButtonSize(size) +
    (wide ? " !px-6" : "");

  const alignClass = menuAlign === "right" ? "right-0 left-auto " : "";

  const menu = open ? (
    <div
      className={
        "absolute z-30 min-w-60 rounded border border-kit bg-kit-white py-1 " +
        "text-sm font-sans shadow-kit-pop " +
        alignClass +
        menuPositionClass(placement)
      }
      role="menu"
    >
      {children
        ? children
        : items.map((item: DropdownItem, index: number) => {
            if (item.type === "divider") {
              return (
                <div key={"d-" + index} className="my-1 border-t border-kit" />
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
                className="block w-full px-3 py-1 text-left text-sm text-kit-body hover:bg-blue-50 hover:text-kit-primary"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            );
          })}
    </div>
  ) : null;

  if (split) {
    return (
      <div
        ref={rootRef}
        className={"relative mb-2 mr-2 inline-flex " + className}
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
      className={"relative mb-2 mr-2 inline-block " + className}
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
            {label}
            <Chevron placement={placement} />
          </>
        )}
      </button>
      {menu}
    </div>
  );
}
