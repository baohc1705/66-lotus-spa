IF OBJECT_ID(N'dbo.usp_GetStaffAvailability', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetStaffAvailability;
GO

-- @SlotId giu de tuong thich, khong dung. Bat buoc @start_time.
CREATE PROCEDURE dbo.usp_GetStaffAvailability
    @WorkDate   DATE,
    @SlotId     INT = NULL,
    @ServiceId  INT,
    @SalonId    INT = NULL,
    @start_time TIME(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @duration_mins   INT;
    DECLARE @window_start    TIME(7);
    DECLARE @window_start_dt DATETIME;
    DECLARE @window_end_dt   DATETIME;
    DECLARE @window_end      TIME(7);
    DECLARE @now             DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

    SELECT @duration_mins = duration_mins
    FROM dbo.services
    WHERE id = @ServiceId AND status = 1;

    IF @duration_mins IS NULL
        RETURN;

    SET @window_start = @start_time;

    IF @window_start IS NULL
        RETURN;

    SET @window_start_dt = CAST(@window_start AS DATETIME);
    SET @window_end_dt   = DATEADD(MINUTE, @duration_mins, @window_start_dt);
    SET @window_end      = CAST(@window_end_dt AS TIME(7));

    CREATE TABLE #result (
        staff_id           INT            NOT NULL PRIMARY KEY,
        staff_name         NVARCHAR(100)  NOT NULL,
        avatar             NVARCHAR(500)  NULL,
        schedule_id        INT            NULL,
        in_shift           BIT            NOT NULL DEFAULT 0,
        is_busy            BIT            NOT NULL DEFAULT 0,
        busy_customer_name NVARCHAR(100)  NULL,
        busy_time_range    NVARCHAR(20)   NULL
    );

    INSERT INTO #result (staff_id, staff_name, avatar)
    SELECT
        st.id,
        st.full_name,
        st.avatar_url
    FROM dbo.staffs st
    INNER JOIN dbo.users u
        ON u.id = st.user_id AND u.status = 1
    INNER JOIN dbo.user_roles ur
        ON ur.user_id = u.id
    INNER JOIN dbo.roles r
        ON r.id = ur.role_id
       AND r.status = 1
       AND r.code = N'staff'
    INNER JOIN dbo.staff_services ss
        ON ss.staff_id = st.id
       AND ss.service_id = @ServiceId
       AND ss.status = 1
    WHERE st.status = 1
      AND (
            @SalonId IS NULL
            OR EXISTS (
                SELECT 1
                FROM dbo.staff_salons ssal
                WHERE ssal.staff_id = st.id
                  AND ssal.salon_id = @SalonId
                  AND ssal.status = 1
            )
          );

    UPDATE r
    SET
        r.in_shift = 1,
        r.schedule_id = ws.id
    FROM #result r
    INNER JOIN dbo.work_schedules ws
        ON ws.staff_id = r.staff_id
       AND ws.work_date = @WorkDate
       AND ws.status = 1
    WHERE ws.shift_start IS NOT NULL
      AND ws.shift_end IS NOT NULL
      AND ws.shift_start <= @window_start
      AND ws.shift_end >= @window_end
      AND (
            @SalonId IS NULL
            OR ws.salon_id = @SalonId
            OR ws.salon_id IS NULL
          );

    CREATE TABLE #appt_dur (
        appointment_id INT NOT NULL PRIMARY KEY,
        total_mins     INT NOT NULL
    );

    INSERT INTO #appt_dur (appointment_id, total_mins)
    SELECT
        aps.appointment_id,
        SUM(aps.duration_snapshot * aps.quantity)
    FROM dbo.appointment_services aps
    INNER JOIN dbo.appointments a
        ON a.id = aps.appointment_id
    WHERE a.appointment_date = @WorkDate
      AND a.status NOT IN (5, 6, 9)
      AND aps.status = 1
      AND (@SalonId IS NULL OR a.salon_id = @SalonId)
    GROUP BY aps.appointment_id;

    CREATE TABLE #busy (
        staff_id           INT            NOT NULL PRIMARY KEY,
        busy_customer_name NVARCHAR(100)  NULL,
        busy_time_range    NVARCHAR(20)   NULL
    );

    INSERT INTO #busy (staff_id, busy_customer_name, busy_time_range)
    SELECT
        a.staff_id,
        MIN(COALESCE(c.full_name, stf.full_name, u.username, N'Khách')),
        MIN(
            CONVERT(varchar(5), a.time_appt_start, 108)
            + N'-'
            + CONVERT(
                varchar(5),
                COALESCE(
                    CAST(a.time_appt_end AS DATETIME),
                    DATEADD(MINUTE, ISNULL(d.total_mins, 30), CAST(a.time_appt_start AS DATETIME))
                ),
                108
            )
        )
    FROM dbo.appointments a
    INNER JOIN #result r
        ON r.staff_id = a.staff_id
    LEFT JOIN #appt_dur d
        ON d.appointment_id = a.id
    INNER JOIN dbo.users u
        ON u.id = a.created_by_user_id
    LEFT JOIN dbo.customers c
        ON c.user_id = u.id
    LEFT JOIN dbo.staffs stf
        ON stf.user_id = u.id
    WHERE a.appointment_date = @WorkDate
      AND a.status NOT IN (5, 6, 9)
      AND (@SalonId IS NULL OR a.salon_id = @SalonId)
      AND a.time_appt_start IS NOT NULL
      AND a.time_appt_start < @window_end
      AND COALESCE(
            CAST(a.time_appt_end AS DATETIME),
            DATEADD(MINUTE, ISNULL(d.total_mins, 30), CAST(a.time_appt_start AS DATETIME))
          ) > @window_start_dt
    GROUP BY a.staff_id;

    UPDATE r
    SET
        r.is_busy = 1,
        r.busy_customer_name = b.busy_customer_name,
        r.busy_time_range = b.busy_time_range
    FROM #result r
    INNER JOIN #busy b ON b.staff_id = r.staff_id;

    UPDATE r
    SET r.is_busy = 1
    FROM #result r
    INNER JOIN dbo.appointment_slot_locks l
        ON l.staff_id = r.staff_id
       AND l.appointment_date = @WorkDate
       AND l.status = 1
       AND l.expires_at > @now
    WHERE l.start_time IS NOT NULL
      AND l.start_time < @window_end
      AND COALESCE(
            CAST(l.end_time AS DATETIME),
            DATEADD(
                MINUTE,
                ISNULL(l.duration_mins, ISNULL(l.slots_needed, 1) * ISNULL(l.slot_minutes, 30)),
                CAST(l.start_time AS DATETIME)
            )
          ) > @window_start_dt;

    SELECT
        r.staff_id AS StaffId,
        r.staff_name AS StaffName,
        r.avatar AS Avatar,
        r.schedule_id AS ScheduleId,
        CASE
            WHEN r.in_shift = 0 THEN N'off'
            WHEN r.is_busy = 1 THEN N'busy'
            ELSE N'available'
        END AS Status,
        CASE
            WHEN r.in_shift = 0 THEN N'Ngoài giờ làm'
            WHEN r.is_busy = 1 AND r.busy_customer_name IS NOT NULL THEN N'Đang có lịch'
            WHEN r.is_busy = 1 THEN N'Đang bị giữ chỗ'
            ELSE NULL
        END AS Reason,
        CASE WHEN r.is_busy = 1 THEN r.busy_customer_name ELSE NULL END AS BusyCustomerName,
        CASE WHEN r.is_busy = 1 THEN r.busy_time_range ELSE NULL END AS BusyTimeRange
    FROM #result r
    ORDER BY
        CASE
            WHEN r.in_shift = 0 THEN 3
            WHEN r.is_busy = 1 THEN 2
            ELSE 1
        END,
        r.staff_name;

    DROP TABLE #busy;
    DROP TABLE #appt_dur;
    DROP TABLE #result;
END
GO
