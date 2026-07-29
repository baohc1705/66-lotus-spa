import { AdminInput } from "@/shared/components/forms/AdminInput";
import {
  formatNumberInput,
  parseNumberInput,
} from "@/shared/utils/currency";
import { cn } from "@/lib/utils";

interface AdminCurrencyInputProps
  extends Omit<
    React.ComponentProps<typeof AdminInput>,
    "type" | "value" | "onChange" | "inputMode"
  > {
  value?: number | null;
  onChange?: (value: number | undefined) => void;
}

export function AdminCurrencyInput({
  value,
  onChange,
  className,
  ...props
}: AdminCurrencyInputProps) {
  return (
    <AdminInput
      {...props}
      type="text"
      inputMode="numeric"
      className={cn("text-right tabular-nums", className)}
      value={formatNumberInput(value)}
      onChange={(e) => {
        onChange?.(parseNumberInput(e.target.value));
      }}
    />
  );
}
