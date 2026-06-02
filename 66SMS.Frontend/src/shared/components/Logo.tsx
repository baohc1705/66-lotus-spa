import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo-home.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light" | "rose";
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
}

const sizeConfig = {
  sm: { img: "h-10 w-auto", text: "text-lg", tagline: "text-[9px] tracking-widest" },
  md: { img: "h-14 w-auto", text: "text-xl", tagline: "text-[10px] tracking-widest" },
  lg: { img: "h-20 w-auto", text: "text-2xl", tagline: "text-xs tracking-widest" },
};

const colorConfig = {
  dark: { name: "text-[var(--spa-text)]", tagline: "text-[var(--spa-text-muted)]" },
  light: { name: "text-white", tagline: "text-[rgba(252,211,77,0.8)]" },
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

  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3 select-none group cursor-pointer",
        className,
      )}
    >
      <img
        src={logoUrl}
        alt="Lotus Spa Logo"
        className={cn(
          "object-contain shrink-0 filter drop-shadow-md transition-transform duration-500 ease-out group-hover:scale-105",
          s.img,
        )}
      />
      <div className="flex flex-col leading-none justify-center">
        <span
          className={cn(
            "font-bold tracking-tight transition-colors duration-300 font-serif",
            s.text,
            c.name,
          )}
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Lotus <span className="font-light italic">Spa</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "font-semibold mt-1 uppercase opacity-90 transition-colors duration-300",
              s.tagline,
              c.tagline,
            )}
          >
            {taglineText || "Beauty & Wellness"}
          </span>
        )}
      </div>
    </Link>
  );
}
