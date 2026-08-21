/*
================================================================================
 usp_GetTopStaff
================================================================================
 Muc dich:
   Lay top N nhan vien co doanh thu cao nhat (theo line_total dong hoa don)
   trong ky hien tai, kem so luong dich vu, hoa hong va % tang truong so voi ky truoc.

 Input:
   @SalonId  INT  = NULL - Loc theo salon; NULL = tat ca salon.
   @FromDate DATE        - Ngay bat dau ky hien tai (gio VN, inclusive).
   @ToDate   DATE        - Ngay ket thuc ky hien tai (gio VN, inclusive).
   @Limit    INT  = 5    - So nhan vien top tra ve.

 Output:
   StaffId         INT      - Id nhan vien.
   StaffName       NVARCHAR - Ho ten nhan vien.
   Revenue         DECIMAL  - Tong doanh thu (line_total) ky hien tai.
   Quantity        DECIMAL  - Tong so luong dich vu/san pham da thuc hien.
   Commission      DECIMAL  - Tong hoa hong ky hien tai.
   GrowthPercent   INT      - % tang/giam doanh thu so voi ky truoc (lam tron); 0 neu ky truoc = 0.

 Vi du:
   EXEC dbo.usp_GetTopStaff @SalonId = 1, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @Limit = 5;
   EXEC dbo.usp_GetTopStaff @SalonId = NULL, @FromDate = '2026-08-01', @ToDate = '2026-08-07', @Limit = 10;
================================================================================
*/
IF OBJECT_ID(N'dbo.usp_GetTopStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTopStaff;
GO

CREATE PROCEDURE dbo.usp_GetTopStaff
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Limit    INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    -- Tinh ky truoc cung do dai voi ky hien tai de so sanh tang truong
    DECLARE @Days INT = DATEDIFF(DAY, @FromDate, @ToDate) + 1;
    DECLARE @PrevTo   DATE = DATEADD(DAY, -1, @FromDate);
    DECLARE @PrevFrom DATE = DATEADD(DAY, 1 - @Days, @PrevTo);

    -- Buoc 1: Tong hop doanh thu, so luong, hoa hong theo nhan vien - ky hien tai
    SELECT
        ii.staff_id AS StaffId,
        MAX(st.full_name) AS StaffName,
        SUM(ii.line_total) AS Revenue,
        SUM(ii.quantity) AS Quantity,
        SUM(ii.commission_amount) AS Commission
    INTO #Curr
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    INNER JOIN dbo.staffs st ON st.id = ii.staff_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL   -- Bo dong khong gan nhan vien
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY ii.staff_id;

    -- Buoc 2: Chi can Revenue ky truoc de tinh GrowthPercent
    SELECT
        ii.staff_id AS StaffId,
        SUM(ii.line_total) AS Revenue
    INTO #Prev
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND ii.staff_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
      AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    GROUP BY ii.staff_id;

    -- Buoc 3: Lay top theo Revenue hien tai, join ky truoc de tinh % tang truong
    SELECT TOP (@Limit)
        c.StaffId,
        c.StaffName,
        c.Revenue,
        c.Quantity,
        c.Commission,
        CASE
            WHEN ISNULL(p.Revenue, 0) = 0 THEN 0
            ELSE CAST(ROUND(100.0 * (c.Revenue - p.Revenue) / p.Revenue, 0) AS INT)
        END AS GrowthPercent
    FROM #Curr c
    LEFT JOIN #Prev p ON p.StaffId = c.StaffId
    ORDER BY c.Revenue DESC;

    DROP TABLE #Curr;
    DROP TABLE #Prev;
END
GO
