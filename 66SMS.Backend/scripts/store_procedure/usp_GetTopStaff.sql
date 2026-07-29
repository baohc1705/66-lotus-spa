IF OBJECT_ID(N'dbo.usp_GetTopStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTopStaff;
GO

CREATE PROCEDURE dbo.usp_GetTopStaff
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Limit    INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Days INT = DATEDIFF(DAY, @FromDate, @ToDate) + 1;
    DECLARE @PrevTo   DATE = DATEADD(DAY, -1, @FromDate);
    DECLARE @PrevFrom DATE = DATEADD(DAY, 1 - @Days, @PrevTo);
    SELECT
        ii.staff_id AS StaffId,
        MAX(st.full_name) AS StaffName,
        SUM(ii.line_total) AS Revenue,
        SUM(ii.quantity) AS Quantity,
        SUM(ii.commission_amount) AS Commission
    INTO #Curr
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    INNER JOIN dbo.staffs st ON st.id = ii.staff_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY ii.staff_id;
    SELECT
        ii.staff_id AS StaffId,
        SUM(ii.line_total) AS Revenue
    INTO #Prev
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY ii.staff_id;

    SELECT TOP (@Limit)
        c.StaffId,
        c.StaffName,
        c.Revenue,
        c.Quantity,
        c.Commission,
        CASE
            WHEN ISNULL(p.Revenue, 0) = 0 THEN 0
            ELSE CAST(ROUND(100.0 * (c.Revenue - p.Revenue) / p.Revenue, 0) AS INT)
        END AS GrowthPercent
    FROM #Curr c
    LEFT JOIN #Prev p ON p.StaffId = c.StaffId
    ORDER BY c.Revenue DESC;

    DROP TABLE #Curr;
    DROP TABLE #Prev;
END
GO
