import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useUpdateMembershipCard } from "../hooks/useMembershipCards";
import { useMembershipTiers } from "../hooks/useMembershipTiers";
import {
  updateMembershipCardSchema,
  type MembershipCardFormValues,
} from "../schemas/membershipCard.schema";
import type { MembershipCardDto } from "../types/membershipCard.types";
import { Info } from "lucide-react";

interface MembershipCardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: MembershipCardDto | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Ngưng hoạt động" },
  { value: "2", label: "Tạm khóa" },
];

export function MembershipCardFormDialog({
  open,
  onOpenChange,
  card,
}: MembershipCardFormDialogProps) {
  const updateMutation = useUpdateMembershipCard();
  const isPending = updateMutation.isPending;

  // Fetch tiers for select dropdown
  const { data: tiersResult } = useMembershipTiers({ pageSize: 100 });
  const tiers = useMemo(
    () => tiersResult?.data?.items ?? [],
    [tiersResult?.data?.items],
  );

  const form = useForm<MembershipCardFormValues>({
    resolver: zodResolver(
      updateMembershipCardSchema,
    ) as Resolver<MembershipCardFormValues>,
    defaultValues: getDefaultValues(card),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(card));
    }
  }, [open, card, reset]);

  const onSubmit = (data: MembershipCardFormValues) => {
    if (card?.id) {
      updateMutation.mutate(
        { id: card.id, payload: data },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    }
  };

  // Handle format datetime-local input correctly
  const handleDateChange = (field: "issuedAt" | "expiresAt", value: string) => {
    if (value) {
      const date = new Date(value);
      setValue(field, date.toISOString());
    } else {
      setValue(field, "");
    }
  };

  const getDatetimeLocalFormat = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Format to yyyy-MM-ddThh:mm
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cập nhật thẻ thành viên</DialogTitle>
          <DialogDescription>
            {`Chỉnh sửa thông tin thẻ của khách hàng ${card.customerName ?? ""}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <FormField label="Mã thẻ *" error={errors.cardCode?.message}>
              <Input
                {...register("cardCode")}
                placeholder="Nhập mã thẻ"
                className="h-9 text-[13px]"
              />
            </FormField>

            <FormField
              label="Loại thẻ"
              error={errors.membershipTierId?.message}
            >
              <Select
                value={watch("membershipTierId")?.toString() ?? ""}
                onValueChange={(v) => setValue("membershipTierId", Number(v))}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn loại thẻ" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id!.toString()}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Ngày cấp" error={errors.issuedAt?.message}>
              <Input
                type="datetime-local"
                value={getDatetimeLocalFormat(watch("issuedAt"))}
                onChange={(e) => handleDateChange("issuedAt", e.target.value)}
                className="h-9 text-[13px]"
              />
            </FormField>

            <FormField
              label="Ngày hết hạn"
              tooltip="Để trống nếu thẻ có giá trị vĩnh viễn"
              error={errors.expiresAt?.message}
            >
              <Input
                type="datetime-local"
                value={getDatetimeLocalFormat(watch("expiresAt"))}
                onChange={(e) => handleDateChange("expiresAt", e.target.value)}
                className="h-9 text-[13px]"
              />
            </FormField>

            <FormField label="Trạng thái" className="sm:col-span-2">
              <Select
                value={watch("status")?.toString() ?? "1"}
                onValueChange={(v) => setValue("status", Number(v))}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
              Cập nhật thẻ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
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
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="flex items-center gap-1.5 text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}
        {isRequired && <span className="text-red-500">*</span>}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-lotus-stone cursor-help hover:text-lotus-leaf transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function parseVietnamDateToIso(dateStr?: string | null): string {
  if (!dateStr) return "";
  if (dateStr.includes("/") && dateStr.includes(" ")) {
    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("/");
    const [hour, minute, second] = timePart.split(":");
    return `${year}-${month}-${day}T${hour}:${minute}:${second ?? "00"}Z`;
  }
  return dateStr;
}

function getDefaultValues(
  card?: MembershipCardDto | null,
): MembershipCardFormValues {
  if (card) {
    return {
      membershipTierId: card.membershipTierId ?? undefined,
      cardCode: card.cardCode ?? "",
      issuedAt: parseVietnamDateToIso(card.issuedAt),
      expiresAt: parseVietnamDateToIso(card.expiresAt),
      status: card.status,
    };
  }
  return {
    membershipTierId: undefined,
    cardCode: "",
    issuedAt: "",
    expiresAt: "",
    status: 1,
  };
}
