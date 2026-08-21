IF OBJECT_ID(N'dbo.usp_GetCustomerTraffic', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCustomerTraffic;
GO

-- Mục đích: Thống kê lượng khách (số lịch hẹn) trong khoảng ngày, dùng vẽ biểu đồ traffic cho dashboard.
-- Đếm tất cả appointment không bị hủy (status <> 6), gom nhóm theo @Tab:
--   @Tab = 1    -> gom theo GIỜ trong ngày (00:00, 01:00, ..., 23:00)
--   @Tab = 2    -> gom theo THỨ trong tuần (T2..T7, CN)
--   @Tab khác   -> gom theo NGÀY cụ thể
--
-- Input:
--   @SalonId  INT = NULL   -- chỉ đếm lịch hẹn của salon này; NULL = tất cả salon
--   @FromDate DATE         -- từ ngày (bao gồm)
--   @ToDate   DATE         -- đến ngày (bao gồm)
--   @Tab      TINYINT      -- 1 = theo giờ, 2 = theo thứ, còn lại = theo ngày
--
-- Output (Label, Value):
--   Label  NVARCHAR   -- nhãn trục biểu đồ (giờ / thứ / ngày)
--   Value  DECIMAL    -- số lịch hẹn trong nhóm đó
--
-- Ví dụ EXEC:
--   -- traffic theo giờ trong 1 ngày
--   EXEC dbo.usp_GetCustomerTraffic @SalonId = 3, @FromDate = '2026-08-20', @ToDate = '2026-08-20', @Tab = 1;
--   -- traffic theo thứ, cả tháng 8
--   EXEC dbo.usp_GetCustomerTraffic @SalonId = 3, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @Tab = 2;
--   -- traffic theo từng ngày, cả tháng 8
--   EXEC dbo.usp_GetCustomerTraffic @SalonId = NULL, @FromDate = '2026-08-01', @ToDate = '2026-08-31', @Tab = 3;
CREATE PROCEDURE dbo.usp_GetCustomerTraffic
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Tab      TINYINT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Tab = 1
    BEGIN
        -- Tab 1: gom theo giờ bắt đầu lịch hẹn; 8:15 và 8:45 đều tính vào "08:00"
        SELECT
            RIGHT('0' + CAST(DATEPART(HOUR, a.time_appt_start) AS VARCHAR(2)), 2) + N':00' AS Label,
            CAST(COUNT(1) AS DECIMAL(18, 0)) AS Value
        FROM dbo.appointments a
        WHERE a.appointment_date BETWEEN @FromDate AND @ToDate
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
          AND a.time_appt_start IS NOT NULL
        GROUP BY DATEPART(HOUR, a.time_appt_start)
        ORDER BY DATEPART(HOUR, a.time_appt_start);
    END
    ELSE IF @Tab = 2
    BEGIN
        -- Tab 2: gom theo thứ trong tuần; nhãn T2 (thứ 2) -> T7, CN (chủ nhật)
        -- DATEPART(WEEKDAY,...) phụ thuộc @@DATEFIRST của server, mặc định Chủ nhật = 1
        SELECT
            CASE DATEPART(WEEKDAY, a.appointment_date)
                WHEN 2 THEN N'T2'
                WHEN 3 THEN N'T3'
                WHEN 4 THEN N'T4'
                WHEN 5 THEN N'T5'
                WHEN 6 THEN N'T6'
                WHEN 7 THEN N'T7'
                ELSE N'CN'
            END AS Label,
            CAST(COUNT(1) AS DECIMAL(18, 0)) AS Value
        FROM dbo.appointments a
        WHERE a.appointment_date BETWEEN @FromDate AND @ToDate
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
        GROUP BY DATEPART(WEEKDAY, a.appointment_date)
        ORDER BY MIN(DATEPART(WEEKDAY, a.appointment_date));
    END
    ELSE
    BEGIN
        -- Tab khác: gom theo từng ngày cụ thể trong khoảng @FromDate - @ToDate
        SELECT
            CONVERT(VARCHAR(5), a.appointment_date, 3) AS Label,
            CAST(COUNT(1) AS DECIMAL(18, 0)) AS Value
        FROM dbo.appointments a
        WHERE a.appointment_date BETWEEN @FromDate AND @ToDate
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
        GROUP BY a.appointment_date
        ORDER BY a.appointment_date;
    END
END
GO
