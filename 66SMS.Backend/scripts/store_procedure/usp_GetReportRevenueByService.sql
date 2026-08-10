IF OBJECT_ID(N'dbo.usp_GetReportRevenueByService', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueByService;
GO

CREATE PROCEDURE dbo.usp_GetReportRevenueByService
    @SalonId    INT = NULL,
    @CategoryId INT = NULL,   -- NULL = tất cả nhóm
    @FromDate   DATE,
    @ToDate     DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ii.ref_id AS ItemId,
        MAX(ii.item_name) AS ItemName,
        SUM(ii.quantity) AS Quantity,
        AVG(ISNULL(ii.commission_rate, 0)) AS AvgCommissionRate,
        SUM(ii.line_total) AS Revenue,
        SUM(ii.commission_amount) AS Commission,
        SUM(ii.line_total) - SUM(ii.commission_amount) AS TotalRevenue
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    LEFT JOIN dbo.services svc ON svc.id = ii.ref_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.item_type = 1          -- chỉ dịch vụ
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
      AND (@CategoryId IS NULL OR svc.category_id = @CategoryId)
    GROUP BY ii.ref_id
    ORDER BY SUM(ii.line_total) DESC;
END
GO

-- Tất cả chi nhánh + tất cả nhóm DV
EXEC dbo.usp_GetReportRevenueByService
    @SalonId    = NULL,
    @CategoryId = NULL,
    @FromDate   = '2026-07-01',
    @ToDate     = '2026-07-30';

-- Lọc 1 chi nhánh + 1 nhóm dịch vụ (vd CategoryId = 2)
EXEC dbo.usp_GetReportRevenueByService
    @SalonId    = 1,
    @CategoryId = 2,
    @FromDate   = '2026-07-01',
    @ToDate     = '2026-07-30';

EXEC dbo.usp_GetReportRevenueByService NULL, NULL, '2026-07-01', '2026-07-30';