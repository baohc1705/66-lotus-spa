import { Input } from "@/shared/components/ui/input";
import { cn } from "@/lib/utils";

export function AdminInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input className={cn("lotus-admin-input", className)} {...props} />;
}
