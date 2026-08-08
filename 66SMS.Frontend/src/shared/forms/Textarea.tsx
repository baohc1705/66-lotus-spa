import type { TextareaHTMLAttributes } from "react";
import { inputControlClass, type InputSize } from "./inputStyles";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
  inputSize?: InputSize;
  invalid?: boolean;
  valid?: boolean;
};

export function Textarea({
  className = "",
  inputSize = "md",
  invalid = false,
  valid = false,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      className={inputControlClass({ inputSize, invalid, valid, className })}
    />
  );
}
