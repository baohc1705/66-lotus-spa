IF OBJECT_ID(N'dbo.usp_GetReportRevenueBySalon', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueBySalon;
GO

-- Báo cáo doanh thu theo TỪNG SALON trong khoảng ngày, dùng cho màn hình so sánh chi nhánh.
-- Luôn trả về TẤT CẢ salon đang active, kể cả salon không phát sinh doanh thu (số liệu = 0).
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để lọc theo ngày.
--
-- Cách dùng:
--   EXEC dbo.usp_GetReportRevenueBySalon @FromDate = '2026-07-01', @ToDate = '2026-07-30';
--   -- viết ngắn (đúng thứ tự param):
--   EXEC dbo.usp_GetReportRevenueBySalon '2026-07-01', '2026-07-30';
--
-- Input mẫu:
--   @FromDate = '2026-07-01'  -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-07-30'  -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--
-- Output mẫu:
--   SalonId | SalonName    | StaffCount | OrderCount | CashIn    | CommissionOut | TotalRevenue
--   --------|--------------|------------|------------|-----------|----------------|-------------
--   1       | Salon Q1     | 8          | 120        | 45000000  | 6500000        | 38500000
--   2       | Salon Q7     | 5          | 0          | 0         | 0              | 0
--   -- StaffCount      = số nhân viên đang gán vào salon (không phụ thuộc khoảng ngày)
--   -- CashIn          = tiền thực thu (paid_amount) của hóa đơn đã thanh toán (status = 2)
--   -- CommissionOut   = tổng hoa hồng đã trả cho thợ trong khoảng ngày
--   -- TotalRevenue    = CashIn - CommissionOut
--   -- LƯU Ý: kết quả được sắp xếp giảm dần theo TỔNG TIỀN HÓA ĐƠN (total_amount, chưa trừ hoa
--   -- hồng) chứ KHÔNG phải theo cột TotalRevenue hiển thị - đây là hành vi gốc, giữ nguyên khi refactor.
CREATE PROCEDURE dbo.usp_GetReportRevenueBySalon
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- doanh thu / đã thu / số đơn theo salon
    -- TongTienHoaDon = tổng total_amount (dùng để sắp xếp cuối cùng, khác với TotalRevenue hiển thị ở output)
    DECLARE @doanh_thu_salon TABLE (
        SalonId        INT NOT NULL PRIMARY KEY,
        CashIn         DECIMAL(18, 0) NOT NULL,
        TongTienHoaDon DECIMAL(18, 0) NOT NULL,
        OrderCount     INT NOT NULL
    );

    INSERT INTO @doanh_thu_salon (SalonId, CashIn, TongTienHoaDon, OrderCount)
    SELECT
        inv.salon_id,
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END),
        SUM(CASE WHEN inv.status = 2 THEN inv.total_amount ELSE 0 END),
        SUM(CASE WHEN inv.status = 2 THEN 1 ELSE 0 END)
    FROM dbo.invoices inv
    WHERE inv.status IN (2, 4)
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- hoa hồng đã trả theo salon (chỉ tính dòng active, thuộc hóa đơn đã thanh toán)
    DECLARE @hoa_hong_salon TABLE (
        SalonId       INT NOT NULL PRIMARY KEY,
        CommissionOut DECIMAL(18, 0) NOT NULL
    );

    INSERT INTO @hoa_hong_salon (SalonId, CommissionOut)
    SELECT inv.salon_id, SUM(ii.commission_amount)
    FROM dbo.invoice_items ii
    JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- số nhân viên đang gán vào từng salon (không phụ thuộc khoảng ngày @FromDate-@ToDate)
    DECLARE @so_luong_nv_salon TABLE (
        SalonId    INT NOT NULL PRIMARY KEY,
        StaffCount INT NOT NULL
    );

    INSERT INTO @so_luong_nv_salon (SalonId, StaffCount)
    SELECT ss.salon_id, COUNT(*)
    FROM dbo.staff_salons ss
    WHERE ss.status = 1
    GROUP BY ss.salon_id;

    -- ghép lại: luôn lấy hết salon đang active, salon không có phát sinh gì thì số liệu = 0
    SELECT
        s.id                                             AS SalonId,
        s.name                                            AS SalonName,
        ISNULL(sl.StaffCount, 0)                          AS StaffCount,
        ISNULL(dt.OrderCount, 0)                          AS OrderCount,
        ISNULL(dt.CashIn, 0)                              AS CashIn,
        ISNULL(hh.CommissionOut, 0)                       AS CommissionOut,
        ISNULL(dt.CashIn, 0) - ISNULL(hh.CommissionOut, 0) AS TotalRevenue
    FROM dbo.salons s
    LEFT JOIN @doanh_thu_salon dt ON dt.SalonId = s.id
    LEFT JOIN @hoa_hong_salon hh ON hh.SalonId = s.id
    LEFT JOIN @so_luong_nv_salon sl ON sl.SalonId = s.id
    WHERE s.status = 1
    ORDER BY ISNULL(dt.TongTienHoaDon, 0) DESC, s.name;
END
GO

EXEC dbo.usp_GetReportRevenueBySalon
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30';

-- Viết ngắn (đúng thứ tự param)
EXEC dbo.usp_GetReportRevenueBySalon '2026-07-01', '2026-07-30';