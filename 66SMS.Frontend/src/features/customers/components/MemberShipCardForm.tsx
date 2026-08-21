import { useCustomers } from "@/features/customers/hooks/useCustomers";
import {
  useCreateMembershipCard,
  useUpdateMembershipCard,
} from "@/features/customers/hooks/useMembershipCards";
import { useMembershipTiers } from "@/features/customers/hooks/useMembershipTiers";
import type { CustomerDto } from "@/features/customers/types/customer.types";
import type {
  CreateMembershipCardRequest,
  MembershipCardDto,
  UpdateMembershipCardRequest,
} from "@/features/customers/types/membershipCard.types";
import type { MembershipTierDto } from "@/features/customers/types/membershipTier.types";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import {
  localDateTimeToUtc,
  toDatetimeLocalInput,
} from "@/shared/utils/date.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "2", label: "Hết hạn" },
  { value: "3", label: "Đã thu hồi" },
];

const membershipCardSchema = z.object({
  customerId: z.coerce.number().min(1, "Vui lòng chọn khách hàng"),
  membershipTierId: z.coerce.number().optional(),
  cardCode: z
    .string()
    .min(1, "Mã thẻ không được để trống")
    .max(50, "Tối đa 50 ký tự"),
  issuedAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  status: z.coerce.number().min(1),
});

const updateMembershipCardSchema = membershipCardSchema
  .omit({ customerId: true })
  .partial()
  .extend({
    cardCode: z
      .string()
      .min(1, "Mã thẻ không được để trống")
      .max(50, "Tối đa 50 ký tự"),
    status: z.coerce.number().min(1),
  });

type MembershipCardFormData = z.infer<typeof membershipCardSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: MembershipCardDto | null;
}

function getDefaultValues(
  card?: MembershipCardDto | null,
): MembershipCardFormData {
  if (card) {
    return {
      customerId: card.customerId ?? 0,
      membershipTierId: card.membershipTierId ?? undefined,
      cardCode: card.cardCode ?? "",
      issuedAt: toDatetimeLocalInput(card.issuedAt),
      expiresAt: toDatetimeLocalInput(card.expiresAt),
      status: card.status ?? 1,
    };
  }

  return {
    customerId: 0,
    membershipTierId: undefined,
    cardCode: "",
    issuedAt: "",
    expiresAt: "",
    status: 1,
  };
}

export function MembershipCardForm({ open, onOpenChange, card }: Props) {
  const isEdit = !!card?.id;
  const createMutation = useCreateMembershipCard();
  const updateMutation = useUpdateMembershipCard();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: customersResult } = useCustomers({
    pageIndex: 1,
    pageSize: 100,
  });
  const customers = customersResult?.data?.items ?? [];

  const { data: tiersResult } = useMembershipTiers({
    pageIndex: 1,
    pageSize: 100,
  });
  const tiers = tiersResult?.data?.items ?? [];

  const customerOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < customers.length; index++) {
    const customer = customers[index] as CustomerDto;
    if (!customer.id) continue;
    customerOptions.push({
      value: String(customer.id),
      label: `${customer.fullName}`,
    });
  }

  const tierOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < tiers.length; index++) {
    const tier = tiers[index] as MembershipTierDto;
    if (!tier.id) continue;
    tierOptions.push({
      value: String(tier.id),
      label: `${tier.name}`,
    });
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MembershipCardFormData>({
    resolver: zodResolver(
      isEdit ? updateMembershipCardSchema : membershipCardSchema,
    ) as Resolver<MembershipCardFormData>,
    defaultValues: getDefaultValues(null),
  });

  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${card?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      reset(getDefaultValues(card));
    }
  }

  const customerId = useWatch({ control, name: "customerId" });
  const membershipTierId = useWatch({ control, name: "membershipTierId" });
  const status = useWatch({ control, name: "status" });

  function onSubmit(values: MembershipCardFormData) {
    const datePayload = {
      membershipTierId: values.membershipTierId ?? undefined,
      cardCode: values.cardCode,
      issuedAt:
        values.issuedAt === ""
          ? undefined
          : localDateTimeToUtc(values.issuedAt),
      expiresAt:
        values.expiresAt === ""
          ? undefined
          : localDateTimeToUtc(values.expiresAt),
      status: values.status,
    };

    if (isEdit && card?.id) {
      const payload: UpdateMembershipCardRequest = datePayload;
      updateMutation.mutate(
        { id: card.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
      return;
    }

    const payload: CreateMembershipCardRequest = {
      customerId: values.customerId,
      ...datePayload,
    };
    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        onOpenChange(false);
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Cập nhật thẻ thành viên" : "Thêm thẻ thành viên mới"}
      size="lg"
      scrollable
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="membership-card-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật thẻ" : "Tạo thẻ"}
          </Button>
        </>
      }
    >
      <form
        id="membership-card-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormSection icon={CreditCard} title="Thông tin thẻ thành viên">
          <FormRow>
            {isEdit ? (
              <FormField label="Khách hàng">
                <Input value={card?.customerName ?? "—"} readOnly disabled />
              </FormField>
            ) : (
              <FormField
                label="Khách hàng"
                required
                error={errors.customerId?.message}
              >
                <SearchableSelect
                  value={customerId ? String(customerId) : ""}
                  onChange={(value) => setValue("customerId", Number(value))}
                  options={customerOptions}
                  placeholder="Chọn khách hàng"
                  invalid={!!errors.customerId}
                  searchPlaceholder="Tìm khách hàng"
                  emptyText="Không tìm thấy"
                  clearable={false}
                />
              </FormField>
            )}

            <FormField label="Mã thẻ" required error={errors.cardCode?.message}>
              <Input
                {...register("cardCode")}
                placeholder="Nhập mã thẻ"
                invalid={!!errors.cardCode}
              />
            </FormField>

            <FormField
              label="Loại thẻ"
              error={errors.membershipTierId?.message}
            >
              <SearchableSelect
                value={membershipTierId != null ? String(membershipTierId) : ""}
                onChange={(value) =>
                  setValue("membershipTierId", Number(value))
                }
                options={tierOptions}
                placeholder="Chọn loại thẻ"
                invalid={!!errors.membershipTierId}
                searchPlaceholder="Tìm loại thẻ"
                emptyText="Không tìm thấy"
                clearable={false}
              />
            </FormField>

            <FormField label="Trạng thái">
              <Select
                value={status != null ? String(status) : "1"}
                onChange={(event) =>
                  setValue("status", Number(event.target.value))
                }
                options={STATUS_OPTIONS}
                placeholder="Chọn trạng thái"
              />
            </FormField>

            <FormField label="Ngày cấp" error={errors.issuedAt?.message}>
              <Input
                type="datetime-local"
                {...register("issuedAt")}
                invalid={!!errors.issuedAt}
              />
            </FormField>

            <FormField
              label="Ngày hết hạn"
              tooltip="Để trống nếu thẻ có giá trị vĩnh viễn"
              error={errors.expiresAt?.message}
            >
              <Input
                type="datetime-local"
                {...register("expiresAt")}
                invalid={!!errors.expiresAt}
              />
            </FormField>
          </FormRow>
        </FormSection>
      </form>
    </Modal>
  );
}
