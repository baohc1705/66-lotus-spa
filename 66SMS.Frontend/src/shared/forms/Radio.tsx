import type { InputHTMLAttributes, ReactNode } from "react";

export type RadioTone =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "dark";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  name: string;
  value: string;
  label?: ReactNode;
  inline?: boolean;
  tone?: RadioTone;
  onChange?: (value: string) => void;
  className?: string;
};

function toneTextClass(tone: RadioTone): string {
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

export function Radio({
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  label,
  inline = false,
  tone = "primary",
  disabled = false,
  className = "",
  id,
}: RadioProps) {
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
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={() => {
          if (onChange) onChange(value);
        }}
        className={
          "form-check-input mt-0.5 h-4 w-4 border-kit focus:ring-blue-600/25 " +
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
