import type { InputHTMLAttributes } from "react";
import { inputControlClass, type InputSize } from "./inputStyles";

export type { InputSize } from "./inputStyles";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  inputSize?: InputSize;
  invalid?: boolean;
  valid?: boolean;
};

export function Input({
  className = "",
  inputSize = "md",
  invalid = false,
  valid = false,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={inputControlClass({ inputSize, invalid, valid, className })}
    />
  );
}
