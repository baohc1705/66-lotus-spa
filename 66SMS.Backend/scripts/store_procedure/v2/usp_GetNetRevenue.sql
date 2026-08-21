IF OBJECT_ID(N'dbo.usp_GetNetRevenue', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetNetRevenue;
GO

-- Thống kê doanh thu thuần (net revenue) trong khoảng ngày, dùng vẽ biểu đồ dashboard.
-- Chỉ tính hóa đơn đã thanh toán xong (status = 2). issued_at lưu theo UTC nên phải quy đổi
-- về giờ Việt Nam (+07:00) trước khi lọc/gom nhóm theo ngày, giờ, thứ.
--   @Tab = 1    -> gom theo GIỜ trong ngày (00:00, 01:00, ..., 23:00)
--   @Tab = 2    -> gom theo THỨ trong tuần (T2..T7, CN)
--   @Tab khác   -> gom theo NGÀY cụ thể
--
-- Cách dùng:
--   -- xem doanh thu theo giờ trong ngày 2026-08-20
--   EXEC dbo.usp_GetNetRevenue @SalonId = 3, @FromDate = '2026-08-20', @ToDate = '2026-08-20', @Tab = 1;
--
--   -- xem doanh thu theo thứ trong tuần, cả tháng 8
--   EXEC dbo.usp_GetNetRevenue @SalonId = 3, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @Tab = 2;
--
--   -- xem doanh thu theo từng ngày, cả tháng 8
--   EXEC dbo.usp_GetNetRevenue @SalonId = 3, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @Tab = 3;
--
-- Input mẫu:
--   @SalonId  = 3            -- chỉ tính hóa đơn của salon id 3, truyền NULL để tính tất cả salon
--   @FromDate = '2026-08-01' -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-08-31' -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--   @Tab      = 1            -- 1 = theo giờ, 2 = theo thứ, còn lại = theo ngày
--
-- Output mẫu (@Tab = 1, theo giờ):
--   Label | Value
--   ------|----------
--   08:00 | 1200000
--   09:00 | 3450000
--
-- Output mẫu (@Tab = 2, theo thứ):
--   Label | Value
--   ------|-----------
--   T2    | 15600000
--   T3    | 12300000
--
-- Output mẫu (@Tab khác 1,2, theo ngày):
--   Label | Value
--   ------|----------
--   08/01 | 5200000
--   08/02 | 6100000
CREATE PROCEDURE dbo.usp_GetNetRevenue
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Tab      TINYINT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Tab = 1
    BEGIN
        -- gom theo giờ xuất hóa đơn (giờ VN), ví dụ 8:15 và 8:45 đều tính vào "08:00"
        -- dùng CROSS APPLY để quy đổi UTC -> giờ VN 1 lần, khỏi phải gọi SWITCHOFFSET lặp lại nhiều chỗ
        SELECT
            RIGHT('0' + CAST(DATEPART(HOUR, gio_vn.thoi_diem) AS VARCHAR(2)), 2) + N':00' AS Label,
            SUM(inv.total_amount) AS Value
        FROM dbo.invoices inv
        CROSS APPLY (SELECT CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATETIME) AS thoi_diem) gio_vn
        WHERE inv.status = 2
          AND CAST(gio_vn.thoi_diem AS DATE) BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY DATEPART(HOUR, gio_vn.thoi_diem)
        ORDER BY DATEPART(HOUR, gio_vn.thoi_diem);
    END
    ELSE IF @Tab = 2
    BEGIN
        -- gom theo thứ trong tuần (giờ VN), nhãn tiếng Việt T2 (thứ 2) -> T7 (thứ 7), CN (chủ nhật)
        -- lưu ý: DATEPART(WEEKDAY,...) phụ thuộc @@DATEFIRST của server, mặc định Chủ nhật = 1
        SELECT
            CASE DATEPART(WEEKDAY, gio_vn.ngay)
                WHEN 2 THEN N'T2'
                WHEN 3 THEN N'T3'
                WHEN 4 THEN N'T4'
                WHEN 5 THEN N'T5'
                WHEN 6 THEN N'T6'
                WHEN 7 THEN N'T7'
                ELSE N'CN'
            END AS Label,
            SUM(inv.total_amount) AS Value
        FROM dbo.invoices inv
        CROSS APPLY (SELECT CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS ngay) gio_vn
        WHERE inv.status = 2
          AND gio_vn.ngay BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY DATEPART(WEEKDAY, gio_vn.ngay)
        ORDER BY MIN(DATEPART(WEEKDAY, gio_vn.ngay));
    END
    ELSE
    BEGIN
        -- mặc định: gom theo từng ngày cụ thể (giờ VN) trong khoảng @FromDate - @ToDate
        SELECT
            CONVERT(VARCHAR(5), gio_vn.ngay, 3) AS Label,
            SUM(inv.total_amount) AS Value
        FROM dbo.invoices inv
        CROSS APPLY (SELECT CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS ngay) gio_vn
        WHERE inv.status = 2
          AND gio_vn.ngay BETWEEN @FromDate AND @ToDate
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
        GROUP BY gio_vn.ngay
        ORDER BY gio_vn.ngay;
    END
END
GO