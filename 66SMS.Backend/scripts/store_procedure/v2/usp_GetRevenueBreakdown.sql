IF OBJECT_ID(N'dbo.usp_GetRevenueBreakdown', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueBreakdown;
GO

-- Báo cáo doanh thu chia theo LOẠI DÒNG HÓA ĐƠN (dịch vụ / sản phẩm / liệu trình / khác),
-- kèm tỷ lệ % trên tổng, dùng vẽ biểu đồ tròn (pie chart) doanh thu trong khoảng ngày.
-- Chỉ tính dòng hóa đơn active, thuộc hóa đơn đã thanh toán (status = 2).
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để lọc theo ngày.
--
-- Cách dùng:
--   EXEC dbo.usp_GetRevenueBreakdown @SalonId = 1, @FromDate = '2026-07-01', @ToDate = '2026-07-30';
--
-- Input mẫu:
--   @SalonId  = 1             -- chỉ tính salon id 1, truyền NULL để tính tất cả salon
--   @FromDate = '2026-07-01'  -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-07-30'  -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--
-- Output mẫu:
--   ItemType | Label      | Amount   | Percent
--   ---------|------------|----------|--------
--   1        | Dịch vụ    | 32000000 | 68
--   2        | Sản phẩm   | 12000000 | 26
--   3        | Liệu trình | 3000000  | 6
--   -- Percent = tỷ lệ % của Amount trên tổng tất cả loại (làm tròn số nguyên, cộng lại có thể lệch 1-2% do làm tròn)
CREATE PROCEDURE dbo.usp_GetRevenueBreakdown
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- gom tổng tiền theo từng loại dòng hóa đơn (item_type), kèm nhãn tiếng Việt để hiển thị luôn
    ;WITH tong_theo_loai AS (
        SELECT
            ii.item_type AS ItemType,
            CASE ii.item_type
                WHEN 1 THEN N'Dịch vụ'
                WHEN 2 THEN N'Sản phẩm'
                WHEN 3 THEN N'Liệu trình'
                ELSE N'Khác'
            END AS Label,
            SUM(ii.line_total) AS Amount
        FROM dbo.invoice_items ii
        JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        WHERE ii.status = 1
          AND inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY ii.item_type
    )
    -- tính thêm % của mỗi loại trên tổng tất cả loại (dùng window function, khỏi cần join lại để lấy tổng)
    SELECT
        ItemType,
        Label,
        Amount,
        CASE
            WHEN SUM(Amount) OVER () > 0
                THEN ROUND(Amount * 100.0 / SUM(Amount) OVER (), 0)
            ELSE 0
        END AS [Percent]
    FROM tong_theo_loai
    ORDER BY ItemType;
END
GO