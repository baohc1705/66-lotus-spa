-- Seed permission revenue:read cho role Admin và Manager
-- Database First: chạy tay trên 66LotusSpaDB

DECLARE @Resource NVARCHAR(200) = N'revenue';

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'read')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Xem báo cáo doanh thu / dashboard', @Resource, N'read', N'Xem tổng quan doanh thu admin dashboard', 1);
END

INSERT INTO dbo.role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, SYSDATETIMEOFFSET()
FROM dbo.roles r
CROSS JOIN dbo.permissions p
WHERE p.resource = @Resource
  AND p.action = N'read'
  AND r.name IN (N'Admin', N'Manager')
  AND NOT EXISTS (
      SELECT 1 FROM dbo.role_permissions x
      WHERE x.role_id = r.id AND x.permission_id = p.id
  );
GO
