/*
================================================================================
 usp_GetRevenueBreakdown
================================================================================
 Muc dich:
   Tong hop doanh thu theo loai hang tren hoa don (dich vu / san pham / lieu trinh)
   trong khoang ngay, tinh them ty le phan tram tung loai so voi tong.

 Input:
   @SalonId  INT  = NULL  - Loc theo salon; NULL = tat ca salon.
   @FromDate DATE         - Ngay bat dau (theo gio VN, inclusive).
   @ToDate   DATE         - Ngay ket thuc (theo gio VN, inclusive).

 Output:
   ItemType  INT           - Ma loai hang (1=dich vu, 2=san pham, 3=lieu trinh, khac).
   Label     NVARCHAR      - Ten hien thi tieng Viet cua loai hang.
   Amount    DECIMAL       - Tong line_total cua loai hang trong ky.
   Percent   DECIMAL       - Ty le % lam tron, tinh tren tong Amount cua tat ca loai.

 Vi du:
   EXEC dbo.usp_GetRevenueBreakdown @SalonId = 1, @FromDate = '2026-08-01', @ToDate = '2026-08-31';
   EXEC dbo.usp_GetRevenueBreakdown @SalonId = NULL, @FromDate = '2026-08-01', @ToDate = '2026-08-31';
================================================================================
*/
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

    -- Buoc 1: Gom doanh thu theo item_type tu cac dong hoa don hop le
    ;WITH raw_rows AS (
        SELECT
            ii.item_type AS ItemType,
            -- Map ma loai sang nhan tieng Viet de FE hien thi truc tiep
            CASE ii.item_type
                WHEN 1 THEN N'Dịch vụ'
                WHEN 2 THEN N'Sản phẩm'
                WHEN 3 THEN N'Liệu trình'
                ELSE N'Khác'
            END AS Label,
            SUM(ii.line_total) AS Amount
        FROM dbo.invoice_items ii
        INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        WHERE ii.status = 1              -- Chi dong hang con hieu luc (khong bi xoa)
          AND inv.status = 2             -- Chi hoa don da thanh toan
          -- issued_at luu UTC; chuyen +07:00 de loc theo ngay kinh doanh VN
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY ii.item_type
    )
    -- Buoc 2: Tinh ty le % tung loai tren tong doanh thu ky (window function)
    SELECT
        ItemType,
        Label,
        Amount,
        CASE
            WHEN SUM(Amount) OVER () > 0
                THEN ROUND(Amount * 100.0 / SUM(Amount) OVER (), 0)
            ELSE 0
        END AS [Percent]
    FROM raw_rows
    ORDER BY ItemType;
END
GO
