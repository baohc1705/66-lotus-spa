import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { inputControlClass, type InputSize } from "./inputStyles";
import type { SelectOption } from "./Select";

type SearchableSelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  invalid?: boolean;
  valid?: boolean;
  inputSize?: InputSize;
  className?: string;
  clearable?: boolean;
  id?: string;
};

export function SearchableSelect({
  options,
  value,
  defaultValue = "",
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  emptyText = "No results",
  disabled = false,
  invalid = false,
  valid = false,
  inputSize = "md",
  className = "",
  clearable = true,
  id,
}: SearchableSelectProps) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const selected = isControlled ? value : innerValue;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((o: SelectOption) => o.value === selected),
    [options, selected]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o: SelectOption) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  function setValue(next: string) {
    if (!isControlled) setInnerValue(next);
    if (onChange) onChange(next);
  }

  function pick(next: string) {
    setValue(next);
    setOpen(false);
    setQuery("");
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
          setOpen(!open);
        }}
        className={
          inputControlClass({ inputSize, invalid, valid }) +
          " flex items-center justify-between gap-2 text-left " +
          (disabled ? "" : "cursor-pointer ")
        }
      >
        <span className={"truncate " + (selectedOption ? "" : "text-kit-muted")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-kit-muted">
          {clearable && selectedOption && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              className="rounded p-0.5 hover:bg-black/5 hover:text-kit-body"
              onClick={(e: { stopPropagation(): void }) => {
                e.stopPropagation();
                pick("");
              }}
            >
              <X className="size-3.5" />
            </span>
          ) : null}
          {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded border border-kit bg-kit-white shadow-kit-pop">
          <div className="border-b border-kit p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              placeholder={searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e: { key: string; preventDefault(): void }) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered.length > 0) pick(filtered[0].value);
                }
              }}
              className={
                "w-full rounded border border-kit px-2 py-1.5 text-sm text-kit-body outline-none " +
                "placeholder:text-kit-muted focus:border-kit-primary focus:ring-2 focus:ring-blue-600/25"
              }
            />
          </div>
          <ul role="listbox" className="m-0 max-h-52 list-none overflow-y-auto p-0">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-kit-muted">{emptyText}</li>
            ) : (
              filtered.map((opt: SelectOption) => {
                const active = opt.value === selected;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={
                        "block w-full px-3 py-2 text-left text-sm " +
                        (active
                          ? "bg-kit-primary text-kit-white"
                          : "text-kit-body hover:bg-blue-50")
                      }
                      onClick={() => pick(opt.value)}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
