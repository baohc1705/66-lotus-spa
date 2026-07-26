-- Database First: chạy tay trên 66LotusSpaDB
-- Doanh thu gross theo ngày × chi nhánh (cho sheet Excel pivot)

IF OBJECT_ID(N'dbo.usp_GetRevenueBySalonDaily', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueBySalonDaily;
GO

CREATE PROCEDURE dbo.usp_GetRevenueBySalonDaily
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS [Date],
        s.id AS SalonId,
        s.name AS SalonName,
        SUM(inv.total_amount) AS GrossRevenue
    FROM dbo.invoices inv
    INNER JOIN dbo.salons s ON s.id = inv.salon_id
    WHERE inv.status = 2
      AND s.status = 1
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE),
        s.id,
        s.name
    ORDER BY [Date], s.name;
END
GO
