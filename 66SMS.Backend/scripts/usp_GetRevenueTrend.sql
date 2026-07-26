-- Database First: chạy tay trên 66LotusSpaDB
-- Dòng tiền theo ngày (chỉ ngày có phát sinh)
-- CashIn = hóa đơn PAID; CashOut = hoàn tiền + hoa hồng ngày đó

IF OBJECT_ID(N'dbo.usp_GetRevenueTrend', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueTrend;
GO

CREATE PROCEDURE dbo.usp_GetRevenueTrend
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Thu / hoàn theo ngày
    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS [Date],
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END) AS PaidIn,
        SUM(CASE WHEN inv.status = 4 THEN inv.paid_amount ELSE 0 END) AS RefundOut
    INTO #InvByDay
    FROM dbo.invoices inv
    WHERE inv.status IN (2, 4)
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE);

    -- Hoa hồng theo ngày
    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS [Date],
        SUM(ii.commission_amount) AS CommissionOut
    INTO #CommByDay
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE);

    SELECT
        i.[Date],
        ISNULL(i.PaidIn, 0) AS CashIn,
        ISNULL(i.RefundOut, 0) + ISNULL(c.CommissionOut, 0) AS CashOut
    FROM #InvByDay i
    LEFT JOIN #CommByDay c ON c.[Date] = i.[Date]
    ORDER BY i.[Date];

    DROP TABLE #InvByDay;
    DROP TABLE #CommByDay;
END
GO
