IF OBJECT_ID(N'dbo.usp_GetCashierDailyBookings', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCashierDailyBookings;
GO

-- Danh sách lịch hẹn dạng nhẹ cho màn hình calendar thu ngân: mỗi appointment = 1 dòng.
-- ServiceName chỉ lấy tên dịch vụ ĐẦU TIÊN trong booking
-- vì màn hình calendar chỉ cần hiển thị tên gợi ý, không cần liệt kê hết.
--
-- Cách dùng:
--   EXEC dbo.usp_GetCashierDailyBookings
--        @FromDate = '2026-08-01',
--        @ToDate   = '2026-08-07',
--        @SalonId  = 3;
--
-- Input mẫu:
--   @FromDate = '2026-08-01'   -- lấy lịch hẹn từ ngày này
--   @ToDate   = '2026-08-07'   -- đến ngày này (bao gồm cả 2 đầu)
--   @SalonId  = 3              -- chỉ lấy lịch hẹn của salon id 3, truyền NULL để lấy tất cả salon
--
-- Output mẫu:
--   Id  | CustomerName | BookingDate | ServiceName | StaffId | StartTime | EndTime | Status
--   ----|--------------|-------------|-------------|---------|-----------|---------|-------
--   101 | Nguyen Van C | 2026-08-01  | Gội đầu     | 12      | 08:00     | 08:30   | 1
--   102 | Khách vãng lai| 2026-08-01 | Massage     | 8       | 09:00     | 10:00   | 2
--   -- CustomerName ưu tiên: tên khách hàng -> tên thợ (nếu người tạo là thợ) -> username -> "Khách vãng lai"
--   -- EndTime: nếu appointment không có giờ kết thúc thì tự tính = StartTime + tổng thời lượng dịch vụ (mặc định 15 phút nếu không có dữ liệu)
CREATE PROCEDURE dbo.usp_GetCashierDailyBookings
    @FromDate DATE,
    @ToDate   DATE,
    @SalonId  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- lấy trước các lịch hẹn trong khoảng ngày (và salon) yêu cầu, để tránh join
    -- lặp lại điều kiện lọc này ở nhiều chỗ phía dưới
    DECLARE @ds_lich_hen TABLE (
        AppointmentId    INT            NOT NULL PRIMARY KEY,
        AppointmentDate  DATE           NOT NULL,
        StaffId          INT            NOT NULL,
        StartTime        TIME(7)        NULL,
        EndTime          TIME(7)        NULL,
        PositionId       INT            NULL,
        StatusCode       INT            NOT NULL,
        TotalAmount      DECIMAL(18, 0) NOT NULL,
        PaidAmount       DECIMAL(18, 0) NOT NULL,
        CreatedByUserId  INT            NOT NULL
    );

    INSERT INTO @ds_lich_hen (
        AppointmentId, AppointmentDate, StaffId, StartTime, EndTime,
        PositionId, StatusCode, TotalAmount, PaidAmount, CreatedByUserId
    )
    SELECT
        a.id, a.appointment_date, a.staff_id, a.time_appt_start, a.time_appt_end,
        a.position_id, a.status, a.total_amount, a.paid_amount, a.created_by_user_id
    FROM dbo.appointments a
    WHERE a.appointment_date >= @FromDate
      AND a.appointment_date <= @ToDate
      AND (@SalonId IS NULL OR a.salon_id = @SalonId);

    -- tính trước tổng thời lượng dịch vụ của từng lịch hẹn, dùng để suy ra EndTime
    -- khi appointment chưa có giờ kết thúc cụ thể
    DECLARE @thoi_luong_dv TABLE (
        AppointmentId INT NOT NULL PRIMARY KEY,
        DurationMins  INT NOT NULL
    );

    INSERT INTO @thoi_luong_dv (AppointmentId, DurationMins)
    SELECT aps.appointment_id, ISNULL(SUM(aps.duration_snapshot * aps.quantity), 0)
    FROM dbo.appointment_services aps
    JOIN @ds_lich_hen a ON a.AppointmentId = aps.appointment_id
    WHERE aps.status = 1
    GROUP BY aps.appointment_id;

    SELECT
        a.AppointmentId AS Id,
        -- ưu tiên tên khách hàng, không có thì lấy tên thợ (trường hợp thợ tự tạo lịch),
        -- không có nữa thì lấy username, cuối cùng mới ghi "Khách vãng lai"
        COALESCE(c.full_name, stf.full_name, u.username, N'Khách vãng lai') AS CustomerName,
        CONVERT(varchar(10), a.AppointmentDate, 23) AS BookingDate,
        ISNULL(ten_dv.ServiceName, N'Dịch vụ') AS ServiceName,
        a.StaffId,
        CONVERT(varchar(5), a.StartTime, 108) AS StartTime,
        -- có EndTime thì dùng luôn, không thì lấy StartTime + tổng thời lượng dịch vụ (mặc định 15 phút nếu thiếu dữ liệu)
        CONVERT(
            varchar(5),
            COALESCE(
                a.EndTime,
                CAST(DATEADD(
                    MINUTE,
                    CASE WHEN ISNULL(dur.DurationMins, 0) > 0 THEN dur.DurationMins ELSE 15 END,
                    CAST(ISNULL(a.StartTime, CAST('00:00' AS TIME)) AS DATETIME)
                ) AS TIME)
            ),
            108
        ) AS EndTime,
        a.StatusCode AS Status
    FROM @ds_lich_hen a
    JOIN dbo.users u ON u.id = a.CreatedByUserId
    LEFT JOIN dbo.customers c ON c.user_id = u.id
    LEFT JOIN dbo.staffs stf ON stf.user_id = u.id
    LEFT JOIN @thoi_luong_dv dur ON dur.AppointmentId = a.AppointmentId
    -- lấy tên dịch vụ đầu tiên (theo id nhỏ nhất) trong booking để hiển thị gợi ý trên calendar
    OUTER APPLY (
        SELECT TOP (1) ISNULL(s.name, N'Dịch vụ') AS ServiceName
        FROM dbo.appointment_services aps
        LEFT JOIN dbo.services s ON s.id = aps.service_id
        WHERE aps.appointment_id = a.AppointmentId AND aps.status = 1
        ORDER BY aps.id
    ) ten_dv
    ORDER BY a.AppointmentDate, a.StartTime, a.AppointmentId;
END
GO