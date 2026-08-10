import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  resolveButtonSize,
  resolveButtonVariant,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonStyles";

export type { ButtonSize, ButtonVariant } from "./buttonStyles";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
}: ButtonProps) {
  const isDisabled = disabled || loading;
  let buttonClass =
    "mb-2 mr-2 inline-flex items-center justify-center gap-0 font-medium leading-normal " +
    "font-sans transition-all disabled:opacity-65 disabled:cursor-not-allowed ";

  buttonClass += resolveButtonVariant(variant, borderless) + " ";
  buttonClass += resolveButtonSize(size) + " ";
  buttonClass += pill ? "rounded-full " : "rounded ";
  if (wide) buttonClass += "!px-6 ";
  if (block) buttonClass += "mb-2 w-full ";
  if (active) buttonClass += "brightness-90 !shadow-none ";
  if (shadow && !active) {
    if (variant === "primary" || variant === "default" || variant === "admin") {
      buttonClass += "shadow-kit-primary ";
    } else if (variant === "success") {
      buttonClass += "shadow-sm ";
    } else if (variant === "danger" || variant === "destructive") {
      buttonClass += "shadow-sm ";
    } else if (variant === "warning" || variant === "gold") {
      buttonClass += "shadow-sm ";
    } else if (variant === "info") {
      buttonClass += "shadow-sm ";
    }
  }
  if (className) buttonClass += className;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
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
  size?: ButtonSize;
};

export function ButtonGroup({ children, className = "" }: ButtonGroupProps) {
  return (
    <div className={"btn-group " + className} role="group">
      {children}
    </div>
  );
}
