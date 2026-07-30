IF OBJECT_ID(N'dbo.usp_GetReportRevenueByPeriod', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueByPeriod;
GO

CREATE PROCEDURE dbo.usp_GetReportRevenueByPeriod
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Grain    NVARCHAR(10) = N'day'   -- day | week | month | quarter | year
AS
BEGIN
    SET NOCOUNT ON;
    SET @Grain = LOWER(ISNULL(@Grain, N'day'));

    -- 1) Hóa đơn + ngày VN
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

    -- 2) Gắn PeriodKey từ cột Ngay (dùng để GROUP BY + hiển thị)
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

    -- 3) Cộng theo kỳ
    SELECT
        PeriodKey,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS OrderCount,
        SUM(CASE WHEN status = 2 THEN total_amount ELSE 0 END) AS InvoiceTotal,
        SUM(CASE WHEN status = 4 THEN paid_amount ELSE 0 END) AS RefundOut
    INTO #DoanhThu
    FROM #HoaDonNhan
    GROUP BY PeriodKey;

    -- 4) Hoa hồng raw
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

    -- 5) Cộng hoa hồng theo PeriodKey (cùng CASE như bước 2)
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

    -- 6) Kết quả
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