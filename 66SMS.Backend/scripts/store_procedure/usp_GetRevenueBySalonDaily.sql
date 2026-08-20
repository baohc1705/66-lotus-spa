/*
================================================================================
 usp_GetRevenueBySalonDaily
================================================================================
 Muc dich:
   Bao cao doanh thu gop (GrossRevenue) theo tung ngay va tung salon.
   Dung cho bieu do heatmap hoac bang chi tiet doanh thu hang ngay.

 Input:
   @FromDate DATE - Ngay bat dau (gio VN, inclusive).
   @ToDate   DATE - Ngay ket thuc (gio VN, inclusive).

 Output:
   Date          DATE     - Ngay phat sinh hoa don (theo gio VN).
   SalonId       INT      - Id salon.
   SalonName     NVARCHAR - Ten salon.
   GrossRevenue  DECIMAL  - Tong total_amount hoa don da thanh toan trong ngay/salon.

 Vi du:
   EXEC dbo.usp_GetRevenueBySalonDaily @FromDate = '2026-08-01', @ToDate = '2026-08-31';
================================================================================
*/
IF OBJECT_ID(N'dbo.usp_GetRevenueBySalonDaily', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueBySalonDaily;
GO

CREATE PROCEDURE dbo.usp_GetRevenueBySalonDaily
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Gom doanh thu theo cap (ngay, salon); chi tinh hoa don da thanh toan
    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS [Date],
        s.id AS SalonId,
        s.name AS SalonName,
        SUM(inv.total_amount) AS GrossRevenue
    FROM dbo.invoices inv
    INNER JOIN dbo.salons s ON s.id = inv.salon_id
    WHERE inv.status = 2
      AND s.status = 1              -- Chi salon dang hoat dong
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE),
        s.id,
        s.name
    ORDER BY [Date], s.name;
END
GO
