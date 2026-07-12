import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  error,
  tooltip,
  className,
  children,
}: {
  label: string;
  error?: string;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "").trim();

  return (
    <div className={cn("space-y-1", className)}>
      <Label className="lotus-admin-form-label">
        {cleanLabel}
        {isRequired &&
          (tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-state-danger-text cursor-help hover:text-state-danger-text focus:outline-none select-none">
                  *
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-state-danger-text">*</span>
          ))}
      </Label>
      {children}
      {error && <p className="lotus-admin-form-error">{error}</p>}
    </div>
  );
}
