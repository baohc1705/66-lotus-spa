import type { InputHTMLAttributes, ReactNode } from "react";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  name: string;
  value: string;
  label?: ReactNode;
  inline?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

export function Radio({
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  label,
  inline = false,
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
        className="form-check-input mt-0.5 h-4 w-4 border-kit text-kit-primary focus:ring-blue-600"
      />
      {label ? (
        <label htmlFor={id} className="form-check-label ml-2 text-sm text-kit-body">
          {label}
        </label>
      ) : null}
    </div>
  );
}
