-- Seed permissions for config appointment CRUD APIs
-- Run after creating dbo.config_appointments table

DECLARE @Resource NVARCHAR(200) = N'config-appointments';

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'read')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Xem cấu hình lịch hẹn', @Resource, N'read', N'Xem danh sách và chi tiết cấu hình lịch hẹn theo chi nhánh', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'create')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Tạo cấu hình lịch hẹn', @Resource, N'create', N'Tạo cấu hình phần trăm cọc / khung giờ cho chi nhánh', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'update')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Sửa cấu hình lịch hẹn', @Resource, N'update', N'Cập nhật cấu hình lịch hẹn theo chi nhánh', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'delete')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Xóa cấu hình lịch hẹn', @Resource, N'delete', N'Xóa cấu hình lịch hẹn theo chi nhánh', 1);
END

-- Gán cho các role đã có quyền salons:read
INSERT INTO dbo.role_permissions (role_id, permission_id, assigned_at)
SELECT DISTINCT rp.role_id, p.id, SYSDATETIMEOFFSET()
FROM dbo.permissions p
CROSS JOIN (
    SELECT DISTINCT rp2.role_id
    FROM dbo.role_permissions rp2
    INNER JOIN dbo.permissions p2 ON p2.id = rp2.permission_id
    WHERE p2.resource = N'salons' AND p2.action = N'read'
) rp
WHERE p.resource = @Resource
  AND NOT EXISTS (
      SELECT 1 FROM dbo.role_permissions x
      WHERE x.role_id = rp.role_id AND x.permission_id = p.id
  );
GO
