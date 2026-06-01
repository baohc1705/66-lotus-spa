import { useState } from "react";
import { UserTable } from "@/features/users/components/UserTable";
import { UserForm } from "@/features/users/components/UserForm";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { type UserDto } from "@/shared/types/user.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

export const UsersPage = () => {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);

  const handleEdit = (user: UserDto) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>

        <PermissionGate resource="users" action="create">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                + Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                </DialogTitle>
              </DialogHeader>
              <UserForm editingUser={editingUser} onSuccess={handleClose} />
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>

      <UserTable onEdit={handleEdit} />
    </div>
  );
};
