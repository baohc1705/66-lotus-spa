import type { ElementType, ReactNode } from "react";
import { LayoutGrid } from "lucide-react";

type DemoSectionProps = {
  title: string;
  children: ReactNode;
};

const cardShadow =
  "shadow-[0_0.46875rem_2.1875rem_rgba(8,32,92,0.03),0_0.9375rem_1.40625rem_rgba(8,32,92,0.03),0_0.25rem_0.53125rem_rgba(8,32,92,0.05),0_0.125rem_0.1875rem_rgba(8,32,92,0.03)]";

/** Architect: .main-card.card > .card-body > h5.card-title */
export function DemoSection(props: DemoSectionProps) {
  return (
    <div className={"main-card mb-3 rounded bg-white " + cardShadow}>
      <div className="card-body p-4">
        <h5 className="card-title mb-2 text-sm font-bold uppercase text-[rgba(36,59,107,0.7)]">
          {props.title}
        </h5>
        {props.children}
      </div>
    </div>
  );
}

type DemoPageShellProps = {
  title: string;
  subtitle?: string;
  icon?: ElementType;
  children: ReactNode;
};

/** Architect: .app-page-title (full-bleed under content) */
export function DemoPageShell(props: DemoPageShellProps) {
  const Icon = props.icon ?? LayoutGrid;

  return (
    <div className="font-sans text-sm text-[#495057]">
      <div className="app-page-title relative mb-4 bg-black/[0.03] p-4 md:p-6">
        <div className="page-title-wrapper relative flex items-center">
          <div
            className={
              "page-title-icon mr-6 flex h-15 w-15 shrink-0 items-center justify-center " +
              "rounded bg-white text-[#3f6ad8] " +
              cardShadow
            }
          >
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="page-title-heading m-0 text-lg font-normal leading-tight text-[#343a40]">
              {props.title}
            </div>
            {props.subtitle ? (
              <div className="page-title-subheading m-0 pt-0.5 text-sm font-normal opacity-60">
                {props.subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {props.children}
    </div>
  );
}

/** Architect .header-icon.icon-gradient */
export function HeaderIcon(props: {
  gradient?: "plum-plate" | "mixed-hopes" | "grow-early" | "love-kiss" | "tempting-azure" | "mean-fruit";
  className?: string;
}) {
  const g = props.gradient ?? "plum-plate";
  let bg = "bg-gradient-to-br from-[#9c2cf3] to-[#3a78f1]";
  if (g === "mixed-hopes") bg = "bg-gradient-to-br from-[#f86ca7] to-[#f4d444]";
  if (g === "grow-early") bg = "bg-gradient-to-br from-[#33d69f] to-[#3ac47d]";
  if (g === "love-kiss") bg = "bg-gradient-to-br from-[#ff0844] to-[#ffb199]";
  if (g === "tempting-azure") bg = "bg-gradient-to-br from-[#84fab0] to-[#8fd3f4]";
  if (g === "mean-fruit") bg = "bg-gradient-to-br from-[#fccb90] to-[#d57eeb]";

  return (
    <span
      className={
        "header-icon icon-gradient mr-2 inline-block h-6 w-6 shrink-0 rounded-sm " +
        bg +
        " " +
        (props.className ?? "")
      }
      aria-hidden
    />
  );
}
