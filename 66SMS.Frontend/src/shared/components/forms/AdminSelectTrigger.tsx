import { SelectTrigger } from "@/shared/components/ui/select";
import { cn } from "@/lib/utils";

export function AdminSelectTrigger({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      className={cn("lotus-admin-select-trigger", className)}
      {...props}
    />
  );
}
