IF OBJECT_ID(N'dbo.usp_GetRevenueByStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueByStaff;
GO

-- Báo cáo doanh thu và hoa hồng theo từng nhân viên trong khoảng ngày.
-- Dùng cho bảng xếp hạng performance staff theo salon.
--
-- Input:
--   @SalonId  INT   -- salon bắt buộc
--   @FromDate DATE  -- ngày bắt đầu (bao gồm, múi giờ +07 trên issued_at)
--   @ToDate   DATE  -- ngày kết thúc (bao gồm)
--
-- Output: nhiều dòng, sắp xếp Revenue giảm dần
--   StaffId     INT           -- id nhân viên trên invoice_items.staff_id
--   StaffName   NVARCHAR      -- họ tên staff
--   Quantity    INT/DECIMAL   -- tổng số lượng dịch vụ/sản phẩm ghi nhận
--   Revenue     DECIMAL       -- tổng line_total
--   Commission  DECIMAL       -- tổng commission_amount
--
-- Ví dụ EXEC:
--   EXEC dbo.usp_GetRevenueByStaff @SalonId = 3, @FromDate = '2026-08-01', @ToDate = '2026-08-31';
--   EXEC dbo.usp_GetRevenueByStaff @SalonId = 3, @FromDate = '2026-08-20', @ToDate = '2026-08-20';
CREATE PROCEDURE dbo.usp_GetRevenueByStaff
    @SalonId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- gom theo staff: chỉ dòng có staff_id, hóa đơn paid, dòng item còn hiệu lực
    SELECT
        ii.staff_id AS StaffId,
        MAX(st.full_name) AS StaffName,
        SUM(ii.quantity) AS Quantity,
        SUM(ii.line_total) AS Revenue,
        SUM(ii.commission_amount) AS Commission
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    INNER JOIN dbo.staffs st ON st.id = ii.staff_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL
      AND inv.salon_id = @SalonId
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY ii.staff_id
    ORDER BY SUM(ii.line_total) DESC;
END
GO
