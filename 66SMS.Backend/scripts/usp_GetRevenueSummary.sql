-- Database First: chạy tay trên 66LotusSpaDB
-- KPI doanh thu theo khoảng ngày (local VN +07:00)
-- cashOut đơn giản = hoa hồng + hoàn tiền (không tính payroll)
-- 1 result set: PeriodTag = current | previous

IF OBJECT_ID(N'dbo.usp_GetRevenueSummary', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueSummary;
GO

CREATE PROCEDURE dbo.usp_GetRevenueSummary
    @SalonId          INT  = NULL,
    @FromDate         DATE,
    @ToDate           DATE,
    @ComparePrevious  BIT  = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Days INT = DATEDIFF(DAY, @FromDate, @ToDate) + 1;
    DECLARE @PrevTo   DATE = DATEADD(DAY, -1, @FromDate);
    DECLARE @PrevFrom DATE = DATEADD(DAY, 1 - @Days, @PrevTo);

    SELECT
        N'current' AS PeriodTag,
        ISNULL((
            SELECT SUM(inv.paid_amount)
            FROM dbo.invoices inv
            WHERE inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0)
        + CASE WHEN @SalonId IS NULL THEN ISNULL((
            SELECT SUM(wt.amount)
            FROM dbo.wallet_transactions wt
            WHERE wt.type = 3
              AND wt.status = 1
              AND CAST(SWITCHOFFSET(wt.created_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
        ), 0) ELSE 0 END AS CashIn,

        ISNULL((
            SELECT SUM(ii.commission_amount)
            FROM dbo.invoice_items ii
            INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
            WHERE ii.status = 1
              AND inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0)
        + ISNULL((
            SELECT SUM(inv.paid_amount)
            FROM dbo.invoices inv
            WHERE inv.status = 4
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0) AS CashOut,

        ISNULL((
            SELECT SUM(inv.total_amount)
            FROM dbo.invoices inv
            WHERE inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0) AS GrossRevenue,

        ISNULL((
            SELECT COUNT(1)
            FROM dbo.invoices inv
            WHERE inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0) AS TransactionCount

    UNION ALL

    SELECT
        N'previous' AS PeriodTag,
        ISNULL((
            SELECT SUM(inv.paid_amount)
            FROM dbo.invoices inv
            WHERE inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0)
        + CASE WHEN @SalonId IS NULL THEN ISNULL((
            SELECT SUM(wt.amount)
            FROM dbo.wallet_transactions wt
            WHERE wt.type = 3
              AND wt.status = 1
              AND CAST(SWITCHOFFSET(wt.created_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
        ), 0) ELSE 0 END AS CashIn,

        ISNULL((
            SELECT SUM(ii.commission_amount)
            FROM dbo.invoice_items ii
            INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
            WHERE ii.status = 1
              AND inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0)
        + ISNULL((
            SELECT SUM(inv.paid_amount)
            FROM dbo.invoices inv
            WHERE inv.status = 4
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0) AS CashOut,

        ISNULL((
            SELECT SUM(inv.total_amount)
            FROM dbo.invoices inv
            WHERE inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0) AS GrossRevenue,

        ISNULL((
            SELECT COUNT(1)
            FROM dbo.invoices inv
            WHERE inv.status = 2
              AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
              AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        ), 0) AS TransactionCount
    WHERE @ComparePrevious = 1;
END
GO
