-- Seed permissions for landing banner CRUD APIs
-- Run after create_landing_banners.sql

DECLARE @Resource NVARCHAR(200) = N'landing-banners';

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'read')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Xem banner landing', @Resource, N'read', N'Xem danh sách và chi tiết banner trang chủ', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'create')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Tạo banner landing', @Resource, N'create', N'Tạo banner/slide trang chủ', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'update')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Sửa banner landing', @Resource, N'update', N'Cập nhật banner/slide trang chủ', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'delete')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Xóa banner landing', @Resource, N'delete', N'Xóa (soft-delete) banner/slide trang chủ', 1);
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
