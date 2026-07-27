import logoHomeUrl from "@/assets/logo-home.png";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light" | "rose";
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
}

const sizeConfig = {
  sm: { img: "h-8 w-auto", text: "text-base", tagline: "text-3xs tracking-widest" },
  md: { img: "h-10 w-auto", text: "text-lg", tagline: "text-3xs tracking-widest" },
  lg: { img: "h-14 w-auto", text: "text-xl", tagline: "text-2xs tracking-widest" },
};

const colorConfig = {
  dark: { name: "text-[var(--spa-text)]", tagline: "text-[var(--spa-text-muted)]" },
  light: { name: "text-white", tagline: "text-white/60" },
  rose: { name: "text-[var(--spa-rose)]", tagline: "text-[var(--spa-text-muted)]" },
};

export function Logo({
  size = "md",
  variant = "dark",
  showTagline = false,
  taglineText,
  className,
}: LogoProps) {
  const s = sizeConfig[size];
  const c = colorConfig[variant];
  const isOnDark = variant === "light";

  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 select-none group cursor-pointer ${className || ''}`.trim()}
    >
      <img
        src={logoHomeUrl}
        alt="Hoa Sen Spa Logo"
        className={`object-contain shrink-0 drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-105 ${
          isOnDark
            ? "logo-icon-gold h-8 w-auto opacity-95"
            : s.img
        }`.trim()}
      />

      {isOnDark ? (
        <div className="flex flex-col leading-none justify-center">
          <span className="font-semibold text-xs tracking-wide text-white font-sans uppercase">
            HOA SEN
          </span>
          <span className="text-3xs tracking-[0.24em] uppercase font-sans mt-0.5 text-white/60">
            SPA & SALON
          </span>
        </div>
      ) : (
        <div className="flex flex-col leading-none justify-center">
          <span
            className={`font-semibold tracking-tight transition-colors duration-300 font-sans ${s.text} ${c.name}`.trim()}
          >
            HOA SEN <span className="font-light italic">Spa</span>
          </span>
          {showTagline && (
            <span
              className={`font-medium mt-1 uppercase opacity-90 transition-colors duration-300 font-sans ${s.tagline} ${c.tagline}`.trim()}
            >
              {taglineText || "Beauty & Wellness"}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
