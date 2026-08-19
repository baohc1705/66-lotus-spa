IF OBJECT_ID(N'dbo.usp_GetCashierStaffColumns', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCashierStaffColumns;
GO

-- Trả về danh sách thợ (staff) để hiển thị làm cột trên lịch của màn hình thu ngân (cashier calendar).
-- Chỉ lấy thợ đang hoạt động (khác trạng thái 2 = nghỉ việc), đúng role 'staff', và đúng salon nếu có truyền vào.
--
-- Cách dùng:
--   EXEC dbo.usp_GetCashierStaffColumns @SalonId = 3;
--
-- Input mẫu:
--   @SalonId = 3     -- chỉ lấy thợ đang làm ở salon id 3, truyền NULL để lấy tất cả salon
--
-- Output mẫu:
--   StaffId | StaffName    | Avatar
--   --------|--------------|-------------------------
--   8       | Tran Thi B   | https://.../avatar2.png
--   12      | Nguyen Van A | https://.../avatar1.png
CREATE PROCEDURE dbo.usp_GetCashierStaffColumns
    @SalonId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        st.id        AS StaffId,
        st.full_name AS StaffName,
        st.avatar_url AS Avatar
    FROM dbo.staffs st
    JOIN dbo.users u ON u.id = st.user_id AND u.status = 1
    JOIN dbo.user_roles ur ON ur.user_id = u.id
    JOIN dbo.roles r ON r.id = ur.role_id AND r.status = 1 AND r.code = N'staff'
    WHERE st.status <> 2
      -- có truyền salon thì chỉ lấy thợ thuộc salon đó
      AND (@SalonId IS NULL OR EXISTS (
            SELECT 1 FROM dbo.staff_salons ssal
            WHERE ssal.staff_id = st.id AND ssal.salon_id = @SalonId AND ssal.status = 1))
    ORDER BY st.full_name;
END
GO