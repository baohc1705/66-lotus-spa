-- Database First: chạy tay trên 66LotusSpaDB
-- Doanh thu theo từng chi nhánh (active) trong khoảng ngày
-- cashOut = hoa hồng + hoàn tiền
-- PeriodTag = current | previous (UNION ALL)

IF OBJECT_ID(N'dbo.usp_GetRevenueBySalon', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueBySalon;
GO

CREATE PROCEDURE dbo.usp_GetRevenueBySalon
    @FromDate         DATE,
    @ToDate           DATE,
    @ComparePrevious  BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Days INT = DATEDIFF(DAY, @FromDate, @ToDate) + 1;
    DECLARE @PrevTo   DATE = DATEADD(DAY, -1, @FromDate);
    DECLARE @PrevFrom DATE = DATEADD(DAY, 1 - @Days, @PrevTo);

    -- Doanh thu / hoàn theo salon (kỳ hiện tại)
    SELECT
        inv.salon_id AS SalonId,
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END) AS CashIn,
        SUM(CASE WHEN inv.status = 4 THEN inv.paid_amount ELSE 0 END) AS RefundOut,
        SUM(CASE WHEN inv.status = 2 THEN inv.total_amount ELSE 0 END) AS GrossRevenue,
        SUM(CASE WHEN inv.status = 2 THEN 1 ELSE 0 END) AS TransactionCount
    INTO #InvCurr
    FROM dbo.invoices inv
    WHERE inv.status IN (2, 4)
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- Hoa hồng kỳ hiện tại
    SELECT
        inv.salon_id AS SalonId,
        SUM(ii.commission_amount) AS CommissionOut
    INTO #CommCurr
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- Kỳ trước (nếu cần)
    SELECT
        inv.salon_id AS SalonId,
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END) AS CashIn,
        SUM(CASE WHEN inv.status = 4 THEN inv.paid_amount ELSE 0 END) AS RefundOut,
        SUM(CASE WHEN inv.status = 2 THEN inv.total_amount ELSE 0 END) AS GrossRevenue,
        SUM(CASE WHEN inv.status = 2 THEN 1 ELSE 0 END) AS TransactionCount
    INTO #InvPrev
    FROM dbo.invoices inv
    WHERE @ComparePrevious = 1
      AND inv.status IN (2, 4)
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
    GROUP BY inv.salon_id;

    SELECT
        inv.salon_id AS SalonId,
        SUM(ii.commission_amount) AS CommissionOut
    INTO #CommPrev
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE @ComparePrevious = 1
      AND ii.status = 1
      AND inv.status = 2
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
    GROUP BY inv.salon_id;

    SELECT
        N'current' AS PeriodTag,
        s.id AS SalonId,
        s.code AS SalonCode,
        s.name AS SalonName,
        ISNULL(i.CashIn, 0) AS CashIn,
        ISNULL(i.RefundOut, 0) + ISNULL(c.CommissionOut, 0) AS CashOut,
        ISNULL(i.GrossRevenue, 0) AS GrossRevenue,
        ISNULL(i.TransactionCount, 0) AS TransactionCount
    FROM dbo.salons s
    LEFT JOIN #InvCurr i ON i.SalonId = s.id
    LEFT JOIN #CommCurr c ON c.SalonId = s.id
    WHERE s.status = 1

    UNION ALL

    SELECT
        N'previous' AS PeriodTag,
        s.id AS SalonId,
        s.code AS SalonCode,
        s.name AS SalonName,
        ISNULL(i.CashIn, 0) AS CashIn,
        ISNULL(i.RefundOut, 0) + ISNULL(c.CommissionOut, 0) AS CashOut,
        ISNULL(i.GrossRevenue, 0) AS GrossRevenue,
        ISNULL(i.TransactionCount, 0) AS TransactionCount
    FROM dbo.salons s
    LEFT JOIN #InvPrev i ON i.SalonId = s.id
    LEFT JOIN #CommPrev c ON c.SalonId = s.id
    WHERE s.status = 1
      AND @ComparePrevious = 1

    ORDER BY PeriodTag, GrossRevenue DESC;

    DROP TABLE #InvCurr;
    DROP TABLE #CommCurr;
    DROP TABLE #InvPrev;
    DROP TABLE #CommPrev;
END
GO
