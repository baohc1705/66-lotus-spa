IF OBJECT_ID(N'dbo.usp_GetNetRevenue', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetNetRevenue;
GO

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
