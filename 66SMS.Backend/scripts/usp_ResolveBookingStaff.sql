IF OBJECT_ID(N'dbo.usp_ResolveBookingStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ResolveBookingStaff;
GO

-- Tim 1 staff nhan duoc slot. @staff_id NULL = bat ky.
CREATE PROCEDURE dbo.usp_ResolveBookingStaff
    @date            DATE,
    @service_id      INT,
    @slot_id         INT,
    @staff_id        INT = NULL,
    @salon_id        INT = NULL,
    @exclude_lock_id INT = NULL
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
    WHERE id = @service_id AND status = 1;

    IF @duration_mins IS NULL
        RETURN;

    SELECT @window_start = start_time
    FROM dbo.time_slots
    WHERE id = @slot_id;

    IF @window_start IS NULL
        RETURN;

    SET @window_start_dt = CAST(@window_start AS DATETIME);
    SET @window_end_dt   = DATEADD(MINUTE, @duration_mins, @window_start_dt);
    SET @window_end      = CAST(@window_end_dt AS TIME(7));

    CREATE TABLE #staff (
        staff_id    INT NOT NULL PRIMARY KEY,
        schedule_id INT NULL,
        in_shift    BIT NOT NULL DEFAULT 0,
        is_busy     BIT NOT NULL DEFAULT 0
    );

    INSERT INTO #staff (staff_id)
    SELECT DISTINCT st.id
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
       AND ss.service_id = @service_id
       AND ss.status = 1
    WHERE st.status = 1
      AND (@staff_id IS NULL OR st.id = @staff_id)
      AND (
            @salon_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM dbo.staff_salons ssal
                WHERE ssal.staff_id = st.id
                  AND ssal.salon_id = @salon_id
                  AND ssal.status = 1
            )
          );

    IF NOT EXISTS (SELECT 1 FROM #staff)
    BEGIN
        DROP TABLE #staff;
        RETURN;
    END;

    UPDATE s
    SET
        s.in_shift = 1,
        s.schedule_id = ws.id
    FROM #staff s
    INNER JOIN dbo.work_schedules ws
        ON ws.staff_id = s.staff_id
       AND ws.work_date = @date
       AND ws.status = 1
    INNER JOIN dbo.shift_periods sp
        ON sp.id = ws.shift_period_id
    WHERE sp.shift_start <= @window_start
      AND sp.shift_end >= @window_end;

    CREATE TABLE #appt_mins (
        appointment_id INT NOT NULL PRIMARY KEY,
        mins           INT NOT NULL
    );

    INSERT INTO #appt_mins (appointment_id, mins)
    SELECT
        aps.appointment_id,
        SUM(aps.duration_snapshot * aps.quantity)
    FROM dbo.appointment_services aps
    INNER JOIN dbo.appointments a ON a.id = aps.appointment_id
    WHERE a.appointment_date = @date
      AND a.status NOT IN (5, 6, 9)
      AND aps.status = 1
    GROUP BY aps.appointment_id;

    UPDATE s
    SET s.is_busy = 1
    FROM #staff s
    WHERE EXISTS (
        SELECT 1
        FROM dbo.appointments a
        INNER JOIN dbo.time_slots ts ON ts.id = a.slot_id
        LEFT JOIN #appt_mins d ON d.appointment_id = a.id
        WHERE a.staff_id = s.staff_id
          AND a.appointment_date = @date
          AND a.status NOT IN (5, 6, 9)
          AND COALESCE(a.time_appt_start, ts.start_time) < @window_end
          AND COALESCE(
                CAST(a.time_appt_end AS DATETIME),
                DATEADD(MINUTE, ISNULL(d.mins, 30), CAST(COALESCE(a.time_appt_start, ts.start_time) AS DATETIME))
              ) > @window_start_dt
    );

    UPDATE s
    SET s.is_busy = 1
    FROM #staff s
    WHERE EXISTS (
        SELECT 1
        FROM dbo.appointment_slot_locks l
        INNER JOIN dbo.time_slots ts ON ts.id = l.slot_id
        WHERE l.staff_id = s.staff_id
          AND l.appointment_date = @date
          AND l.status = 1
          AND l.expires_at > @now
          AND (@exclude_lock_id IS NULL OR l.id <> @exclude_lock_id)
          AND ts.start_time < @window_end
          AND DATEADD(
                MINUTE,
                CASE WHEN l.slots_needed > 0 THEN l.slots_needed ELSE 1 END * 30,
                CAST(ts.start_time AS DATETIME)
              ) > @window_start_dt
    );

    SELECT TOP (1)
        s.staff_id AS StaffId,
        s.schedule_id AS ScheduleId
    FROM #staff s
    WHERE s.in_shift = 1
      AND s.is_busy = 0
    ORDER BY s.staff_id;

    DROP TABLE #appt_mins;
    DROP TABLE #staff;
END
GO
