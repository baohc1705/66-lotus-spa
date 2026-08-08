type TablePageShellProps = {
  children: React.ReactNode;
  isFetching?: boolean;
  isLoading?: boolean;
};

export function TablePageShell({
  children,
  isFetching = false,
  isLoading = false,
}: TablePageShellProps) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-md border border-kit bg-kit-white shadow-kit-card">
        {children}
        {isFetching && !isLoading ? (
          <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-kit-track">
            <div className="h-full w-1/3 animate-pulse bg-kit-primary" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
