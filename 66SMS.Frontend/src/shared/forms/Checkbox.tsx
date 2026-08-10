import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  label?: ReactNode;
  inline?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
};

export function Checkbox({
  label,
  inline = false,
  indeterminate = false,
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
        className="form-check-input mt-0.5 h-4 w-4 rounded border-kit text-kit-primary focus:ring-blue-600"
      />
      {label ? (
        <label htmlFor={id} className="form-check-label ml-2 text-sm text-kit-body">
          {label}
        </label>
      ) : null}
    </div>
  );
}
