IF OBJECT_ID(N'dbo.usp_GetRevenueBreakdown', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueBreakdown;
GO

CREATE PROCEDURE dbo.usp_GetRevenueBreakdown
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH raw_rows AS (
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
        INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        WHERE ii.status = 1
          AND inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY ii.item_type
    )
    SELECT
        ItemType,
        Label,
        Amount,
        CASE
            WHEN SUM(Amount) OVER () > 0
                THEN ROUND(Amount * 100.0 / SUM(Amount) OVER (), 0)
            ELSE 0
        END AS Percent
    FROM raw_rows
    ORDER BY ItemType;
END
GO
