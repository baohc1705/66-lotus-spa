import type { ReactNode } from "react";
import { Progress, type ProgressTone } from "@/shared/components/Progress";
import {
  WidgetBox,
  WidgetContentLeft,
  WidgetContentOuter,
  WidgetContentRight,
  WidgetContentWrapper,
  WidgetHeading,
  WidgetNumbers,
  WidgetProgressLabels,
  WidgetSubheading,
  type WidgetShadowTone,
  type WidgetTone,
  type WidgetValueTone,
} from "./WidgetContent";

type StatCardProps = {
  title: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: string;
  tone?: WidgetTone;
  valueTone?: WidgetValueTone;
  shadowTone?: WidgetShadowTone;
  numberFirst?: boolean;
  progress?: {
    value: number;
    tone?: ProgressTone;
    size?: "xs" | "sm" | "md" | "lg";
    animated?: boolean;
    leftLabel?: string;
    rightLabel?: string;
  };
};

export function StatCard({
  title,
  value,
  description,
  className,
  tone = "default",
  valueTone,
  shadowTone,
  numberFirst = false,
  progress,
}: StatCardProps) {
  const isGradient = tone !== "default";
  const resolvedValueTone: WidgetValueTone =
    valueTone ?? (isGradient ? "white" : "default");

  const headingBlock = (
    <WidgetContentLeft>
      <WidgetHeading className={isGradient ? "!opacity-100" : undefined}>
        {title}
      </WidgetHeading>
      {description ? (
        <WidgetSubheading className={isGradient ? "!opacity-90" : "!opacity-80"}>
          {description}
        </WidgetSubheading>
      ) : null}
    </WidgetContentLeft>
  );

  const valueBlock = (
    <WidgetContentRight
      push={!numberFirst}
      className={numberFirst ? "mr-3" : undefined}
    >
      <WidgetNumbers
        tone={resolvedValueTone}
        className={isGradient ? "drop-shadow-sm" : undefined}
      >
        {value}
      </WidgetNumbers>
    </WidgetContentRight>
  );

  const row = numberFirst ? (
    <>
      {valueBlock}
      {headingBlock}
    </>
  ) : (
    <>
      {headingBlock}
      {valueBlock}
    </>
  );

  if (progress) {
    return (
      <WidgetBox tone={tone} shadowTone={shadowTone} className={className}>
        <WidgetContentOuter>
          <WidgetContentWrapper>{row}</WidgetContentWrapper>
          <div className="mt-4">
            <Progress
              value={progress.value}
              tone={progress.tone ?? "primary"}
              size={progress.size ?? "xs"}
              animated={progress.animated}
              className="mb-0"
            />
            {progress.leftLabel || progress.rightLabel ? (
              <WidgetProgressLabels
                left={progress.leftLabel}
                right={progress.rightLabel}
              />
            ) : null}
          </div>
        </WidgetContentOuter>
      </WidgetBox>
    );
  }

  return (
    <WidgetBox tone={tone} shadowTone={shadowTone} className={className}>
      <WidgetContentWrapper className={isGradient ? "text-kit-white" : undefined}>
        {row}
      </WidgetContentWrapper>
    </WidgetBox>
  );
}
