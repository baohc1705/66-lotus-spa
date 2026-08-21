IF OBJECT_ID(N'dbo.usp_GetNetRevenue', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetNetRevenue;
GO

-- Mục đích: Thống kê doanh thu thuần (net revenue) trong khoảng ngày, dùng vẽ biểu đồ dashboard.
-- Chỉ tính hóa đơn đã thanh toán xong (status = 2). issued_at lưu theo UTC nên phải quy đổi
-- về giờ Việt Nam (+07:00) trước khi lọc/gom nhóm.
--   @Tab = 1    -> gom theo GIỜ trong ngày (00:00, 01:00, ..., 23:00)
--   @Tab = 2    -> gom theo THỨ trong tuần (T2..T7, CN)
--   @Tab khác   -> gom theo NGÀY cụ thể
--
-- Input:
--   @SalonId  INT = NULL   -- chỉ tính hóa đơn salon này; NULL = tất cả salon
--   @FromDate DATE         -- từ ngày (theo giờ VN, bao gồm)
--   @ToDate   DATE         -- đến ngày (theo giờ VN, bao gồm)
--   @Tab      TINYINT      -- 1 = theo giờ, 2 = theo thứ, còn lại = theo ngày
--
-- Output (Label, Value):
--   Label  NVARCHAR   -- nhãn trục biểu đồ (giờ / thứ / ngày)
--   Value  DECIMAL    -- tổng total_amount hóa đơn đã thanh toán trong nhóm
--
-- Ví dụ EXEC:
--   EXEC dbo.usp_GetNetRevenue @SalonId = 3, @FromDate = '2026-08-20', @ToDate = '2026-08-20', @Tab = 1;
--   EXEC dbo.usp_GetNetRevenue @SalonId = 3, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @Tab = 2;
--   EXEC dbo.usp_GetNetRevenue @SalonId = NULL, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @Tab = 3;
CREATE PROCEDURE dbo.usp_GetNetRevenue
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Tab      TINYINT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Tab = 1
    BEGIN
        -- Tab 1: gom theo giờ xuất hóa đơn (giờ VN); 8:15 và 8:45 đều tính vào "08:00"
        SELECT
            RIGHT('0' + CAST(DATEPART(HOUR, SWITCHOFFSET(inv.issued_at, '+07:00')) AS VARCHAR(2)), 2)
                + N':00' AS Label,
            SUM(inv.total_amount) AS Value
        FROM dbo.invoices inv
        WHERE inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY DATEPART(HOUR, SWITCHOFFSET(inv.issued_at, '+07:00'))
        ORDER BY DATEPART(HOUR, SWITCHOFFSET(inv.issued_at, '+07:00'));
    END
    ELSE IF @Tab = 2
    BEGIN
        -- Tab 2: gom theo thứ trong tuần (giờ VN); nhãn T2 -> T7, CN
        -- DATEPART(WEEKDAY,...) phụ thuộc @@DATEFIRST của server, mặc định Chủ nhật = 1
        SELECT
            CASE DATEPART(WEEKDAY, CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE))
                WHEN 2 THEN N'T2'
                WHEN 3 THEN N'T3'
                WHEN 4 THEN N'T4'
                WHEN 5 THEN N'T5'
                WHEN 6 THEN N'T6'
                WHEN 7 THEN N'T7'
                ELSE N'CN'
            END AS Label,
            SUM(inv.total_amount) AS Value
        FROM dbo.invoices inv
        WHERE inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY DATEPART(WEEKDAY, CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE))
        ORDER BY MIN(DATEPART(WEEKDAY, CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE)));
    END
    ELSE
    BEGIN
        -- Tab khác: gom theo từng ngày cụ thể (giờ VN) trong khoảng @FromDate - @ToDate
        SELECT
            CONVERT(VARCHAR(5), CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE), 3) AS Label,
            SUM(inv.total_amount) AS Value
        FROM dbo.invoices inv
        WHERE inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE)
        ORDER BY CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE);
    END
END
GO
