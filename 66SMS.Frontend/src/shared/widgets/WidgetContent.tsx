import type { ReactNode } from "react";

/** Tên khớp utility `gradient-*` trong admin.utilities.css */
export type WidgetGradient =
  | "happy-green"
  | "premium-dark"
  | "love-kiss"
  | "grow-early"
  | "strong-bliss"
  | "warm-flame"
  | "tempting-azure"
  | "sunny-morning"
  | "mean-fruit"
  | "night-fade"
  | "heavy-rain"
  | "amy-crisp"
  | "malibu-beach"
  | "deep-blue"
  | "mixed-hopes"
  | "happy-itmeo"
  | "happy-fisher"
  | "arielle-smile"
  | "ripe-malin"
  | "vicious-stance"
  | "midnight-bloom"
  | "night-sky"
  | "slick-carbon"
  | "royal"
  | "asteroid";

export type WidgetTone = "default" | WidgetGradient;

export type WidgetValueTone =
  | "default"
  | "success"
  | "primary"
  | "warning"
  | "danger"
  | "info"
  | "focus"
  | "white"
  | "dark"
  | "muted";

export type WidgetShadowTone = "danger" | "success" | "warning" | "info" | "primary";

// Chuỗi class đầy đủ để Tailwind scan được
const GRADIENT_CLASS: Record<WidgetGradient, string> = {
  "happy-green": "gradient-happy-green",
  "premium-dark": "gradient-premium-dark",
  "love-kiss": "gradient-love-kiss",
  "grow-early": "gradient-grow-early",
  "strong-bliss": "gradient-strong-bliss",
  "warm-flame": "gradient-warm-flame",
  "tempting-azure": "gradient-tempting-azure",
  "sunny-morning": "gradient-sunny-morning",
  "mean-fruit": "gradient-mean-fruit",
  "night-fade": "gradient-night-fade",
  "heavy-rain": "gradient-heavy-rain",
  "amy-crisp": "gradient-amy-crisp",
  "malibu-beach": "gradient-malibu-beach",
  "deep-blue": "gradient-deep-blue",
  "mixed-hopes": "gradient-mixed-hopes",
  "happy-itmeo": "gradient-happy-itmeo",
  "happy-fisher": "gradient-happy-fisher",
  "arielle-smile": "gradient-arielle-smile",
  "ripe-malin": "gradient-ripe-malin",
  "vicious-stance": "gradient-vicious-stance",
  "midnight-bloom": "gradient-midnight-bloom",
  "night-sky": "gradient-night-sky",
  "slick-carbon": "gradient-slick-carbon",
  royal: "gradient-royal",
  asteroid: "gradient-asteroid",
};

function toneBg(tone: WidgetTone): string {
  if (tone === "default") return "bg-kit-white text-kit-body border-0 ";
  return GRADIENT_CLASS[tone] + " text-kit-white border-0 ";
}

function shadowToneClass(tone: WidgetShadowTone): string {
  if (tone === "danger") return "shadow-kit-danger ";
  if (tone === "success") return "shadow-kit-success ";
  if (tone === "warning") return "shadow-kit-warning ";
  if (tone === "info") return "shadow-kit-info ";
  return "shadow-kit-primary ";
}

function valueToneClass(tone: WidgetValueTone): string {
  if (tone === "success") return "text-kit-success";
  if (tone === "primary") return "text-kit-primary";
  if (tone === "warning") return "text-kit-warning";
  if (tone === "danger") return "text-kit-danger";
  if (tone === "info") return "text-kit-info";
  if (tone === "focus") return "text-kit-focus";
  if (tone === "white") return "text-kit-white";
  if (tone === "dark") return "text-kit-dark";
  if (tone === "muted") return "text-kit-muted";
  return "text-kit-body";
}

type BoxProps = {
  children?: ReactNode;
  className?: string;
  tone?: WidgetTone;
  shadowTone?: WidgetShadowTone;
  asCard?: boolean;
};

export function WidgetBox({
  children,
  className = "",
  tone = "default",
  shadowTone,
  asCard = true,
}: BoxProps) {
  let cls = "widget-content p-4 ";
  if (asCard) {
    cls += "mb-3 rounded " + toneBg(tone);
    cls += shadowTone ? shadowToneClass(shadowTone) : "shadow-kit-card ";
  }
  cls += className;
  return <div className={cls}>{children}</div>;
}

export function WidgetContentOuter({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div className={"flex flex-1 flex-col " + className}>{children}</div>;
}

export function WidgetContentWrapper({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={"relative flex flex-1 items-center " + className}>{children}</div>
  );
}

export function WidgetContentLeft({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div className={"widget-content-left min-w-0 " + className}>{children}</div>;
}

export function WidgetContentRight({
  children,
  className = "",
  push = true,
}: {
  children?: ReactNode;
  className?: string;
  push?: boolean;
}) {
  const align = push ? "ml-auto shrink-0 " : "shrink-0 ";
  return <div className={"widget-content-right " + align + className}>{children}</div>;
}

export function WidgetHeading({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={"text-sm font-bold opacity-80 " + className}>{children}</div>
  );
}

export function WidgetSubheading({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div className={"text-sm opacity-50 " + className}>{children}</div>;
}

export function WidgetNumbers({
  children,
  tone = "default",
  className = "",
  size = "lg",
}: {
  children?: ReactNode;
  tone?: WidgetValueTone;
  className?: string;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "md" ? "text-2xl" : "text-3xl";

  return (
    <div
      className={
        "block font-bold leading-none " +
        sizeClass +
        " " +
        valueToneClass(tone) +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}

export function WidgetProgressLabels({
  left,
  right,
  className = "",
}: {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={"mt-1 flex items-center text-sm opacity-50 " + className}>
      <div>{left}</div>
      <div className="ml-auto">{right}</div>
    </div>
  );
}

export function WidgetDivider({ className = "" }: { className?: string }) {
  return <div className={"mb-8 mt-0 h-px overflow-hidden bg-kit-track " + className} />;
}
