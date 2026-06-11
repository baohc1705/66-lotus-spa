import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function FormField({
  label,
  error,
  tooltip,
  children,
}: {
  label: string;
  error?: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "").trim();

  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-1 text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}
        {isRequired &&
          (tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-red-500 cursor-help hover:text-red-600 focus:outline-none select-none">
                  *
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-red-500">*</span>
          ))}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
