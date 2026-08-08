IF OBJECT_ID(N'dbo.usp_GetTopRevenueItems', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTopRevenueItems;
GO

CREATE PROCEDURE dbo.usp_GetTopRevenueItems
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @ItemType INT,
    @Limit    INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH top_rows AS (
        SELECT TOP (@Limit)
            ii.ref_id AS ItemId,
            MAX(ii.item_name) AS ItemName,
            ii.item_type AS ItemType,
            SUM(ii.quantity) AS Quantity,
            SUM(ii.line_total) AS Revenue
        FROM dbo.invoice_items ii
        INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        WHERE ii.status = 1
          AND inv.status = 2
          AND ii.item_type = @ItemType
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY ii.ref_id, ii.item_type
        ORDER BY SUM(ii.line_total) DESC
    )
    SELECT
        ItemId,
        ItemName,
        ItemType,
        Quantity,
        Revenue,
        CASE
            WHEN SUM(Revenue) OVER () > 0
                THEN ROUND(Revenue * 100.0 / SUM(Revenue) OVER (), 0)
            ELSE 0
        END AS Percent
    FROM top_rows
    ORDER BY Revenue DESC;
END
GO
