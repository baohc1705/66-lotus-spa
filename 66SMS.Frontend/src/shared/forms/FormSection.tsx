import type { ReactNode, ElementType } from "react";

type FormSectionProps = {
  title: string;
  icon?: ElementType;
  children?: ReactNode;
  className?: string;
};

export function FormSection({
  title,
  icon: Icon,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <section className={"space-y-3 " + className}>
      <div className="flex items-center gap-2 border-b border-kit pb-2">
        {Icon ? <Icon className="h-4 w-4 text-kit-primary" /> : null}
        <h3 className="text-sm font-semibold text-kit-heading">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
