import type { ReactNode } from "react";

type CardTone =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "dark";

type CardProps = {
  children?: ReactNode;
  className?: string;
  tone?: CardTone;
  borderTone?: CardTone;
  shadowTone?: CardTone;
};

function toneBg(tone: CardTone): string {
  if (tone === "primary") return "bg-kit-primary text-kit-white ";
  if (tone === "secondary") return "bg-kit-secondary text-kit-white ";
  if (tone === "success") return "bg-kit-success text-kit-white ";
  if (tone === "info") return "bg-kit-info text-kit-white ";
  if (tone === "warning") return "bg-kit-warning text-kit-on-warning ";
  if (tone === "danger") return "bg-kit-danger text-kit-white ";
  if (tone === "focus") return "bg-kit-focus text-kit-white ";
  if (tone === "alternate") return "bg-kit-alt text-kit-white ";
  if (tone === "dark") return "bg-kit-dark text-kit-white ";
  return "bg-kit-white text-kit-body ";
}

function toneBorder(tone: CardTone): string {
  if (tone === "primary") return "border border-kit-primary ";
  if (tone === "secondary") return "border border-kit-secondary ";
  if (tone === "success") return "border border-kit-success ";
  if (tone === "info") return "border border-kit-info ";
  if (tone === "warning") return "border border-kit-warning ";
  if (tone === "danger") return "border border-kit-danger ";
  if (tone === "focus") return "border border-slate-700 ";
  if (tone === "alternate") return "border border-purple-700 ";
  if (tone === "dark") return "border border-gray-800 ";
  return "border-0 ";
}

function toneShadow(tone: CardTone): string {
  if (tone === "primary") return "shadow-md shadow-blue-600/20 ";
  if (tone === "secondary") return "shadow-md shadow-gray-500/20 ";
  if (tone === "success") return "shadow-md shadow-green-500/20 ";
  if (tone === "info") return "shadow-md shadow-sky-500/20 ";
  if (tone === "warning") return "shadow-md shadow-yellow-500/25 ";
  if (tone === "danger") return "shadow-md shadow-red-500/20 ";
  if (tone === "focus") return "shadow-md shadow-slate-700/25 ";
  if (tone === "alternate") return "shadow-md shadow-purple-700/25 ";
  return "shadow-kit-card ";
}

export function Card({
  children,
  className = "",
  tone = "default",
  borderTone,
  shadowTone,
}: CardProps) {
  let cardClass = "mb-3 rounded ";
  cardClass += toneBg(tone);
  if (borderTone) cardClass += toneBorder(borderTone);
  else if (tone === "default") cardClass += "border-0 ";
  if (shadowTone) cardClass += toneShadow(shadowTone);
  else if (tone === "default") cardClass += "shadow-kit-card ";
  cardClass += className;
  return <div className={cardClass}>{children}</div>;
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={"flex h-14 items-center border-b border-black/5 px-4 " + className}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardProps) {
  return <div className={"p-4 text-sm " + className}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div className={"flex items-center border-t border-black/5 px-4 py-2 text-sm " + className}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h5 className={"mb-2 text-sm font-bold uppercase text-kit-heading/70 " + className}>
      {children}
    </h5>
  );
}

export function CardSubtitle({ children, className = "" }: CardProps) {
  return (
    <h6 className={"mb-2 text-sm font-normal text-kit-muted " + className}>{children}</h6>
  );
}
