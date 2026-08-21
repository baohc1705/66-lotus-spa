IF OBJECT_ID(N'dbo.usp_GetReportRevenueByStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueByStaff;
GO

-- Báo cáo doanh thu theo TỪNG THỢ trong khoảng ngày, dùng cho màn hình xem thợ nào phục vụ nhiều/ít.
-- Chỉ tính dòng hóa đơn thuộc loại dịch vụ (item_type = 1), đang active, thuộc hóa đơn đã thanh toán.
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để lọc theo ngày.
--
-- Cách dùng:
--   -- tất cả chi nhánh
--   EXEC dbo.usp_GetReportRevenueByStaff @SalonId = NULL, @FromDate = '2026-07-01', @ToDate = '2026-07-30';
--
--   -- 1 chi nhánh
--   EXEC dbo.usp_GetReportRevenueByStaff @SalonId = 1, @FromDate = '2026-07-01', @ToDate = '2026-07-30';
--
--   -- viết ngắn (đúng thứ tự param)
--   EXEC dbo.usp_GetReportRevenueByStaff NULL, '2026-07-01', '2026-07-30';
--
-- Input mẫu:
--   @SalonId  = 1             -- chỉ tính salon id 1, truyền NULL để tính tất cả salon
--   @FromDate = '2026-07-01'  -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-07-30'  -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--
-- Output mẫu (sắp xếp giảm dần theo TotalRevenue):
--   StaffId | StaffName    | ServiceCount | ServiceRevenue | Commission | TotalRevenue
--   --------|--------------|--------------|-----------------|------------|-------------
--   12      | Nguyen Van A | 85           | 25500000        | 3200000    | 22300000
--   8       | Tran Thi B   | 60           | 18000000        | 2100000    | 15900000
--   -- ServiceCount    = tổng số lượt phục vụ dịch vụ (SUM quantity)
--   -- ServiceRevenue  = tổng tiền dịch vụ đã phục vụ (line_total), chưa trừ hoa hồng
--   -- TotalRevenue    = ServiceRevenue - Commission (tiền mang về cho chi nhánh)
CREATE PROCEDURE dbo.usp_GetReportRevenueByStaff
    @SalonId  INT = NULL,   -- NULL = tất cả chi nhánh
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- WHERE đã lọc ii.item_type = 1 nên mọi dòng vào tới đây đều là dịch vụ,
    -- không cần CASE WHEN item_type = 1 lặp lại trong từng SUM như bản gốc
    SELECT
        ii.staff_id                                AS StaffId,
        MAX(st.full_name)                           AS StaffName,
        SUM(ii.quantity)                            AS ServiceCount,
        SUM(ii.line_total)                          AS ServiceRevenue,
        SUM(ii.commission_amount)                   AS Commission,
        SUM(ii.line_total) - SUM(ii.commission_amount) AS TotalRevenue
    FROM dbo.invoice_items ii
    JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    JOIN dbo.staffs st ON st.id = ii.staff_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL
      AND ii.item_type = 1   -- chỉ tính dòng là dịch vụ, bỏ qua sản phẩm/khác
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY ii.staff_id
    ORDER BY TotalRevenue DESC;
END
GO

-- Tất cả chi nhánh
EXEC dbo.usp_GetReportRevenueByStaff
    @SalonId  = NULL,
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30';

-- 1 chi nhánh
EXEC dbo.usp_GetReportRevenueByStaff
    @SalonId  = 1,
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30';

EXEC dbo.usp_GetReportRevenueByStaff NULL, '2026-07-01', '2026-07-30';