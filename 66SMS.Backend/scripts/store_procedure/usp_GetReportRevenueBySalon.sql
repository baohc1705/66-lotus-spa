IF OBJECT_ID(N'dbo.usp_GetReportRevenueBySalon', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetReportRevenueBySalon;
GO

-- Mục đích: Báo cáo doanh thu theo TỪNG SALON trong khoảng ngày, dùng cho màn hình so sánh chi nhánh.
-- Luôn trả về TẤT CẢ salon đang active, kể cả salon không phát sinh doanh thu (số liệu = 0).
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để lọc theo ngày.
--
-- Input:
--   @FromDate DATE   -- từ ngày (theo giờ VN, bao gồm)
--   @ToDate   DATE   -- đến ngày (theo giờ VN, bao gồm)
--
-- Output:
--   SalonId         INT        -- id salon
--   SalonName       NVARCHAR   -- tên salon
--   StaffCount      INT        -- số nhân viên đang gán vào salon (không phụ thuộc khoảng ngày)
--   OrderCount      INT        -- số hóa đơn đã thanh toán (status = 2)
--   CashIn          DECIMAL    -- tiền thực thu (paid_amount) hóa đơn đã thanh toán
--   CommissionOut   DECIMAL    -- tổng hoa hồng đã trả cho thợ
--   TotalRevenue    DECIMAL    -- CashIn - CommissionOut
--   Lưu ý: sắp xếp giảm dần theo tổng total_amount (chưa trừ hoa hồng), không phải TotalRevenue.
--
-- Ví dụ EXEC:
--   EXEC dbo.usp_GetReportRevenueBySalon @FromDate = '2026-07-01', @ToDate = '2026-07-30';
--   EXEC dbo.usp_GetReportRevenueBySalon '2026-07-01', '2026-07-30';
CREATE PROCEDURE dbo.usp_GetReportRevenueBySalon
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Bước 1: Doanh thu / đã thu / số đơn theo salon
    SELECT
        inv.salon_id AS SalonId,
        SUM(CASE WHEN inv.status = 2 THEN inv.paid_amount ELSE 0 END) AS CashIn,
        SUM(CASE WHEN inv.status = 2 THEN inv.total_amount ELSE 0 END) AS TotalRevenue,
        SUM(CASE WHEN inv.status = 2 THEN 1 ELSE 0 END) AS OrderCount
    INTO #Inv
    FROM dbo.invoices inv
    WHERE inv.status IN (2, 4)
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- Bước 2: Hoa hồng theo salon (dòng active, hóa đơn đã thanh toán)
    SELECT
        inv.salon_id AS SalonId,
        SUM(ii.commission_amount) AS CommissionOut
    INTO #Comm
    FROM dbo.invoice_items ii
    INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.status = 1
      AND inv.status = 2
      AND inv.salon_id IS NOT NULL
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY inv.salon_id;

    -- Bước 3: Số nhân viên theo salon (không phụ thuộc khoảng ngày)
    SELECT
        ss.salon_id AS SalonId,
        COUNT(*) AS StaffCount
    INTO #Staff
    FROM dbo.staff_salons ss
    WHERE ss.status = 1
    GROUP BY ss.salon_id;

    -- Bước 4: Ghép lại; luôn lấy hết salon đang active, salon không có phát sinh thì số liệu = 0
    SELECT
        s.id AS SalonId,
        s.name AS SalonName,
        ISNULL(st.StaffCount, 0) AS StaffCount,
        ISNULL(i.OrderCount, 0) AS OrderCount,
        ISNULL(i.CashIn, 0) AS CashIn,
        ISNULL(c.CommissionOut, 0) AS CommissionOut,
        ISNULL(i.CashIn, 0) - ISNULL(c.CommissionOut, 0) AS TotalRevenue
    FROM dbo.salons s
    LEFT JOIN #Inv i ON i.SalonId = s.id
    LEFT JOIN #Comm c ON c.SalonId = s.id
    LEFT JOIN #Staff st ON st.SalonId = s.id
    WHERE s.status = 1
    ORDER BY ISNULL(i.TotalRevenue, 0) DESC, s.name;

    DROP TABLE #Inv;
    DROP TABLE #Comm;
    DROP TABLE #Staff;
END
GO

EXEC dbo.usp_GetReportRevenueBySalon
    @FromDate = '2026-07-01',
    @ToDate   = '2026-07-30';

-- Viết ngắn (đúng thứ tự param)
EXEC dbo.usp_GetReportRevenueBySalon '2026-07-01', '2026-07-30';
