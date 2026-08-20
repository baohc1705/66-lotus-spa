IF OBJECT_ID(N'dbo.usp_GetReportRevenueByPeriod', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueByPeriod;
GO

-- Mục đích: Báo cáo doanh thu theo kỳ (ngày/tuần/tháng/quý/năm), dùng cho màn hình report tổng quan.
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để xác định "ngày làm việc",
-- sau đó gom ngày đó vào 1 PeriodKey tùy theo @Grain.
--
-- @Grain quyết định cách gom kỳ:
--   'day'     -> PeriodKey dạng "2026-08-20"
--   'week'    -> PeriodKey dạng "2026-W34"
--   'month'   -> PeriodKey dạng "2026-08"
--   'quarter' -> PeriodKey dạng "2026-Q3"
--   'year'    -> PeriodKey dạng "2026"
--
-- Input:
--   @SalonId  INT = NULL          -- chỉ tính salon này; NULL = tất cả salon
--   @FromDate DATE                -- từ ngày (theo giờ VN, bao gồm)
--   @ToDate   DATE                -- đến ngày (theo giờ VN, bao gồm)
--   @Grain    NVARCHAR(10) = 'day' -- day | week | month | quarter | year
--
-- Output:
--   PeriodKey        NVARCHAR   -- mã kỳ (ngày/tuần/tháng/quý/năm)
--   OrderCount       INT        -- số hóa đơn đã thanh toán (status = 2) trong kỳ
--   InvoiceTotal     DECIMAL    -- tổng total_amount hóa đơn đã thanh toán
--   CommissionTotal  DECIMAL    -- tổng hoa hồng đã trả cho thợ
--   CashOut          DECIMAL    -- hoa hồng + tiền hoàn trả (invoice status = 4)
--   TotalRevenue     DECIMAL    -- doanh thu thuần = InvoiceTotal - CommissionTotal
--
-- Ví dụ EXEC:
--   EXEC dbo.usp_GetReportRevenueByPeriod @SalonId = NULL, @FromDate = '2026-07-01', @ToDate = '2026-07-30', @Grain = N'day';
--   EXEC dbo.usp_GetReportRevenueByPeriod @SalonId = 1, @FromDate = '2026-01-01', @ToDate = '2026-07-30', @Grain = N'month';
--   EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-07-01', '2026-07-30', N'week';
CREATE PROCEDURE dbo.usp_GetReportRevenueByPeriod
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Grain    NVARCHAR(10) = N'day'   -- day | week | month | quarter | year
AS
BEGIN
    SET NOCOUNT ON;
    SET @Grain = LOWER(ISNULL(@Grain, N'day'));

    -- Bước 1: Lấy hóa đơn đã thanh toán (2) hoặc đã hoàn tiền (4), quy đổi issued_at sang ngày VN
    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS Ngay,
        inv.status,
        inv.total_amount,
        inv.paid_amount
    INTO #HoaDon
    FROM dbo.invoices inv
    WHERE inv.status IN (2, 4)
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId);

    -- Bước 2: Gắn PeriodKey cho từng hóa đơn theo @Grain (dùng cho GROUP BY và hiển thị)
    SELECT
        CASE
            WHEN @Grain = N'week'    THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-W' + CAST(DATEPART(WEEK, Ngay) AS NVARCHAR(2))
            WHEN @Grain = N'month'   THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-' + RIGHT(N'0' + CAST(MONTH(Ngay) AS NVARCHAR(2)), 2)
            WHEN @Grain = N'quarter' THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-Q' + CAST(DATEPART(QUARTER, Ngay) AS NVARCHAR(1))
            WHEN @Grain = N'year'    THEN CAST(YEAR(Ngay) AS NVARCHAR(4))
            ELSE CONVERT(NVARCHAR(10), Ngay, 23)
        END AS PeriodKey,
        status,
        total_amount,
        paid_amount
    INTO #HoaDonNhan
    FROM #HoaDon;

    -- Bước 3: Cộng doanh thu theo kỳ (số đơn, tổng tiền hóa đơn, tiền hoàn trả)
    SELECT
        PeriodKey,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS OrderCount,
        SUM(CASE WHEN status = 2 THEN total_amount ELSE 0 END) AS InvoiceTotal,
        SUM(CASE WHEN status = 4 THEN paid_amount ELSE 0 END) AS RefundOut
    INTO #DoanhThu
    FROM #HoaDonNhan
    GROUP BY PeriodKey;

    -- Bước 4: Lấy hoa hồng raw (dòng invoice_items active, hóa đơn đã thanh toán)
    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS Ngay,
        ii.commission_amount
    INTO #HHRaw
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId);

    -- Bước 5: Cộng hoa hồng theo PeriodKey (cùng công thức CASE như bước 2)
    SELECT
        CASE
            WHEN @Grain = N'week'    THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-W' + CAST(DATEPART(WEEK, Ngay) AS NVARCHAR(2))
            WHEN @Grain = N'month'   THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-' + RIGHT(N'0' + CAST(MONTH(Ngay) AS NVARCHAR(2)), 2)
            WHEN @Grain = N'quarter' THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-Q' + CAST(DATEPART(QUARTER, Ngay) AS NVARCHAR(1))
            WHEN @Grain = N'year'    THEN CAST(YEAR(Ngay) AS NVARCHAR(4))
            ELSE CONVERT(NVARCHAR(10), Ngay, 23)
        END AS PeriodKey,
        SUM(commission_amount) AS CommissionTotal
    INTO #HoaHong
    FROM #HHRaw
    GROUP BY
        CASE
            WHEN @Grain = N'week'    THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-W' + CAST(DATEPART(WEEK, Ngay) AS NVARCHAR(2))
            WHEN @Grain = N'month'   THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-' + RIGHT(N'0' + CAST(MONTH(Ngay) AS NVARCHAR(2)), 2)
            WHEN @Grain = N'quarter' THEN CAST(YEAR(Ngay) AS NVARCHAR(4)) + N'-Q' + CAST(DATEPART(QUARTER, Ngay) AS NVARCHAR(1))
            WHEN @Grain = N'year'    THEN CAST(YEAR(Ngay) AS NVARCHAR(4))
            ELSE CONVERT(NVARCHAR(10), Ngay, 23)
        END;

    -- Bước 6: Ghép doanh thu + hoa hồng, tính CashOut và TotalRevenue
    SELECT
        dt.PeriodKey,
        dt.OrderCount,
        dt.InvoiceTotal,
        ISNULL(hh.CommissionTotal, 0) AS CommissionTotal,
        ISNULL(hh.CommissionTotal, 0) + dt.RefundOut AS CashOut,
        dt.InvoiceTotal - ISNULL(hh.CommissionTotal, 0) AS TotalRevenue
    FROM #DoanhThu dt
    LEFT JOIN #HoaHong hh ON hh.PeriodKey = dt.PeriodKey
    ORDER BY dt.PeriodKey;

    DROP TABLE #HoaDon;
    DROP TABLE #HoaDonNhan;
    DROP TABLE #DoanhThu;
    DROP TABLE #HHRaw;
    DROP TABLE #HoaHong;
END
GO

-- Tất cả chi nhánh, theo ngày
EXEC dbo.usp_GetReportRevenueByPeriod
    @SalonId  = NULL,
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30',
    @Grain    = N'day';

-- 1 chi nhánh (vd SalonId = 1), theo tháng
EXEC dbo.usp_GetReportRevenueByPeriod
    @SalonId  = 1,
    @FromDate = '2026-01-01',
    @ToDate   = '2026-07-30',
    @Grain    = N'month';

-- Theo tuần / quý / năm
EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-07-01', '2026-07-30', N'week';
EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-01-01', '2026-12-31', N'quarter';
EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-01-01', '2026-12-31', N'year';
