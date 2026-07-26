-- Database First: chạy tay trên 66LotusSpaDB
-- Top N dịch vụ / sản phẩm theo doanh thu

IF OBJECT_ID(N'dbo.usp_GetTopRevenueItems', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTopRevenueItems;
GO

CREATE PROCEDURE dbo.usp_GetTopRevenueItems
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @ItemType INT,          -- 1 = service, 2 = product
    @Limit    INT = 5
AS
BEGIN
    SET NOCOUNT ON;

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
    ORDER BY SUM(ii.line_total) DESC;
END
GO
