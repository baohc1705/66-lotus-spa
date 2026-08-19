import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useCreateBookingRoom,
  useUpdateBookingRoom,
} from "@/features/booking_rooms/hooks/useBookingRooms";
import type {
  BookingRoomDto,
  CreateBookingRoomRequest,
  UpdateBookingRoomRequest,
} from "@/features/booking_rooms/types/bookingRoom.types";
import { useAdminSalons } from "@/features/salons/hooks/useSalons";
import type { SalonDTO } from "@/features/salons/types/salon.types";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

// Validate dữ liệu client side
const createBookingRoomSchema = z.object({
  salonId: z.coerce.number().min(1, "Vui lòng chọn chi nhánh"),
  name: z
    .string()
    .nonempty("Tên phòng không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

const updateBookingRoomSchema = z.object({
  name: z
    .string()
    .nonempty("Tên phòng không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

type CreateBookingRoomFormData = z.infer<typeof createBookingRoomSchema>;
type UpdateBookingRoomFormData = z.infer<typeof updateBookingRoomSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingRoom?: BookingRoomDto | null;
}

// Hàm getDefaultValues để lấy giá trị mặc định cho form
function getCreateDefaultValues(
  effectiveSalonId?: number | null,
): CreateBookingRoomFormData {
  return {
    salonId: effectiveSalonId ?? 0,
    name: "",
    note: "",
    status: StatusActive.Active,
  };
}

function getUpdateDefaultValues(
  bookingRoom?: BookingRoomDto | null,
): UpdateBookingRoomFormData {
  return {
    name: bookingRoom?.name ?? "",
    note: bookingRoom?.note ?? "",
    status: bookingRoom?.status ?? StatusActive.Active,
  };
}

export function BookingRoomForm({ open, onOpenChange, bookingRoom }: Props) {
  const isEdit = !!bookingRoom;
  const createMutation = useCreateBookingRoom();
  const updateMutation = useUpdateBookingRoom();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [activeTab, setActiveTab] = useState("info");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const effectiveSalonId = useAuthStore((state) => state.getEffectiveSalonId());
  const { data: salonsResult } = useAdminSalons(
    { pageIndex: 1, pageSize: 100 },
    open && !isEdit,
  );
  const salons = salonsResult?.data?.items ?? [];

  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${bookingRoom?.id ?? "new"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setActiveTab("info");
      setPendingFile(null);
    }
  }

  const createForm = useForm<CreateBookingRoomFormData>({
    resolver: zodResolver(
      createBookingRoomSchema,
    ) as Resolver<CreateBookingRoomFormData>,
    defaultValues: getCreateDefaultValues(effectiveSalonId),
  });

  const updateForm = useForm<UpdateBookingRoomFormData>({
    resolver: zodResolver(
      updateBookingRoomSchema,
    ) as Resolver<UpdateBookingRoomFormData>,
    defaultValues: getUpdateDefaultValues(bookingRoom),
  });

  const createStatus = useWatch({
    control: createForm.control,
    name: "status",
  });
  const createSalonId = useWatch({
    control: createForm.control,
    name: "salonId",
  });
  const updateStatus = useWatch({
    control: updateForm.control,
    name: "status",
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      updateForm.reset(getUpdateDefaultValues(bookingRoom));
      return;
    }
    createForm.reset(getCreateDefaultValues(effectiveSalonId));
  }, [open, bookingRoom, effectiveSalonId, isEdit, createForm, updateForm]);

  const salonPlaceholder =
    salonsResult === undefined
      ? "Đang tải chi nhánh..."
      : salons.length === 0
        ? "Không có chi nhánh"
        : "Chọn chi nhánh...";

  async function onSubmitCreate(values: CreateBookingRoomFormData) {
    setIsUploading(true);
    try {
      let imageUrl: string | undefined;
      if (pendingFile) {
        imageUrl = await fileToBase64(pendingFile);
      }

      const payload: CreateBookingRoomRequest = {
        salonId: values.salonId,
        name: values.name,
        note: values.note || undefined,
        status: values.status,
      };
      if (imageUrl) payload.imageUrl = imageUrl;

      createMutation.mutate(payload, {
        onSuccess: (result) => {
          if (result.isSuccess !== true) return;
          onOpenChange(false);
        },
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmitUpdate(values: UpdateBookingRoomFormData) {
    if (!bookingRoom?.id) return;

    setIsUploading(true);
    try {
      let imageUrl: string | undefined;
      if (pendingFile) {
        imageUrl = await fileToBase64(pendingFile);
      }

      const data: UpdateBookingRoomRequest = {
        name: values.name,
        note: values.note || undefined,
        status: values.status,
      };
      if (imageUrl) data.imageUrl = imageUrl;

      updateMutation.mutate(
        { id: bookingRoom.id, data },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
    } finally {
      setIsUploading(false);
    }
  }

  const saving = isPending || isUploading;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa phòng dịch vụ" : "Thêm phòng dịch vụ mới"}
      size="xl"
      scrollable
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form={isEdit ? "booking-room-edit-form" : "booking-room-create-form"}
            variant="admin"
            size="sm"
            className="mb-0"
            loading={saving}
          >
            {isEdit ? "Cập nhật" : "Tạo phòng"}
          </Button>
        </>
      }
    >
      {isEdit ? (
        <form
          id="booking-room-edit-form"
          onSubmit={updateForm.handleSubmit(onSubmitUpdate)}
          className="space-y-4"
        >
          <Tabs
            variant="body"
            activeId={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: "info",
                label: "Thông tin",
                content: (
                  <FormSection title="Thông tin phòng dịch vụ">
                    <FormRow>
                      <FormField
                        label="Tên phòng"
                        required
                        tooltip="Vui lòng nhập vào tên phòng dịch vụ"
                        error={updateForm.formState.errors.name?.message}
                      >
                        <Input
                          {...updateForm.register("name")}
                          placeholder="Phòng VIP 1"
                          invalid={!!updateForm.formState.errors.name}
                        />
                      </FormField>

                      <FormField
                        label="Trạng thái"
                        tooltip="Bật để kích hoạt phòng"
                        error={updateForm.formState.errors.status?.message}
                      >
                        <div className="flex h-9 items-center">
                          <Switch
                            checked={updateStatus === StatusActive.Active}
                            onChange={(checked: boolean) =>
                              updateForm.setValue(
                                "status",
                                checked
                                  ? StatusActive.Active
                                  : StatusActive.Inactive,
                              )
                            }
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Ghi chú"
                        tooltip="Ghi chú không dài quá 500 ký tự"
                        error={updateForm.formState.errors.note?.message}
                        className="sm:col-span-2"
                      >
                        <Textarea
                          {...updateForm.register("note")}
                          placeholder="Ghi chú ở đây"
                          rows={3}
                          invalid={!!updateForm.formState.errors.note}
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>
                ),
              },
              {
                id: "images",
                label: "Hình ảnh",
                content: (
                  <FormRow>
                    <FormField
                      label="Ảnh phòng"
                      tooltip="Ảnh đại diện phòng dịch vụ"
                    >
                      <ImageUpload
                        key={`image-${open}-${bookingRoom?.id ?? "new"}`}
                        value={bookingRoom?.imageUrl}
                        onFileChange={setPendingFile}
                        shape="square"
                        label="Chọn ảnh phòng"
                      />
                    </FormField>
                  </FormRow>
                ),
              },
            ]}
          />
        </form>
      ) : (
        <form
          id="booking-room-create-form"
          onSubmit={createForm.handleSubmit(onSubmitCreate)}
          className="space-y-4"
        >
          <Tabs
            variant="body"
            activeId={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: "info",
                label: "Thông tin",
                content: (
                  <FormSection title="Thông tin phòng dịch vụ">
                    <FormRow>
                      <FormField
                        label="Chi nhánh"
                        required
                        tooltip="Phòng thuộc chi nhánh nào"
                        error={createForm.formState.errors.salonId?.message}
                      >
                        <Select
                          value={createSalonId?.toString() ?? ""}
                          onChange={(event) =>
                            createForm.setValue(
                              "salonId",
                              Number(event.target.value),
                              { shouldValidate: true },
                            )
                          }
                          invalid={!!createForm.formState.errors.salonId}
                        >
                          <option value="">{salonPlaceholder}</option>
                          {salons.map((salon: SalonDTO) => (
                            <option key={salon.id} value={String(salon.id)}>
                              {salon.name}
                            </option>
                          ))}
                        </Select>
                      </FormField>

                      <FormField
                        label="Tên phòng"
                        required
                        tooltip="Vui lòng nhập vào tên phòng dịch vụ"
                        error={createForm.formState.errors.name?.message}
                      >
                        <Input
                          {...createForm.register("name")}
                          placeholder="Phòng VIP 1"
                          invalid={!!createForm.formState.errors.name}
                        />
                      </FormField>

                      <FormField
                        label="Trạng thái"
                        tooltip="Bật để kích hoạt phòng"
                        error={createForm.formState.errors.status?.message}
                      >
                        <div className="flex h-9 items-center">
                          <Switch
                            checked={createStatus === StatusActive.Active}
                            onChange={(checked: boolean) =>
                              createForm.setValue(
                                "status",
                                checked
                                  ? StatusActive.Active
                                  : StatusActive.Inactive,
                              )
                            }
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Ghi chú"
                        tooltip="Ghi chú không dài quá 500 ký tự"
                        error={createForm.formState.errors.note?.message}
                        className="sm:col-span-2"
                      >
                        <Textarea
                          {...createForm.register("note")}
                          placeholder="Ghi chú ở đây"
                          rows={3}
                          invalid={!!createForm.formState.errors.note}
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>
                ),
              },
              {
                id: "images",
                label: "Hình ảnh",
                content: (
                  <FormRow>
                    <FormField
                      label="Ảnh phòng"
                      tooltip="Ảnh đại diện phòng dịch vụ"
                    >
                      <ImageUpload
                        key={`image-${open}-new`}
                        onFileChange={setPendingFile}
                        shape="square"
                        label="Chọn ảnh phòng"
                      />
                    </FormField>
                  </FormRow>
                ),
              },
            ]}
          />
        </form>
      )}
    </Modal>
  );
}
