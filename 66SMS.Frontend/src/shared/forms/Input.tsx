import type { InputHTMLAttributes } from "react";

export type InputSize = "sm" | "md" | "lg";

function sizeClass(size: InputSize): string {
  if (size === "lg") return "px-4 py-2 text-lg";
  if (size === "sm") return "px-2 py-1 text-sm";
  return "px-3 py-1.5 text-sm";
}

/** Dung chung cho Textarea / Select / SearchableSelect */
// eslint-disable-next-line react-refresh/only-export-components -- form controls dung chung style
export function inputControlClass(opts: {
  inputSize?: InputSize;
  invalid?: boolean;
  valid?: boolean;
  className?: string;
}): string {
  const size = opts.inputSize ?? "md";
  let cls =
    "w-full rounded border bg-kit-white font-sans outline-none transition-colors " +
    "disabled:cursor-not-allowed disabled:bg-kit-page disabled:opacity-100 " +
    sizeClass(size) +
    " ";

  if (opts.invalid) {
    cls +=
      "border-kit-danger text-kit-body focus:border-kit-danger focus:ring-2 focus:ring-red-500/25 ";
  } else if (opts.valid) {
    cls +=
      "border-kit-success text-kit-body focus:border-kit-success focus:ring-2 focus:ring-green-500/25 ";
  } else {
    cls +=
      "border-kit text-kit-body placeholder:text-kit-muted " +
      "focus:border-kit-primary focus:ring-2 focus:ring-blue-600/25 ";
  }

  return cls + (opts.className ?? "");
}

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
