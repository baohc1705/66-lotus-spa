/*
================================================================================
 usp_GetTopRevenueItems
================================================================================
 Muc dich:
   Lay top N mat hang (dich vu / san pham / lieu trinh) co doanh thu cao nhat
   trong ky, kem so luong ban va ty le % trong tong top.

 Input:
   @SalonId  INT  = NULL - Loc theo salon; NULL = tat ca salon.
   @FromDate DATE        - Ngay bat dau (gio VN, inclusive).
   @ToDate   DATE        - Ngay ket thuc (gio VN, inclusive).
   @ItemType INT         - Loai hang: 1=dich vu, 2=san pham, 3=lieu trinh.
   @Limit    INT  = 5    - So dong top tra ve.

 Output:
   ItemId    INT      - ref_id cua dich vu/san pham/lieu trinh tren dong hoa don.
   ItemName  NVARCHAR - Ten hang (lay MAX vi cung ref_id co the khac ten snapshot).
   ItemType  INT      - Ma loai hang.
   Quantity  DECIMAL  - Tong so luong ban trong ky.
   Revenue   DECIMAL  - Tong line_total trong ky.
   Percent   DECIMAL  - Ty le % doanh thu item so voi tong Revenue cua top (lam tron).

 Vi du:
   EXEC dbo.usp_GetTopRevenueItems @SalonId = 1, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @ItemType = 1, @Limit = 5;
   EXEC dbo.usp_GetTopRevenueItems @SalonId = NULL, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @ItemType = 2, @Limit = 10;
================================================================================
*/
IF OBJECT_ID(N'dbo.usp_GetTopRevenueItems', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTopRevenueItems;
GO

CREATE PROCEDURE dbo.usp_GetTopRevenueItems
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @ItemType INT,
    @Limit    INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    -- Buoc 1: Chon top N theo doanh thu, gom theo ref_id + item_type
    ;WITH top_rows AS (
        SELECT TOP (@Limit)
            ii.ref_id AS ItemId,
            MAX(ii.item_name) AS ItemName,
            ii.item_type AS ItemType,
            SUM(ii.quantity) AS Quantity,
            SUM(ii.line_total) AS Revenue
        FROM dbo.invoice_items ii
        INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        WHERE ii.status = 1
          AND inv.status = 2
          AND ii.item_type = @ItemType
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY ii.ref_id, ii.item_type
        ORDER BY SUM(ii.line_total) DESC
    )
    -- Buoc 2: Tinh % tung item trong tong doanh thu cua top (khong phai toan bo he thong)
    SELECT
        ItemId,
        ItemName,
        ItemType,
        Quantity,
        Revenue,
        CASE
            WHEN SUM(Revenue) OVER () > 0
                THEN ROUND(Revenue * 100.0 / SUM(Revenue) OVER (), 0)
            ELSE 0
        END AS [Percent]
    FROM top_rows
    ORDER BY Revenue DESC;
END
GO
