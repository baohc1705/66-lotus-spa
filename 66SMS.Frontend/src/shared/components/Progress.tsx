export type ProgressTone =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "light"
  | "dark";

type ProgressSegment = {
  value: number;
  tone?: ProgressTone;
  label?: string;
  striped?: boolean;
  animated?: boolean;
};

type ProgressSize = "xs" | "sm" | "md" | "lg";

type ProgressProps = {
  value?: number;
  max?: number;
  tone?: ProgressTone;
  label?: string;
  caption?: string;
  showPercent?: boolean;
  striped?: boolean;
  animated?: boolean;
  size?: ProgressSize;
  segments?: ProgressSegment[];
  className?: string;
};

function sizeHeight(size: ProgressSize): string {
  if (size === "xs") return "h-0.5";
  if (size === "sm") return "h-2";
  if (size === "lg") return "h-5";
  return "h-4";
}

function toneBg(tone: ProgressTone): string {
  if (tone === "secondary") return "bg-kit-secondary";
  if (tone === "success") return "bg-kit-success";
  if (tone === "info") return "bg-kit-info";
  if (tone === "warning") return "bg-kit-warning text-kit-on-warning";
  if (tone === "danger") return "bg-kit-danger";
  if (tone === "focus") return "bg-kit-focus";
  if (tone === "alternate") return "bg-kit-alt";
  if (tone === "light") return "bg-kit-light text-kit-dark";
  if (tone === "dark") return "bg-kit-dark";
  return "bg-kit-primary";
}

function stripeClass(striped: boolean, animated: boolean): string {
  if (!striped && !animated) return "";
  let cls = "progress-bar-striped ";
  if (animated) cls += "animate-progress-bar-stripes ";
  return cls;
}

export function Progress({
  value = 0,
  max = 100,
  tone = "primary",
  label,
  caption,
  showPercent = false,
  striped = false,
  animated = false,
  size = "md",
  segments,
  className = "",
}: ProgressProps) {
  const bars: ProgressSegment[] =
    segments ??
    [
      {
        value,
        tone,
        label: label,
        striped,
        animated,
      },
    ];

  const rootMargin = /\bmb-/.test(className) ? "" : "mb-3 ";

  return (
    <div className={rootMargin + className}>
      {caption || showPercent ? (
        <div
          className={
            "mb-1 flex items-center justify-between text-sm text-kit-body"
          }
        >
          <span>{caption ?? ""}</span>
          {showPercent || caption ? (
            <span>{Math.round((value / max) * 100)}%</span>
          ) : null}
        </div>
      ) : null}
      <div
        className={
          "flex w-full overflow-hidden rounded bg-kit-track text-xs font-sans " +
          sizeHeight(size)
        }
      >
        {bars.map((bar: ProgressSegment, index: number) => {
          const width = Math.max(0, Math.min(100, (bar.value / max) * 100));
          const barTone = bar.tone ?? "primary";
          return (
            <div
              key={index}
              role="progressbar"
              aria-valuenow={bar.value}
              aria-valuemin={0}
              aria-valuemax={max}
              className={
                "flex items-center justify-center transition-all " +
                (barTone === "light" || barTone === "warning"
                  ? ""
                  : "text-white ") +
                toneBg(barTone) +
                " " +
                stripeClass(!!bar.striped, !!bar.animated)
              }
              style={{ width: width + "%" }}
            >
              {bar.label ? <span className="px-1 truncate">{bar.label}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
