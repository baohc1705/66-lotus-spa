import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type NavProps = {
  children?: ReactNode;
  className?: string;
  vertical?: boolean;
  pills?: boolean;
  justified?: boolean;
};

type NavItemProps = {
  children?: ReactNode;
  className?: string;
  header?: boolean;
  divider?: boolean;
};

type NavLinkProps = {
  children?: ReactNode;
  className?: string;
  to?: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function Nav({
  children,
  className = "",
  vertical = false,
  pills = false,
  justified = false,
}: NavProps) {
  let navClass = "flex flex-wrap gap-1 ";
  if (vertical) navClass += "flex-col ";
  if (justified) navClass += "nav-justified ";
  if (pills) navClass += "nav-pills ";
  return <nav className={navClass + className}>{children}</nav>;
}

export function NavItem({
  children,
  className = "",
  header = false,
  divider = false,
}: NavItemProps) {
  if (divider) {
    return <div className={"my-2 border-t border-kit " + className} />;
  }
  if (header) {
    return (
      <div className={"px-4 py-2 text-xs font-bold uppercase tracking-wide text-kit-muted " + className}>
        {children}
      </div>
    );
  }
  return <div className={"flex " + className}>{children}</div>;
}

export function NavLink({
  children,
  className = "",
  to,
  href,
  active = false,
  disabled = false,
  onClick,
}: NavLinkProps) {
  let linkClass =
    "inline-flex w-full items-center gap-2 rounded px-4 py-2 text-sm font-normal " +
    "font-sans transition-colors ";

  if (disabled) {
    linkClass += "pointer-events-none text-kit-muted opacity-50 ";
  } else if (active) {
    linkClass += "bg-kit-primary text-kit-white ";
  } else {
    linkClass += "text-kit-body hover:bg-kit-primary/10 hover:text-kit-primary ";
  }

  linkClass += className;

  if (to) {
    return (
      <Link to={to} className={linkClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={linkClass} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} className={linkClass} onClick={onClick}>
      {children}
    </button>
  );
}
