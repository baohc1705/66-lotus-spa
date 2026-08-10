export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "light"
  | "dark"
  | "link"
  | "outline"
  | "outline-primary"
  | "outline-secondary"
  | "outline-success"
  | "outline-info"
  | "outline-warning"
  | "outline-danger"
  | "outline-focus"
  | "outline-alternate"
  | "outline-light"
  | "outline-dark"
  | "outline-link"
  | "ghost"
  | "default"
  | "destructive"
  | "admin"
  | "gold";

export type ButtonSize = "sm" | "md" | "lg" | "default" | "xl" | "icon" | "icon-sm" | "icon-lg";

function outlineStyle(colorClasses: string, borderClasses: string, borderless = false): string {
  return "bg-transparent " + colorClasses + " " + (borderless ? "border-0" : borderClasses);
}

export function resolveButtonVariant(variant: ButtonVariant, borderless = false): string {
  if (variant === "secondary") {
    return "bg-kit-secondary text-kit-white hover:bg-gray-600 border border-transparent";
  }
  if (variant === "success") {
    return "bg-kit-success text-kit-white hover:bg-green-600 border border-transparent";
  }
  if (variant === "info") {
    return "bg-kit-info text-kit-white hover:bg-sky-600 border border-transparent";
  }
  if (variant === "warning" || variant === "gold") {
    return "bg-kit-warning text-kit-on-warning hover:bg-yellow-500 border border-transparent";
  }
  if (variant === "danger" || variant === "destructive") {
    return "bg-kit-danger text-kit-white hover:bg-red-700 border border-transparent";
  }
  if (variant === "focus") {
    return "bg-kit-focus text-kit-white hover:bg-slate-800 border border-transparent";
  }
  if (variant === "alternate") {
    return "bg-kit-alt text-kit-white hover:bg-purple-800 border border-transparent";
  }
  if (variant === "light") {
    return "bg-kit-light text-kit-dark hover:bg-gray-200 border border-transparent";
  }
  if (variant === "dark") {
    return "bg-kit-dark text-kit-white hover:bg-gray-900 border border-transparent";
  }
  if (variant === "link" || variant === "outline-link") {
    return "bg-transparent text-kit-primary hover:underline border-0 shadow-none";
  }
  if (variant === "outline" || variant === "outline-primary") {
    return outlineStyle(
      "text-kit-primary hover:bg-kit-primary hover:text-kit-white",
      "border border-kit-primary",
      borderless
    );
  }
  if (variant === "outline-secondary") {
    return outlineStyle(
      "text-kit-secondary hover:bg-kit-secondary hover:text-kit-white",
      "border border-kit-secondary",
      borderless
    );
  }
  if (variant === "outline-success") {
    return outlineStyle(
      "text-kit-success hover:bg-kit-success hover:text-kit-white",
      "border border-kit-success",
      borderless
    );
  }
  if (variant === "outline-info") {
    return outlineStyle(
      "text-kit-info hover:bg-kit-info hover:text-kit-white",
      "border border-kit-info",
      borderless
    );
  }
  if (variant === "outline-warning") {
    return outlineStyle(
      "text-kit-warning hover:bg-kit-warning hover:text-kit-on-warning",
      "border border-kit-warning",
      borderless
    );
  }
  if (variant === "outline-danger") {
    return outlineStyle(
      "text-kit-danger hover:bg-kit-danger hover:text-kit-white",
      "border border-kit-danger",
      borderless
    );
  }
  if (variant === "outline-focus") {
    return outlineStyle(
      "text-kit-focus hover:bg-kit-focus hover:text-kit-white",
      "border border-slate-700",
      borderless
    );
  }
  if (variant === "outline-alternate") {
    return outlineStyle(
      "text-kit-alt hover:bg-kit-alt hover:text-kit-white",
      "border border-purple-700",
      borderless
    );
  }
  if (variant === "outline-light") {
    return outlineStyle("text-kit-dark hover:bg-kit-light", "border border-kit", borderless);
  }
  if (variant === "outline-dark") {
    return outlineStyle(
      "text-kit-dark hover:bg-kit-dark hover:text-kit-white",
      "border border-gray-800",
      borderless
    );
  }
  if (variant === "ghost") {
    return "bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent";
  }
  return "bg-kit-primary text-kit-white hover:bg-blue-700 border border-transparent shadow-kit-primary";
}

export function resolveButtonSize(size: ButtonSize): string {
  if (size === "sm" || size === "icon-sm") {
    return size === "icon-sm" ? "h-8 w-8 p-0 text-sm" : "px-2 py-1 text-sm";
  }
  if (size === "lg" || size === "xl") {
    return size === "xl" ? "px-8 py-2 text-sm" : "px-4 py-2 text-sm";
  }
  if (size === "icon" || size === "icon-lg") {
    return size === "icon-lg" ? "h-12 w-12 p-0 text-sm" : "h-10 w-10 p-0 text-sm";
  }
  return "px-3 py-1.5 text-sm";
}
