import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AdminTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea className={cn("lotus-admin-textarea", className)} {...props} />
  );
}
