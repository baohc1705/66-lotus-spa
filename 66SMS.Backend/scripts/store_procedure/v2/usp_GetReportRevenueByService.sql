IF OBJECT_ID(N'dbo.usp_GetReportRevenueByService', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueByService;
GO

-- Báo cáo doanh thu theo TỪNG DỊCH VỤ trong khoảng ngày, dùng cho màn hình xem dịch vụ nào bán chạy.
-- Chỉ tính dòng hóa đơn thuộc loại dịch vụ (item_type = 1), đang active, thuộc hóa đơn đã thanh toán.
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để lọc theo ngày.
--
-- Cách dùng:
--   -- tất cả chi nhánh + tất cả nhóm dịch vụ
--   EXEC dbo.usp_GetReportRevenueByService
--        @SalonId = NULL, @CategoryId = NULL, @FromDate = '2026-07-01', @ToDate = '2026-07-30';
--
--   -- lọc 1 chi nhánh + 1 nhóm dịch vụ (vd CategoryId = 2)
--   EXEC dbo.usp_GetReportRevenueByService
--        @SalonId = 1, @CategoryId = 2, @FromDate = '2026-07-01', @ToDate = '2026-07-30';
--
--   -- viết ngắn (đúng thứ tự param)
--   EXEC dbo.usp_GetReportRevenueByService NULL, NULL, '2026-07-01', '2026-07-30';
--
-- Input mẫu:
--   @SalonId    = 1            -- chỉ tính salon id 1, truyền NULL để tính tất cả salon
--   @CategoryId = 2            -- chỉ tính dịch vụ thuộc nhóm id 2, truyền NULL để lấy tất cả nhóm
--   @FromDate   = '2026-07-01' -- từ ngày (theo giờ VN)
--   @ToDate     = '2026-07-30' -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--
-- Output mẫu (sắp xếp giảm dần theo doanh thu gộp Revenue):
--   ItemId | ItemName | Quantity | AvgCommissionRate | Revenue  | Commission | TotalRevenue
--   -------|----------|----------|--------------------|----------|------------|-------------
--   5      | Massage  | 80       | 12.5                | 32000000 | 4000000    | 28000000
--   1      | Gội đầu  | 210      | 8.0                 | 15750000 | 1260000    | 14490000
--   -- ItemId  = id dịch vụ (chính là ref_id trong invoice_items, không phải InvoiceItemId)
--   -- Revenue = tổng tiền dịch vụ đã bán (line_total), chưa trừ hoa hồng
--   -- TotalRevenue = Revenue - Commission (doanh thu thuần sau khi trừ hoa hồng)
CREATE PROCEDURE dbo.usp_GetReportRevenueByService
    @SalonId    INT = NULL,
    @CategoryId INT = NULL,   -- NULL = tất cả nhóm
    @FromDate   DATE,
    @ToDate     DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Gom theo dịch vụ (ref_id); LEFT JOIN services chỉ để lọc theo category
    SELECT
        ii.ref_id                                    AS ItemId,
        MAX(ii.item_name)                            AS ItemName,   -- tên dịch vụ tại thời điểm bán, có thể khác tên hiện tại trong dbo.services
        SUM(ii.quantity)                             AS Quantity,
        AVG(ISNULL(ii.commission_rate, 0))           AS AvgCommissionRate,
        SUM(ii.line_total)                           AS Revenue,
        SUM(ii.commission_amount)                    AS Commission,
        SUM(ii.line_total) - SUM(ii.commission_amount) AS TotalRevenue
    FROM dbo.invoice_items ii
    JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    LEFT JOIN dbo.services svc ON svc.id = ii.ref_id   -- chỉ để lọc theo category, không lấy tên từ đây
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.item_type = 1   -- chỉ tính dòng là dịch vụ, bỏ qua sản phẩm/khác
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
      AND (@CategoryId IS NULL OR svc.category_id = @CategoryId)
    GROUP BY ii.ref_id
    ORDER BY SUM(ii.line_total) DESC;
END
GO

-- Tất cả chi nhánh + tất cả nhóm DV
EXEC dbo.usp_GetReportRevenueByService
    @SalonId    = NULL,
    @CategoryId = NULL,
    @FromDate   = '2026-07-01',
    @ToDate     = '2026-07-30';

-- Lọc 1 chi nhánh + 1 nhóm dịch vụ (vd CategoryId = 2)
EXEC dbo.usp_GetReportRevenueByService
    @SalonId    = 1,
    @CategoryId = 2,
    @FromDate   = '2026-07-01',
    @ToDate     = '2026-07-30';

EXEC dbo.usp_GetReportRevenueByService NULL, NULL, '2026-07-01', '2026-07-30';