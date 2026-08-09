import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { inputControlClass, type InputSize } from "./Input";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectChangeEvent = { target: { value: string; name?: string } };

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size" | "onChange" | "value"
> & {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: SelectChangeEvent) => void;
  options?: SelectOption[];
  children?: ReactNode;
  className?: string;
  inputSize?: InputSize;
  invalid?: boolean;
  valid?: boolean;
  placeholder?: string;
  htmlSize?: number;
};

function optionsFromChildren(children: ReactNode): SelectOption[] {
  const list: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type !== "option") return;
    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
    };
    const label = String(props.children ?? "");
    const hasValue = props.value !== undefined;
    list.push({
      value: hasValue ? String(props.value) : label,
      label,
    });
  });
  return list;
}

export function Select({
  options,
  children,
  className = "",
  inputSize = "md",
  invalid = false,
  valid = false,
  value,
  defaultValue,
  onChange,
  disabled = false,
  name,
  id,
  placeholder,
  multiple = false,
  htmlSize,
}: SelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(
    defaultValue == null ? "" : String(defaultValue),
  );
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const list =
    options && options.length > 0 ? options : optionsFromChildren(children);
  const current = isControlled
    ? value == null
      ? ""
      : String(value)
    : innerValue;
  const selected = list.find((o: SelectOption) => o.value === current);
  const emptyOption = list.find((o: SelectOption) => o.value === "");
  const displayLabel =
    selected?.label || placeholder || emptyOption?.label || "Chọn...";
  const isPlaceholder = !selected || selected.value === "";
  const menuItems = list.filter((o: SelectOption) => o.value !== "");
  const showPlaceholderItem = Boolean(placeholder || emptyOption);

  useEffect(() => {
    if (!open || multiple) return;

    function onDocClick(e: MouseEvent) {
      const menu = document.getElementById("kit-select-menu");
      if (menu && menu.contains(e.target as Node)) return;
      if (rootRef.current && rootRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }

    function onReposition() {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuBox({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }

    onReposition();
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, multiple]);

  function pick(next: string) {
    if (!isControlled) setInnerValue(next);
    if (onChange) onChange({ target: { value: next, name } });
    setOpen(false);
  }

  if (multiple) {
    return (
      <select
        id={id}
        name={name}
        multiple
        size={htmlSize}
        disabled={disabled}
        value={isControlled ? current : undefined}
        defaultValue={
          !isControlled && defaultValue != null
            ? String(defaultValue)
            : undefined
        }
        onChange={(e) => {
          if (onChange) onChange({ target: { value: e.target.value, name } });
        }}
        className={
          inputControlClass({ inputSize, invalid, valid, className }) +
          " appearance-auto"
        }
      >
        {children
          ? children
          : list.map((option: SelectOption) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
      </select>
    );
  }

  return (
    <div ref={rootRef} className={"relative " + className}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((prev: boolean) => !prev);
        }}
        className={
          inputControlClass({ inputSize, invalid, valid }) +
          " flex h-9 items-center justify-between gap-2 py-0 text-left " +
          (disabled ? "" : "cursor-pointer ")
        }
      >
        <span
          className={
            "truncate " + (isPlaceholder ? "text-kit-muted" : "text-kit-body")
          }
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={
            "size-3.5 shrink-0 text-kit-muted transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && menuBox
        ? createPortal(
            <div
              id="kit-select-menu"
              role="listbox"
              style={{
                top: menuBox.top,
                left: menuBox.left,
                width: menuBox.width,
              }}
              className={
                "fixed z-50 max-h-56 overflow-y-auto rounded border border-kit " +
                "bg-kit-white py-1 text-sm font-sans shadow-kit-pop"
              }
            >
              {showPlaceholderItem ? (
                <button
                  type="button"
                  role="option"
                  aria-selected={current === ""}
                  className={
                    "block w-full px-3 py-1 text-left text-sm " +
                    (current === ""
                      ? "bg-blue-50 text-kit-primary"
                      : "text-kit-muted hover:bg-blue-50 hover:text-kit-primary")
                  }
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick("")}
                >
                  {placeholder || emptyOption?.label || "Chọn..."}
                </button>
              ) : null}
              {menuItems.map((opt: SelectOption) => {
                const active = opt.value === current;
                return (
                  <button
                    key={opt.value || opt.label}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={
                      "block w-full px-3 py-1 text-left text-sm " +
                      (active
                        ? "bg-blue-50 text-kit-primary"
                        : "text-kit-body hover:bg-blue-50 hover:text-kit-primary")
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
