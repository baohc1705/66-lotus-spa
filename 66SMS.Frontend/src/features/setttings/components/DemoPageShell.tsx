import type { ElementType, ReactNode } from "react";
import { LayoutGrid } from "lucide-react";

type DemoSectionProps = {
  title: string;
  children: ReactNode;
};

/** Architect: .main-card.card > .card-body > h5.card-title */
export function DemoSection(props: DemoSectionProps) {
  return (
    <div className="main-card mb-3 rounded bg-kit-white shadow-kit-card">
      <div className="card-body p-4">
        <h5 className="card-title mb-2 text-sm font-bold uppercase text-kit-heading">
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
    <div className="font-sans text-sm text-kit-body">
      <div className="app-page-title relative mb-4 bg-black/3 p-4 md:p-6">
        <div className="page-title-wrapper relative flex items-center">
          <div
            className={
              "page-title-icon mr-6 flex h-15 w-15 shrink-0 items-center justify-center " +
              "rounded bg-kit-white text-kit-primary shadow-kit-card"
            }
          >
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="page-title-heading m-0 text-lg font-normal leading-tight text-kit-heading">
              {props.title}
            </div>
            {props.subtitle ? (
              <div className="page-title-subheading m-0 pt-0.5 text-sm font-normal text-kit-muted">
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

/** Architect .header-icon.icon-gradient — dung class gradient-* trong utilities */
export function HeaderIcon(props: {
  gradient?:
    | "plum-plate"
    | "mixed-hopes"
    | "grow-early"
    | "love-kiss"
    | "tempting-azure"
    | "mean-fruit";
  className?: string;
}) {
  const g = props.gradient ?? "plum-plate";
  return (
    <span
      className={
        "header-icon icon-gradient mr-2 inline-block h-6 w-6 shrink-0 rounded-sm " +
        "gradient-" +
        g +
        " " +
        (props.className ?? "")
      }
      aria-hidden
    />
  );
}
