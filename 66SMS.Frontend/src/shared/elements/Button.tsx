import type { ButtonHTMLAttributes, ReactNode } from "react";

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

export type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "default"
  | "xl"
  | "icon"
  | "icon-sm"
  | "icon-lg";

const KNOWN_VARIANTS = new Set<string>([
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "danger",
  "focus",
  "alternate",
  "light",
  "dark",
  "link",
  "outline",
  "outline-primary",
  "outline-secondary",
  "outline-success",
  "outline-info",
  "outline-warning",
  "outline-danger",
  "outline-focus",
  "outline-alternate",
  "outline-light",
  "outline-dark",
  "outline-link",
  "ghost",
  "default",
  "destructive",
  "admin",
  "gold",
]);

function outlineStyle(
  colorClasses: string,
  borderClasses: string,
  borderless = false,
): string {
  return (
    "bg-transparent " +
    colorClasses +
    " " +
    (borderless ? "border-0" : borderClasses)
  );
}

const solidPrimary =
  "bg-kit-primary text-kit-white hover:bg-blue-700 border border-transparent shadow-kit-primary";

function resolveButtonVariant(
  variant: ButtonVariant | string | undefined,
  borderless = false,
): string {
  const key = variant && KNOWN_VARIANTS.has(variant) ? variant : "primary";

  if (key === "primary" || key === "default" || key === "admin") {
    return solidPrimary;
  }
  if (key === "secondary") {
    return "bg-kit-secondary text-kit-white hover:bg-gray-600 border border-transparent";
  }
  if (key === "success") {
    return "bg-kit-success text-kit-white hover:bg-green-600 border border-transparent";
  }
  if (key === "info") {
    return "bg-kit-info text-kit-white hover:bg-sky-600 border border-transparent";
  }
  if (key === "warning" || key === "gold") {
    return "bg-kit-warning text-kit-on-warning hover:bg-yellow-500 border border-transparent";
  }
  if (key === "danger" || key === "destructive") {
    return "bg-kit-danger text-kit-white hover:bg-red-700 border border-transparent";
  }
  if (key === "focus") {
    return "bg-kit-focus text-kit-white hover:bg-slate-800 border border-transparent";
  }
  if (key === "alternate") {
    return "bg-kit-alt text-kit-white hover:bg-purple-800 border border-transparent";
  }
  if (key === "light") {
    return "bg-kit-light text-kit-dark hover:bg-gray-200 border border-transparent";
  }
  if (key === "dark") {
    return "bg-kit-dark text-kit-white hover:bg-gray-900 border border-transparent";
  }
  if (key === "link" || key === "outline-link") {
    return "bg-transparent text-kit-primary hover:underline border-0 shadow-none";
  }
  if (key === "outline" || key === "outline-primary") {
    return outlineStyle(
      "text-kit-primary hover:bg-kit-primary hover:text-kit-white",
      "border border-kit-primary",
      borderless,
    );
  }
  if (key === "outline-secondary") {
    return outlineStyle(
      "text-kit-secondary hover:bg-kit-secondary hover:text-kit-white",
      "border border-kit-secondary",
      borderless,
    );
  }
  if (key === "outline-success") {
    return outlineStyle(
      "text-kit-success hover:bg-kit-success hover:text-kit-white",
      "border border-kit-success",
      borderless,
    );
  }
  if (key === "outline-info") {
    return outlineStyle(
      "text-kit-info hover:bg-kit-info hover:text-kit-white",
      "border border-kit-info",
      borderless,
    );
  }
  if (key === "outline-warning") {
    return outlineStyle(
      "text-kit-warning hover:bg-kit-warning hover:text-kit-on-warning",
      "border border-kit-warning",
      borderless,
    );
  }
  if (key === "outline-danger") {
    return outlineStyle(
      "text-kit-danger hover:bg-kit-danger hover:text-kit-white",
      "border border-kit-danger",
      borderless,
    );
  }
  if (key === "outline-focus") {
    return outlineStyle(
      "text-kit-focus hover:bg-kit-focus hover:text-kit-white",
      "border border-slate-700",
      borderless,
    );
  }
  if (key === "outline-alternate") {
    return outlineStyle(
      "text-kit-alt hover:bg-kit-alt hover:text-kit-white",
      "border border-purple-700",
      borderless,
    );
  }
  if (key === "outline-light") {
    return outlineStyle(
      "text-kit-dark hover:bg-kit-light",
      "border border-kit",
      borderless,
    );
  }
  if (key === "outline-dark") {
    return outlineStyle(
      "text-kit-dark hover:bg-kit-dark hover:text-kit-white",
      "border border-gray-800",
      borderless,
    );
  }
  if (key === "ghost") {
    return "bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent";
  }
  return solidPrimary;
}

function resolveButtonSize(size: ButtonSize | string | undefined): string {
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

function resolveButtonShadow(variant: ButtonVariant | string): string {
  if (variant === "primary" || variant === "default" || variant === "admin") {
    return "shadow-kit-primary ";
  }
  if (
    variant === "success" ||
    variant === "danger" ||
    variant === "destructive" ||
    variant === "warning" ||
    variant === "gold" ||
    variant === "info"
  ) {
    return "shadow-sm ";
  }
  return "";
}

/** Dung cho Tabs / Dropdown (cung style Button) */
// eslint-disable-next-line react-refresh/only-export-components -- Tabs/Dropdown can style chung, khong tach file
export { resolveButtonVariant, resolveButtonSize };

type ButtonProps = {
  variant?: ButtonVariant | string;
  size?: ButtonSize | string;
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;
  pill?: boolean;
  wide?: boolean;
  block?: boolean;
  borderless?: boolean;
  shadow?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  className?: string;
  children?: ReactNode;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  title?: string;
  "aria-label"?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  active = false,
  pill = false,
  wide = false,
  block = false,
  borderless = false,
  shadow = false,
  type = "button",
  className = "",
  children,
  onClick,
  title,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  let buttonClass =
    "mb-2 mr-2 inline-flex items-center justify-center gap-0 font-medium leading-normal " +
    "font-sans transition-all disabled:opacity-65 disabled:cursor-not-allowed ";

  buttonClass += resolveButtonVariant(variant, borderless) + " ";
  buttonClass += resolveButtonSize(size) + " ";
  buttonClass += pill ? "rounded-full " : "rounded ";
  if (wide) buttonClass += "px-6! ";
  if (block) buttonClass += "mb-2 w-full ";
  if (active) buttonClass += "brightness-90 shadow-none! ";
  if (shadow && !active) buttonClass += resolveButtonShadow(variant);
  if (className) buttonClass += className;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={buttonClass}
    >
      {loading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  );
}

type ButtonGroupProps = {
  children: ReactNode;
  className?: string;
};

export function ButtonGroup({ children, className = "" }: ButtonGroupProps) {
  return (
    <div className={"btn-group " + className} role="group">
      {children}
    </div>
  );
}
