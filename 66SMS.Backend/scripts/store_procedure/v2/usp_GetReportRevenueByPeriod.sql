IF OBJECT_ID(N'dbo.usp_GetReportRevenueByPeriod', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueByPeriod;
GO

-- Báo cáo doanh thu theo kỳ (ngày/tuần/tháng/quý/năm), dùng cho màn hình report tổng quan.
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để xác định "ngày làm việc",
-- sau đó gom ngày đó vào 1 "kỳ" (PeriodKey) tùy theo @Grain đã chọn.
--
-- @Grain quyết định cách gom kỳ:
--   'day'     -> mỗi ngày là 1 kỳ, PeriodKey dạng "2026-08-20"
--   'week'    -> mỗi tuần là 1 kỳ, PeriodKey dạng "2026-W34"
--   'month'   -> mỗi tháng là 1 kỳ, PeriodKey dạng "2026-08"
--   'quarter' -> mỗi quý là 1 kỳ,  PeriodKey dạng "2026-Q3"
--   'year'    -> mỗi năm là 1 kỳ,  PeriodKey dạng "2026"
--
-- Cách dùng:
--   -- tất cả chi nhánh, theo ngày
--   EXEC dbo.usp_GetReportRevenueByPeriod
--        @SalonId = NULL, @FromDate = '2026-07-01', @ToDate = '2026-07-30', @Grain = N'day';
--
--   -- 1 chi nhánh (SalonId = 1), theo tháng
--   EXEC dbo.usp_GetReportRevenueByPeriod
--        @SalonId = 1, @FromDate = '2026-01-01', @ToDate = '2026-07-30', @Grain = N'month';
--
--   -- theo tuần / quý / năm
--   EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-07-01', '2026-07-30', N'week';
--   EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-01-01', '2026-12-31', N'quarter';
--   EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-01-01', '2026-12-31', N'year';
--
-- Input mẫu:
--   @SalonId  = 1             -- chỉ tính salon id 1, truyền NULL để tính tất cả salon
--   @FromDate = '2026-01-01'  -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-07-30'  -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--   @Grain    = N'month'      -- gom theo tháng
--
-- Output mẫu (@Grain = 'month'):
--   PeriodKey | OrderCount | InvoiceTotal | CommissionTotal | CashOut  | TotalRevenue
--   ----------|------------|--------------|------------------|----------|-------------
--   2026-01   | 120        | 45000000     | 6500000          | 6800000  | 38500000
--   2026-02   | 98         | 38000000     | 5200000          | 5200000  | 32800000
--   -- OrderCount       = số hóa đơn đã thanh toán (status = 2) trong kỳ
--   -- InvoiceTotal     = tổng tiền hóa đơn đã thanh toán trong kỳ
--   -- CommissionTotal  = tổng hoa hồng đã trả cho thợ trong kỳ
--   -- CashOut          = hoa hồng + tiền hoàn trả cho khách (invoice status = 4) trong kỳ
--   -- TotalRevenue     = doanh thu thuần = InvoiceTotal - CommissionTotal
CREATE PROCEDURE dbo.usp_GetReportRevenueByPeriod
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Grain    NVARCHAR(10) = N'day'   -- day | week | month | quarter | year
AS
BEGIN
    SET NOCOUNT ON;
    SET @Grain = LOWER(ISNULL(@Grain, N'day'));

    -- dựng sẵn 1 bảng "lịch kỳ": mỗi ngày trong khoảng @FromDate-@ToDate tương ứng với 1 PeriodKey.
    -- công thức gom kỳ (CASE theo @Grain) chỉ viết Ở ĐÂY 1 LẦN DUY NHẤT, sau đó cả doanh thu
    -- lẫn hoa hồng đều join vào bảng này để lấy PeriodKey, khỏi phải lặp lại CASE ở nhiều chỗ.
    DECLARE @lich_ky TABLE (Ngay DATE NOT NULL PRIMARY KEY, PeriodKey NVARCHAR(10) NOT NULL);

    DECLARE @ngay_dem DATE = @FromDate;
    WHILE @ngay_dem <= @ToDate
    BEGIN
        INSERT INTO @lich_ky (Ngay, PeriodKey)
        VALUES (
            @ngay_dem,
            CASE
                WHEN @Grain = N'week'    THEN CAST(YEAR(@ngay_dem) AS NVARCHAR(4)) + N'-W' + CAST(DATEPART(WEEK, @ngay_dem) AS NVARCHAR(2))
                WHEN @Grain = N'month'   THEN CAST(YEAR(@ngay_dem) AS NVARCHAR(4)) + N'-' + RIGHT(N'0' + CAST(MONTH(@ngay_dem) AS NVARCHAR(2)), 2)
                WHEN @Grain = N'quarter' THEN CAST(YEAR(@ngay_dem) AS NVARCHAR(4)) + N'-Q' + CAST(DATEPART(QUARTER, @ngay_dem) AS NVARCHAR(1))
                WHEN @Grain = N'year'    THEN CAST(YEAR(@ngay_dem) AS NVARCHAR(4))
                ELSE CONVERT(NVARCHAR(10), @ngay_dem, 23)
            END
        );
        SET @ngay_dem = DATEADD(DAY, 1, @ngay_dem);
    END;

    ;WITH hoa_don_vn AS (
        -- hóa đơn đã thanh toán (2) hoặc đã hoàn tiền (4), gắn sẵn PeriodKey qua join lịch kỳ
        SELECT lk.PeriodKey, inv.status, inv.total_amount, inv.paid_amount
        FROM dbo.invoices inv
        CROSS APPLY (SELECT CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS Ngay) ngay_vn
        JOIN @lich_ky lk ON lk.Ngay = ngay_vn.Ngay
        WHERE inv.status IN (2, 4)
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    ),
    doanh_thu_theo_ky AS (
        -- cộng theo kỳ: số đơn, tổng tiền hóa đơn, tổng tiền hoàn trả
        SELECT
            PeriodKey,
            SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS OrderCount,
            SUM(CASE WHEN status = 2 THEN total_amount ELSE 0 END) AS InvoiceTotal,
            SUM(CASE WHEN status = 4 THEN paid_amount ELSE 0 END) AS RefundOut
        FROM hoa_don_vn
        GROUP BY PeriodKey
    ),
    hoa_hong_theo_ky AS (
        -- hoa hồng đã trả (chỉ tính dòng active, thuộc hóa đơn đã thanh toán), gắn PeriodKey qua join lịch kỳ
        SELECT lk.PeriodKey, SUM(ii.commission_amount) AS CommissionTotal
        FROM dbo.invoice_items ii
        JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        CROSS APPLY (SELECT CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS Ngay) ngay_vn
        JOIN @lich_ky lk ON lk.Ngay = ngay_vn.Ngay
        WHERE ii.status = 1
          AND inv.status = 2
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY lk.PeriodKey
    )
    SELECT
        dt.PeriodKey,
        dt.OrderCount,
        dt.InvoiceTotal,
        ISNULL(hh.CommissionTotal, 0)                    AS CommissionTotal,
        ISNULL(hh.CommissionTotal, 0) + dt.RefundOut      AS CashOut,
        dt.InvoiceTotal - ISNULL(hh.CommissionTotal, 0)   AS TotalRevenue
    FROM doanh_thu_theo_ky dt
    LEFT JOIN hoa_hong_theo_ky hh ON hh.PeriodKey = dt.PeriodKey
    ORDER BY dt.PeriodKey;
END
GO

-- Tất cả chi nhánh, theo ngày
EXEC dbo.usp_GetReportRevenueByPeriod
    @SalonId  = NULL,
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30',
    @Grain    = N'day';

-- 1 chi nhánh (vd SalonId = 1), theo tháng
EXEC dbo.usp_GetReportRevenueByPeriod
    @SalonId  = 1,
    @FromDate = '2026-01-01',
    @ToDate   = '2026-07-30',
    @Grain    = N'month';

-- Theo tuần / quý / năm
EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-07-01', '2026-07-30', N'week';
EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-01-01', '2026-12-31', N'quarter';
EXEC dbo.usp_GetReportRevenueByPeriod NULL, '2026-01-01', '2026-12-31', N'year';