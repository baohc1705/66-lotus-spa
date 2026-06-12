import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/features/users/hooks/useCreateUser";
import { useUpdateUser } from "@/features/users/hooks/useUpdateUser";
import { type UserDto } from "@/features/users/types/user.types";
import { createSchema, type CreateFromData } from "../schemas/createSchema";
import { updateSchema, type UpdateFormData } from "../schemas/updateSchema";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface Props {
  editingUser?: UserDto | null;
  onSuccess?: () => void;
}

export const UserForm = ({ editingUser, onSuccess }: Props) => {
  const isEditing = !!editingUser;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const createForm = useForm<CreateFromData>({
    resolver: zodResolver(createSchema),
  });

  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      username: editingUser?.username,
      email: editingUser?.email,
    },
  });

  const onCreateSubmit = (data: CreateFromData) => {
    createUser.mutate(data, { onSuccess });
  };

  const onUpdateSubmit = (data: UpdateFormData) => {
    updateUser.mutate({ ...data, id: editingUser?.id }, { onSuccess });
  };

  if (isEditing) {
    return (
      <form
        onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Label>Tài khoản</Label>
          <Input {...updateForm.register("username")} />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input {...updateForm.register("email")} />
        </div>
        <Button type="submit" disabled={updateUser.isPending}>
          {updateUser.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={createForm.handleSubmit(onCreateSubmit)}
      className="space-y-4"
    >
      <div className="space-y-1">
        <Label>Tài khoản</Label>
        <Input {...createForm.register("userName")} />
        {createForm.formState.errors.userName && (
          <p className="text-sm text-red-500">
            {createForm.formState.errors.userName.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input {...createForm.register("email")} />
        {createForm.formState.errors.email && (
          <p className="text-sm text-red-500">
            {createForm.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label>Mật khẩu</Label>
        <Input type="password" {...createForm.register("password")} />
      </div>
      <div className="space-y-1">
        <Label>Xác nhận mật khẩu</Label>
        <Input type="password" {...createForm.register("confirmPassword")} />
        {createForm.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {createForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label>Vai trò</Label>
        <Select onValueChange={(v) => createForm.setValue("role", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="staff">Nhân viên</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={createUser.isPending}>
        {createUser.isPending ? "Đang tạo..." : "Tạo người dùng"}
      </Button>
    </form>
  );
};
