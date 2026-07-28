-- Database First: chạy tay trên 66LotusSpaDB
-- Doanh thu theo dịch vụ trong 1 chi nhánh (xuất Excel)
-- item_type = 1 (service)

IF OBJECT_ID(N'dbo.usp_GetRevenueByProduct', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueByProduct;
GO

IF OBJECT_ID(N'dbo.usp_GetRevenueByService', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueByService;
GO

CREATE PROCEDURE dbo.usp_GetRevenueByService
    @SalonId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ii.ref_id AS ItemId,
        MAX(ii.item_name) AS ItemName,
        SUM(ii.quantity) AS Quantity,
        SUM(ii.line_total) AS Revenue
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.item_type = 1
      AND inv.salon_id = @SalonId
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY ii.ref_id
    ORDER BY SUM(ii.line_total) DESC;
END
GO
