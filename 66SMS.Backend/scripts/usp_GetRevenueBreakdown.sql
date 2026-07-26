-- Database First: chạy tay trên 66LotusSpaDB
-- Cơ cấu doanh thu theo loại item (service / product / course)

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
    ORDER BY ii.item_type;
END
GO
