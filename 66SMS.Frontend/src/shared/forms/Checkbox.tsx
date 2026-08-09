import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from "react";

export type CheckboxTone =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "dark";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  label?: ReactNode;
  inline?: boolean;
  indeterminate?: boolean;
  tone?: CheckboxTone;
  onChange?: (checked: boolean) => void;
  className?: string;
};

function toneTextClass(tone: CheckboxTone): string {
  if (tone === "secondary") return "text-kit-secondary";
  if (tone === "success") return "text-kit-success";
  if (tone === "info") return "text-kit-info";
  if (tone === "warning") return "text-kit-warning";
  if (tone === "danger") return "text-kit-danger";
  if (tone === "focus") return "text-kit-focus";
  if (tone === "alternate") return "text-kit-alt";
  if (tone === "dark") return "text-kit-dark";
  return "text-kit-primary";
}

export function Checkbox({
  label,
  inline = false,
  indeterminate = false,
  tone = "primary",
  onChange,
  className = "",
  id,
  disabled,
  checked,
  defaultChecked,
  name,
  value,
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div
      className={
        "form-check relative " +
        (inline ? "mr-3 inline-block " : "mb-2 block ") +
        (disabled ? "opacity-60 " : "") +
        className
      }
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        type="checkbox"
        disabled={disabled}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e) => {
          if (onChange) onChange(e.target.checked);
        }}
        className={
          "form-check-input mt-0.5 h-4 w-4 rounded border-kit focus:ring-blue-600/25 " +
          toneTextClass(tone)
        }
      />
      {label ? (
        <label htmlFor={id} className="form-check-label ml-2 text-sm text-kit-body">
          {label}
        </label>
      ) : null}
    </div>
  );
}
