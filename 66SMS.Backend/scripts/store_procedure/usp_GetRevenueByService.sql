IF OBJECT_ID(N'dbo.usp_GetRevenueByProduct', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueByProduct;
GO

IF OBJECT_ID(N'dbo.usp_GetRevenueByService', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueByService;
GO

-- Báo cáo doanh thu theo từng dịch vụ trong khoảng ngày, gom từ dòng hóa đơn đã thanh toán.
-- Dùng cho biểu đồ/bảng top dịch vụ bán chạy theo salon.
--
-- Input:
--   @SalonId  INT   -- salon bắt buộc (không hỗ trợ NULL)
--   @FromDate DATE  -- ngày bắt đầu (bao gồm, múi giờ +07 trên issued_at)
--   @ToDate   DATE  -- ngày kết thúc (bao gồm)
--
-- Output: nhiều dòng, sắp xếp Revenue giảm dần
--   ItemId    INT           -- ref_id dịch vụ trên invoice_items
--   ItemName  NVARCHAR      -- tên dịch vụ (MAX theo ref_id)
--   Quantity  INT/DECIMAL   -- tổng số lượng bán
--   Revenue   DECIMAL       -- tổng line_total
--
-- Ví dụ EXEC:
--   EXEC dbo.usp_GetRevenueByService @SalonId = 3, @FromDate = '2026-08-01', @ToDate = '2026-08-31';
--   EXEC dbo.usp_GetRevenueByService @SalonId = 1, @FromDate = '2026-08-20', @ToDate = '2026-08-20';
CREATE PROCEDURE dbo.usp_GetRevenueByService
    @SalonId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- gom dòng hóa đơn: chỉ dịch vụ (item_type = 1), hóa đơn paid, dòng còn hiệu lực
    SELECT
        ii.ref_id AS ItemId,
        MAX(ii.item_name) AS ItemName,
        SUM(ii.quantity) AS Quantity,
        SUM(ii.line_total) AS Revenue
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.item_type = 1
      AND inv.salon_id = @SalonId
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY ii.ref_id
    ORDER BY SUM(ii.line_total) DESC;
END
GO
