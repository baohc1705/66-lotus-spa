IF OBJECT_ID(N'dbo.usp_GetReportRevenueByStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueByStaff;
GO

CREATE PROCEDURE dbo.usp_GetReportRevenueByStaff
    @SalonId  INT = NULL,   -- NULL = tất cả chi nhánh
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ii.staff_id AS StaffId,
        MAX(st.full_name) AS StaffName,

        -- Số lần phục vụ dịch vụ
        SUM(CASE WHEN ii.item_type = 1 THEN ii.quantity ELSE 0 END) AS ServiceCount,

        -- Tổng tiền dịch vụ đã phục vụ
        SUM(CASE WHEN ii.item_type = 1 THEN ii.line_total ELSE 0 END) AS ServiceRevenue,

        -- Hoa hồng trên dịch vụ
        SUM(CASE WHEN ii.item_type = 1 THEN ii.commission_amount ELSE 0 END) AS Commission,

        -- Tiền mang về cho chi nhánh = tiền DV - hoa hồng
        SUM(CASE WHEN ii.item_type = 1 THEN ii.line_total ELSE 0 END)
            - SUM(CASE WHEN ii.item_type = 1 THEN ii.commission_amount ELSE 0 END)
            AS TotalRevenue
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    INNER JOIN dbo.staffs st ON st.id = ii.staff_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL
      AND ii.item_type = 1          -- chỉ tính dòng dịch vụ
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY ii.staff_id
    ORDER BY TotalRevenue DESC;
END
GO

-- Tất cả chi nhánh
EXEC dbo.usp_GetReportRevenueByStaff
    @SalonId  = NULL,
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30';

-- 1 chi nhánh
EXEC dbo.usp_GetReportRevenueByStaff
    @SalonId  = 1,
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30';

EXEC dbo.usp_GetReportRevenueByStaff NULL, '2026-07-01', '2026-07-30';