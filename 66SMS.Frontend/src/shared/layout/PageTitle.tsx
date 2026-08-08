type PageTitleProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
};

export function PageTitle({
  title,
  subtitle,
  actions,
  className,
  icon,
}: PageTitleProps) {
  return (
    <div
      className={
        "mb-5 rounded-md border border-gray-200 bg-white px-4 py-4 shadow-sm md:px-5 " +
        (className ?? "")
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
