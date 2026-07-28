-- Database First: chạy tay trên 66LotusSpaDB
-- Doanh thu theo kỹ thuật viên trong 1 chi nhánh (xuất Excel)

IF OBJECT_ID(N'dbo.usp_GetRevenueByStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueByStaff;
GO

CREATE PROCEDURE dbo.usp_GetRevenueByStaff
    @SalonId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ii.staff_id AS StaffId,
        MAX(st.full_name) AS StaffName,
        SUM(ii.quantity) AS Quantity,
        SUM(ii.line_total) AS Revenue,
        SUM(ii.commission_amount) AS Commission
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    INNER JOIN dbo.staffs st ON st.id = ii.staff_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL
      AND inv.salon_id = @SalonId
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY ii.staff_id
    ORDER BY SUM(ii.line_total) DESC;
END
GO
