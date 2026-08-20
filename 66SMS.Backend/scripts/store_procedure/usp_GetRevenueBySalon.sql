/*
================================================================================
 usp_GetRevenueBySalon
================================================================================
 Muc dich:
   Bao cao doanh thu theo tung salon trong ky hien tai, co the kem ky truoc
   (cung do dai ngay) de so sanh. Tra ve dong 'current' va 'previous'.

 Input:
   @FromDate        DATE - Ngay bat dau ky hien tai (gio VN, inclusive).
   @ToDate          DATE - Ngay ket thuc ky hien tai (gio VN, inclusive).
   @ComparePrevious BIT  = 0 - 1 = them du lieu ky truoc; 0 = chi ky hien tai.

 Output:
   PeriodTag         NVARCHAR - 'current' hoac 'previous'.
   SalonId           INT      - Id salon.
   SalonCode         NVARCHAR - Ma salon.
   SalonName         NVARCHAR - Ten salon.
   CashIn            DECIMAL  - Tong tien thu (paid_amount hoa don da thanh toan).
   CashOut           DECIMAL  - Tong tien chi = hoan tien + hoa hong nhan vien.
   GrossRevenue      DECIMAL  - Tong total_amount hoa don da thanh toan.
   TransactionCount  INT      - So hoa don da thanh toan trong ky.

 Vi du:
   EXEC dbo.usp_GetRevenueBySalon @FromDate = '2026-08-01', @ToDate = '2026-08-31', @ComparePrevious = 1;
   EXEC dbo.usp_GetRevenueBySalon @FromDate = '2026-08-01', @ToDate = '2026-08-07', @ComparePrevious = 0;
================================================================================
*/
IF OBJECT_ID(N'dbo.usp_GetRevenueBySalon', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueBySalon;
GO

CREATE PROCEDURE dbo.usp_GetRevenueBySalon
    @FromDate         DATE,
    @ToDate           DATE,
    @ComparePrevious  BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Tinh do dai ky hien tai de suy ra ky truoc cung so ngay
    DECLARE @Days INT = DATEDIFF(DAY, @FromDate, @ToDate) + 1;
    DECLARE @PrevTo   DATE = DATEADD(DAY, -1, @FromDate);
    DECLARE @PrevFrom DATE = DATEADD(DAY, 1 - @Days, @PrevTo);

    -- Buoc 1: Tong hop hoa don theo salon - ky hien tai
    -- status 2 = da thanh toan (CashIn, GrossRevenue), status 4 = da hoan tien (RefundOut)
    SELECT
        inv.salon_id AS SalonId,
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END) AS CashIn,
        SUM(CASE WHEN inv.status = 4 THEN inv.paid_amount ELSE 0 END) AS RefundOut,
        SUM(CASE WHEN inv.status = 2 THEN inv.total_amount ELSE 0 END) AS GrossRevenue,
        SUM(CASE WHEN inv.status = 2 THEN 1 ELSE 0 END) AS TransactionCount
    INTO #InvCurr
    FROM dbo.invoices inv
    WHERE inv.status IN (2, 4)
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- Buoc 2: Tong hoa hong nhan vien theo salon - ky hien tai
    -- Lay tu invoice_items vi commission gan voi tung dong dich vu/san pham
    SELECT
        inv.salon_id AS SalonId,
        SUM(ii.commission_amount) AS CommissionOut
    INTO #CommCurr
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- Buoc 3: Tong hop hoa don theo salon - ky truoc (chi chay khi @ComparePrevious = 1)
    SELECT
        inv.salon_id AS SalonId,
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END) AS CashIn,
        SUM(CASE WHEN inv.status = 4 THEN inv.paid_amount ELSE 0 END) AS RefundOut,
        SUM(CASE WHEN inv.status = 2 THEN inv.total_amount ELSE 0 END) AS GrossRevenue,
        SUM(CASE WHEN inv.status = 2 THEN 1 ELSE 0 END) AS TransactionCount
    INTO #InvPrev
    FROM dbo.invoices inv
    WHERE @ComparePrevious = 1
      AND inv.status IN (2, 4)
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
    GROUP BY inv.salon_id;

    -- Buoc 4: Tong hoa hong theo salon - ky truoc
    SELECT
        inv.salon_id AS SalonId,
        SUM(ii.commission_amount) AS CommissionOut
    INTO #CommPrev
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE @ComparePrevious = 1
      AND ii.status = 1
      AND inv.status = 2
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
    GROUP BY inv.salon_id;

    -- Buoc 5: Ghep salon dang hoat dong voi so lieu ky hien tai
    -- LEFT JOIN de salon khong co giao dich van tra ve 0 thay vi mat dong
    SELECT
        N'current' AS PeriodTag,
        s.id AS SalonId,
        s.code AS SalonCode,
        s.name AS SalonName,
        ISNULL(i.CashIn, 0) AS CashIn,
        ISNULL(i.RefundOut, 0) + ISNULL(c.CommissionOut, 0) AS CashOut,
        ISNULL(i.GrossRevenue, 0) AS GrossRevenue,
        ISNULL(i.TransactionCount, 0) AS TransactionCount
    FROM dbo.salons s
    LEFT JOIN #InvCurr i ON i.SalonId = s.id
    LEFT JOIN #CommCurr c ON c.SalonId = s.id
    WHERE s.status = 1

    UNION ALL

    -- Buoc 6: Tuong tu ky truoc; chi xuat khi bat so sanh
    SELECT
        N'previous' AS PeriodTag,
        s.id AS SalonId,
        s.code AS SalonCode,
        s.name AS SalonName,
        ISNULL(i.CashIn, 0) AS CashIn,
        ISNULL(i.RefundOut, 0) + ISNULL(c.CommissionOut, 0) AS CashOut,
        ISNULL(i.GrossRevenue, 0) AS GrossRevenue,
        ISNULL(i.TransactionCount, 0) AS TransactionCount
    FROM dbo.salons s
    LEFT JOIN #InvPrev i ON i.SalonId = s.id
    LEFT JOIN #CommPrev c ON c.SalonId = s.id
    WHERE s.status = 1
      AND @ComparePrevious = 1

    ORDER BY PeriodTag, GrossRevenue DESC;

    DROP TABLE #InvCurr;
    DROP TABLE #CommCurr;
    DROP TABLE #InvPrev;
    DROP TABLE #CommPrev;
END
GO
