import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  className?: string;
  children: React.ReactNode;
  id?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  target?: string;
  rel?: string;
}

export const Button = ({
  variant = "primary",
  href,
  onClick,
  className = "",
  children,
  id,
  type = "button",
  disabled,
  target,
  rel,
}: ButtonProps) => {
  const baseStyle =
    "landing-focus-ring inline-flex items-center justify-center gap-2 font-geist text-sm font-medium transition-colors duration-300 disabled:pointer-events-none disabled:bg-warm-50 disabled:text-warm-300 select-none";

  const variants = {
    primary:
      "rounded-full bg-rose-600 text-white hover:bg-rose-500 px-6 py-2.5",
    secondary:
      "rounded-full border border-warm-300 bg-transparent text-ink hover:border-rose-400 hover:text-rose-600 px-6 py-2.5",
    ghost: "rounded-full text-rose-600 hover:bg-rose-50 px-3 py-1.5",
  };

  const combinedClasses =
    `${baseStyle} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={combinedClasses}
        id={id}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      id={id}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
