import type { ReactNode } from "react";
import type { InputSize } from "./inputStyles";

type InputGroupProps = {
  children?: ReactNode;
  className?: string;
  size?: InputSize;
};

export function InputGroup({ children, className = "", size = "md" }: InputGroupProps) {
  let sizeCls = "";
  if (size === "lg") sizeCls = "input-group-lg ";
  if (size === "sm") sizeCls = "input-group-sm ";

  return (
    <div className={"input-group " + sizeCls + className}>
      {children}
    </div>
  );
}

export function InputGroupText({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={
        "input-group-text inline-flex items-center whitespace-nowrap rounded border border-kit " +
        "bg-kit-page px-3 text-sm text-kit-body " +
        className
      }
    >
      {children}
    </span>
  );
}
