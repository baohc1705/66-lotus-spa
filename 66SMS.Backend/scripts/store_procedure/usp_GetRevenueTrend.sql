/*
================================================================================
 usp_GetRevenueTrend
================================================================================
 Muc dich:
   Bieu do xu huong dong tien theo ngay: tien vao (thu) va tien ra (chi)
   trong khoang thoi gian. Co the loc theo 1 salon hoac toan he thong.

 Input:
   @SalonId  INT  = NULL - Loc theo salon; NULL = tat ca salon.
   @FromDate DATE        - Ngay bat dau (gio VN, inclusive).
   @ToDate   DATE        - Ngay ket thuc (gio VN, inclusive).

 Output:
   Date    DATE    - Ngay phat sinh giao dich (theo gio VN).
   CashIn  DECIMAL - Tong tien thu tu hoa don da thanh toan (paid_amount).
   CashOut DECIMAL - Tong tien chi = hoan tien + hoa hong nhan vien.

 Vi du:
   EXEC dbo.usp_GetRevenueTrend @SalonId = NULL, @FromDate = '2026-08-01', @ToDate = '2026-08-31';
   EXEC dbo.usp_GetRevenueTrend @SalonId = 2, @FromDate = '2026-08-01', @ToDate = '2026-08-07';
================================================================================
*/
IF OBJECT_ID(N'dbo.usp_GetRevenueTrend', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueTrend;
GO

CREATE PROCEDURE dbo.usp_GetRevenueTrend
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Buoc 1: Tong hop tien vao / hoan tien theo ngay tu bang invoices
    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS [Date],
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END) AS PaidIn,
        SUM(CASE WHEN inv.status = 4 THEN inv.paid_amount ELSE 0 END) AS RefundOut
    INTO #InvByDay
    FROM dbo.invoices inv
    WHERE inv.status IN (2, 4)
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE);

    -- Buoc 2: Tong hoa hong nhan vien theo ngay (chi tu hoa don da thanh toan)
    SELECT
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS [Date],
        SUM(ii.commission_amount) AS CommissionOut
    INTO #CommByDay
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE);

    -- Buoc 3: Ghep 2 nguon; CashOut = hoan tien + hoa hong
    -- LEFT JOIN commission vi co ngay chi co thu ma khong co hoa hong
    SELECT
        i.[Date],
        ISNULL(i.PaidIn, 0) AS CashIn,
        ISNULL(i.RefundOut, 0) + ISNULL(c.CommissionOut, 0) AS CashOut
    FROM #InvByDay i
    LEFT JOIN #CommByDay c ON c.[Date] = i.[Date]
    ORDER BY i.[Date];

    DROP TABLE #InvByDay;
    DROP TABLE #CommByDay;
END
GO
