IF OBJECT_ID(N'dbo.usp_GetStaffAvailability', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetStaffAvailability;
GO

CREATE PROCEDURE dbo.usp_GetStaffAvailability
    @WorkDate  DATE,
    @SlotId    INT,
    @ServiceId INT,
    @SalonId   INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DurationMins  INT;
    DECLARE @WindowStart   TIME(7);
    DECLARE @WindowStartDt DATETIME;
    DECLARE @WindowEndDt   DATETIME;
    DECLARE @WindowEndT    TIME(7);
    DECLARE @Now           DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

    SELECT @DurationMins = duration_mins
    FROM dbo.services
    WHERE id = @ServiceId AND status = 1;

    IF @DurationMins IS NULL
        RETURN;

    SELECT @WindowStart = start_time
    FROM dbo.time_slots
    WHERE id = @SlotId;

    IF @WindowStart IS NULL
        RETURN;

    SET @WindowStartDt = CAST(@WindowStart AS DATETIME);
    SET @WindowEndDt   = DATEADD(MINUTE, @DurationMins, @WindowStartDt);
    SET @WindowEndT    = CAST(@WindowEndDt AS TIME(7));

    CREATE TABLE #Result (
        StaffId          INT            NOT NULL PRIMARY KEY,
        StaffName        NVARCHAR(100)  NOT NULL,
        Avatar           NVARCHAR(500)  NULL,
        ScheduleId       INT            NULL,
        InShift          BIT            NOT NULL DEFAULT 0,
        IsBusy           BIT            NOT NULL DEFAULT 0,
        BusyCustomerName NVARCHAR(100)  NULL,
        BusyTimeRange    NVARCHAR(20)   NULL
    );

    INSERT INTO #Result (StaffId, StaffName, Avatar)
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
        r.InShift = 1,
        r.ScheduleId = ws.id
    FROM #Result r
    INNER JOIN dbo.work_schedules ws
        ON ws.staff_id = r.StaffId
       AND ws.work_date = @WorkDate
       AND ws.status = 1
    INNER JOIN dbo.shift_periods sp
        ON sp.id = ws.shift_period_id
    WHERE sp.shift_start <= @WindowStart
      AND sp.shift_end >= @WindowEndT
      AND (
            @SalonId IS NULL
            OR ws.salon_id = @SalonId
            OR ws.salon_id IS NULL
          );

    CREATE TABLE #ApptDur (
        AppointmentId INT NOT NULL PRIMARY KEY,
        TotalMins     INT NOT NULL
    );

    INSERT INTO #ApptDur (AppointmentId, TotalMins)
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

    CREATE TABLE #Busy (
        StaffId          INT            NOT NULL PRIMARY KEY,
        BusyCustomerName NVARCHAR(100)  NULL,
        BusyTimeRange    NVARCHAR(20)   NULL
    );

    INSERT INTO #Busy (StaffId, BusyCustomerName, BusyTimeRange)
    SELECT
        a.staff_id,
        MIN(COALESCE(c.full_name, stf.full_name, u.username, N'Khách')),
        MIN(
            CONVERT(varchar(5), COALESCE(a.time_appt_start, ts.start_time), 108)
            + N'-'
            + CONVERT(
                varchar(5),
                COALESCE(
                    CAST(a.time_appt_end AS DATETIME),
                    DATEADD(MINUTE, ISNULL(d.TotalMins, 30), CAST(COALESCE(a.time_appt_start, ts.start_time) AS DATETIME))
                ),
                108
            )
        )
    FROM dbo.appointments a
    INNER JOIN #Result r
        ON r.StaffId = a.staff_id
    INNER JOIN dbo.time_slots ts
        ON ts.id = a.slot_id
    LEFT JOIN #ApptDur d
        ON d.AppointmentId = a.id
    INNER JOIN dbo.users u
        ON u.id = a.created_by_user_id
    LEFT JOIN dbo.customers c
        ON c.user_id = u.id
    LEFT JOIN dbo.staffs stf
        ON stf.user_id = u.id
    WHERE a.appointment_date = @WorkDate
      AND a.status NOT IN (5, 6, 9)
      AND (@SalonId IS NULL OR a.salon_id = @SalonId)
      AND COALESCE(a.time_appt_start, ts.start_time) < @WindowEndT
      AND COALESCE(
            CAST(a.time_appt_end AS DATETIME),
            DATEADD(MINUTE, ISNULL(d.TotalMins, 30), CAST(COALESCE(a.time_appt_start, ts.start_time) AS DATETIME))
          ) > @WindowStartDt
    GROUP BY a.staff_id;

    UPDATE r
    SET
        r.IsBusy = 1,
        r.BusyCustomerName = b.BusyCustomerName,
        r.BusyTimeRange = b.BusyTimeRange
    FROM #Result r
    INNER JOIN #Busy b ON b.StaffId = r.StaffId;

    UPDATE r
    SET r.IsBusy = 1
    FROM #Result r
    INNER JOIN dbo.appointment_slot_locks l
        ON l.staff_id = r.StaffId
       AND l.appointment_date = @WorkDate
       AND l.status = 1
       AND l.expires_at > @Now
    INNER JOIN dbo.time_slots ts
        ON ts.id = l.slot_id
    WHERE ts.start_time < @WindowEndT
      AND DATEADD(
            MINUTE,
            CASE WHEN l.slots_needed > 0 THEN l.slots_needed ELSE 1 END * 30,
            CAST(ts.start_time AS DATETIME)
          ) > @WindowStartDt;

    SELECT
        r.StaffId,
        r.StaffName,
        r.Avatar,
        r.ScheduleId,
        CASE
            WHEN r.InShift = 0 THEN N'off'
            WHEN r.IsBusy = 1 THEN N'busy'
            ELSE N'available'
        END AS Status,
        CASE
            WHEN r.InShift = 0 THEN N'Ngoài giờ làm'
            WHEN r.IsBusy = 1 AND r.BusyCustomerName IS NOT NULL THEN N'Đang có lịch'
            WHEN r.IsBusy = 1 THEN N'Đang bị giữ chỗ'
            ELSE NULL
        END AS Reason,
        CASE WHEN r.IsBusy = 1 THEN r.BusyCustomerName ELSE NULL END AS BusyCustomerName,
        CASE WHEN r.IsBusy = 1 THEN r.BusyTimeRange ELSE NULL END AS BusyTimeRange
    FROM #Result r
    ORDER BY
        CASE
            WHEN r.InShift = 0 THEN 3
            WHEN r.IsBusy = 1 THEN 2
            ELSE 1
        END,
        r.StaffName;

    DROP TABLE #Busy;
    DROP TABLE #ApptDur;
    DROP TABLE #Result;
END
GO

