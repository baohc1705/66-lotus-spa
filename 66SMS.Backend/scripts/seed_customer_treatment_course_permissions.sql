-- Seed permissions for customer treatment courses ownership APIs
-- Run after create_customer_treatment_courses.sql

DECLARE @Resource NVARCHAR(200) = N'customer-treatment-courses';

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'read')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Xem liệu trình khách hàng', @Resource, N'read', N'Xem sở hữu liệu trình và lịch sử dùng buổi', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE resource = @Resource AND action = N'purchase')
BEGIN
    INSERT INTO dbo.permissions (name, resource, action, description, status)
    VALUES (N'Mua/kích hoạt liệu trình', @Resource, N'purchase', N'Kích hoạt liệu trình cho khách (ngoài luồng POS)', 1);
END

-- Gán cho các role đã có quyền treatment-courses:read
INSERT INTO dbo.role_permissions (role_id, permission_id, assigned_at)
SELECT DISTINCT rp.role_id, p.id, SYSDATETIMEOFFSET()
FROM dbo.permissions p
CROSS JOIN (
    SELECT DISTINCT rp2.role_id
    FROM dbo.role_permissions rp2
    INNER JOIN dbo.permissions p2 ON p2.id = rp2.permission_id
    WHERE p2.resource = N'treatment-courses' AND p2.action = N'read'
) rp
WHERE p.resource = @Resource
  AND NOT EXISTS (
      SELECT 1 FROM dbo.role_permissions x
      WHERE x.role_id = rp.role_id AND x.permission_id = p.id
  );
GO
