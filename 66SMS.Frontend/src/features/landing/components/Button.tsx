import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
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
    "landing-focus-ring inline-flex items-center justify-center gap-2 font-geist text-sm font-medium transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50 select-none";

  const variants = {
    primary:
      "rounded-full bg-lotus-rose text-white hover:bg-lotus-rose-dark px-6 py-2.5",
    secondary:
      "rounded-full border border-lotus-rose/30 bg-transparent text-lotus-rose hover:bg-lotus-rose hover:text-white px-6 py-2.5",
    ghost:
      "rounded-full text-lotus-rose hover:bg-lotus-rose/8 px-3 py-1.5",
  };

  const combinedClasses = `${baseStyle} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <a href={href} onClick={onClick} className={combinedClasses} id={id} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClasses} id={id} disabled={disabled}>
      {children}
    </button>
  );
};
