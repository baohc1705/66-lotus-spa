IF OBJECT_ID(N'dbo.usp_GetRevenueSummary', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRevenueSummary;
GO

-- Tổng hợp dòng tiền và doanh thu trong khoảng ngày, có thể so sánh với kỳ trước cùng độ dài.
-- Dùng cho báo cáo tài chính dashboard: tiền vào, tiền ra, doanh thu gộp, số giao dịch, AOV.
--
-- Input:
--   @SalonId         INT  = NULL  -- lọc theo salon; NULL = toàn hệ thống (và cộng thêm nạp ví)
--   @FromDate        DATE         -- ngày bắt đầu kỳ hiện tại (bao gồm)
--   @ToDate          DATE         -- ngày kết thúc kỳ hiện tại (bao gồm)
--   @ComparePrevious BIT  = 0     -- 1 = trả thêm 1 dòng kỳ trước (cùng số ngày, ngay trước @FromDate)
--
-- Output: 1 hoặc 2 dòng (multi row khi @ComparePrevious = 1)
--   PeriodTag          NVARCHAR    -- 'current' hoặc 'previous'
--   CashIn             DECIMAL     -- tiền thu: paid_amount hóa đơn paid + nạp ví (chỉ khi @SalonId NULL)
--   CashOut            DECIMAL     -- tiền chi: hoa hồng staff + hoàn tiền (invoice refunded)
--   NetCashFlow        DECIMAL     -- CashIn - CashOut
--   GrossRevenue       DECIMAL     -- tổng total_amount hóa đơn paid
--   TransactionCount   INT         -- số hóa đơn paid trong kỳ
--   AverageOrderValue  DECIMAL     -- GrossRevenue / TransactionCount, làm tròn; 0 nếu không có giao dịch
--
-- Ví dụ EXEC:
--   EXEC dbo.usp_GetRevenueSummary @SalonId = 3, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @ComparePrevious = 0;
--   EXEC dbo.usp_GetRevenueSummary @SalonId = NULL, @FromDate = '2026-08-01', @ToDate = '2026-08-07', @ComparePrevious = 1;
CREATE PROCEDURE dbo.usp_GetRevenueSummary
    @SalonId          INT  = NULL,
    @FromDate         DATE,
    @ToDate           DATE,
    @ComparePrevious  BIT  = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- số ngày kỳ hiện tại để tính kỳ trước cùng độ dài
    DECLARE @Days INT = DATEDIFF(DAY, @FromDate, @ToDate) + 1;
    DECLARE @PrevTo   DATE = DATEADD(DAY, -1, @FromDate);
    DECLARE @PrevFrom DATE = DATEADD(DAY, 1 - @Days, @PrevTo);

    -- gom số liệu kỳ current và (tuỳ chọn) previous bằng UNION ALL
    ;WITH period_raw AS (
        -- kỳ hiện tại: @FromDate .. @ToDate
        SELECT
            N'current' AS PeriodTag,
            ISNULL((
                SELECT SUM(inv.paid_amount)
                FROM dbo.invoices inv
                WHERE inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0)
            -- nạp ví (wallet type 3) chỉ cộng khi xem toàn hệ thống, không gắn salon cụ thể
            + CASE WHEN @SalonId IS NULL THEN ISNULL((
                SELECT SUM(wt.amount)
                FROM dbo.wallet_transactions wt
                WHERE wt.type = 3
                  AND wt.status = 1
                  AND CAST(SWITCHOFFSET(wt.created_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
            ), 0) ELSE 0 END AS CashIn,

            ISNULL((
                SELECT SUM(ii.commission_amount)
                FROM dbo.invoice_items ii
                INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
                WHERE ii.status = 1
                  AND inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0)
            + ISNULL((
                SELECT SUM(inv.paid_amount)
                FROM dbo.invoices inv
                WHERE inv.status = 4
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0) AS CashOut,

            ISNULL((
                SELECT SUM(inv.total_amount)
                FROM dbo.invoices inv
                WHERE inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0) AS GrossRevenue,

            ISNULL((
                SELECT COUNT(1)
                FROM dbo.invoices inv
                WHERE inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0) AS TransactionCount

        UNION ALL

        -- kỳ trước: cùng logic, chỉ chạy khi @ComparePrevious = 1
        SELECT
            N'previous' AS PeriodTag,
            ISNULL((
                SELECT SUM(inv.paid_amount)
                FROM dbo.invoices inv
                WHERE inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0)
            + CASE WHEN @SalonId IS NULL THEN ISNULL((
                SELECT SUM(wt.amount)
                FROM dbo.wallet_transactions wt
                WHERE wt.type = 3
                  AND wt.status = 1
                  AND CAST(SWITCHOFFSET(wt.created_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
            ), 0) ELSE 0 END AS CashIn,

            ISNULL((
                SELECT SUM(ii.commission_amount)
                FROM dbo.invoice_items ii
                INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
                WHERE ii.status = 1
                  AND inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0)
            + ISNULL((
                SELECT SUM(inv.paid_amount)
                FROM dbo.invoices inv
                WHERE inv.status = 4
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0) AS CashOut,

            ISNULL((
                SELECT SUM(inv.total_amount)
                FROM dbo.invoices inv
                WHERE inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0) AS GrossRevenue,

            ISNULL((
                SELECT COUNT(1)
                FROM dbo.invoices inv
                WHERE inv.status = 2
                  AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @PrevFrom AND @PrevTo
                  AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
            ), 0) AS TransactionCount
        WHERE @ComparePrevious = 1
    )
    -- tính NetCashFlow và AOV từ các cột đã gom
    SELECT
        PeriodTag,
        CashIn,
        CashOut,
        CashIn - CashOut AS NetCashFlow,
        GrossRevenue,
        TransactionCount,
        CASE
            WHEN TransactionCount > 0 THEN ROUND(GrossRevenue / TransactionCount, 0)
            ELSE 0
        END AS AverageOrderValue
    FROM period_raw;
END
GO
