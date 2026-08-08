import type { ReactNode, SelectHTMLAttributes } from "react";
import { inputControlClass, type InputSize } from "./inputStyles";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  options?: SelectOption[];
  children?: ReactNode;
  className?: string;
  inputSize?: InputSize;
  invalid?: boolean;
  valid?: boolean;
  htmlSize?: number;
};

export function Select({
  options,
  children,
  className = "",
  inputSize = "md",
  invalid = false,
  valid = false,
  htmlSize,
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
      size={htmlSize}
      className={
        inputControlClass({ inputSize, invalid, valid, className }) +
        " appearance-auto"
      }
    >
      {children
        ? children
        : (options ?? []).map((option: SelectOption) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
    </select>
  );
}
