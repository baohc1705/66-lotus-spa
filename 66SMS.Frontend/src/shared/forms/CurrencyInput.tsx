import type { InputHTMLAttributes } from "react";
import { Input, type InputSize } from "@/shared/forms/Input";
import {
  formatNumberInput,
  parseNumberInput,
} from "@/shared/utils/currency";

type CurrencyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value?: number | null;
  onChange?: (value: number | undefined) => void;
  inputSize?: InputSize;
  invalid?: boolean;
  valid?: boolean;
  className?: string;
};

export function CurrencyInput({
  value,
  onChange,
  className = "",
  inputSize = "md",
  invalid = false,
  valid = false,
  ...props
}: CurrencyInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      inputSize={inputSize}
      invalid={invalid}
      valid={valid}
      className={"text-right tabular-nums " + className}
      value={formatNumberInput(value)}
      onChange={(e) => {
        onChange?.(parseNumberInput(e.target.value));
      }}
    />
  );
}
