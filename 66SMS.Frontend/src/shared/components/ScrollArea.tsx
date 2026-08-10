import type { ReactNode } from "react";

type ScrollSize = "xs" | "sm" | "md" | "lg";

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  size?: ScrollSize;
  maxHeight?: number | string;
};

function sizeHeight(size: ScrollSize): string {
  if (size === "xs") return "150px";
  if (size === "sm") return "200px";
  if (size === "md") return "300px";
  return "400px";
}

export function ScrollArea({
  children,
  className = "",
  size = "md",
  maxHeight,
}: ScrollAreaProps) {
  const height =
    maxHeight != null
      ? typeof maxHeight === "number"
        ? maxHeight + "px"
        : maxHeight
      : sizeHeight(size);

  return (
    <div
      className={"overflow-y-auto overflow-x-hidden text-sm font-sans " + className}
      style={{ height }}
    >
      {children}
    </div>
  );
}
