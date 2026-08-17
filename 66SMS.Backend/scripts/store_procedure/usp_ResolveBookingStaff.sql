IF OBJECT_ID(N'dbo.usp_ResolveBookingStaff', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ResolveBookingStaff;
GO

-- Tim 1 staff nhan duoc khung gio cho combo dich vu. Bat buoc @start_time.
-- @service_ids: csv "1,5,9". Staff phai lam du tat ca dich vu; duration = SUM.
CREATE PROCEDURE dbo.usp_ResolveBookingStaff
    @date                   DATE,
    @service_ids            NVARCHAR(500),
    @staff_id               INT = NULL,
    @salon_id               INT = NULL,
    @exclude_lock_id        INT = NULL,
    @exclude_appointment_id INT = NULL,
    @start_time             TIME(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @duration_mins   INT;
    DECLARE @wanted_count    INT;
    DECLARE @found_count     INT;
    DECLARE @window_start    TIME(7);
    DECLARE @window_start_dt DATETIME;
    DECLARE @window_end_dt   DATETIME;
    DECLARE @window_end      TIME(7);
    DECLARE @now             DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

    CREATE TABLE #wanted_services (
        service_id INT NOT NULL PRIMARY KEY
    );

    INSERT INTO #wanted_services (service_id)
    SELECT DISTINCT TRY_CAST(LTRIM(RTRIM(value)) AS INT)
    FROM STRING_SPLIT(@service_ids, N',')
    WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL
      AND TRY_CAST(LTRIM(RTRIM(value)) AS INT) > 0;

    SET @wanted_count = (SELECT COUNT(*) FROM #wanted_services);

    IF @wanted_count = 0
    BEGIN
        DROP TABLE #wanted_services;
        RETURN;
    END;

    SELECT
        @duration_mins = SUM(s.duration_mins),
        @found_count = COUNT(*)
    FROM dbo.services s
    INNER JOIN #wanted_services w ON w.service_id = s.id
    WHERE s.status = 1;

    IF @duration_mins IS NULL OR @found_count <> @wanted_count
    BEGIN
        DROP TABLE #wanted_services;
        RETURN;
    END;

    SET @window_start = @start_time;

    IF @window_start IS NULL
    BEGIN
        DROP TABLE #wanted_services;
        RETURN;
    END;

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
    WHERE st.status = 1
      AND (@staff_id IS NULL OR st.id = @staff_id)
      AND (
            SELECT COUNT(DISTINCT ss.service_id)
            FROM dbo.staff_services ss
            INNER JOIN #wanted_services w ON w.service_id = ss.service_id
            WHERE ss.staff_id = st.id AND ss.status = 1
          ) = @wanted_count
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
        DROP TABLE #wanted_services;
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
    WHERE ws.shift_start IS NOT NULL
      AND ws.shift_end IS NOT NULL
      AND ws.shift_start <= @window_start
      AND ws.shift_end >= @window_end;

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
      AND (@exclude_appointment_id IS NULL OR a.id <> @exclude_appointment_id)
      AND aps.status = 1
    GROUP BY aps.appointment_id;

    UPDATE s
    SET s.is_busy = 1
    FROM #staff s
    WHERE EXISTS (
        SELECT 1
        FROM dbo.appointments a
        LEFT JOIN #appt_mins d ON d.appointment_id = a.id
        WHERE a.staff_id = s.staff_id
          AND a.appointment_date = @date
          AND a.status NOT IN (5, 6, 9)
          AND (@exclude_appointment_id IS NULL OR a.id <> @exclude_appointment_id)
          AND a.time_appt_start IS NOT NULL
          AND a.time_appt_start < @window_end
          AND COALESCE(
                CAST(a.time_appt_end AS DATETIME),
                DATEADD(MINUTE, ISNULL(d.mins, 30), CAST(a.time_appt_start AS DATETIME))
              ) > @window_start_dt
    );

    UPDATE s
    SET s.is_busy = 1
    FROM #staff s
    WHERE EXISTS (
        SELECT 1
        FROM dbo.appointment_slot_locks l
        WHERE l.staff_id = s.staff_id
          AND l.appointment_date = @date
          AND l.status = 1
          AND l.expires_at > @now
          AND (@exclude_lock_id IS NULL OR l.id <> @exclude_lock_id)
          AND l.start_time IS NOT NULL
          AND l.start_time < @window_end
          AND COALESCE(
                CAST(l.end_time AS DATETIME),
                DATEADD(
                    MINUTE,
                    ISNULL(
                        l.duration_mins,
                        CASE WHEN ISNULL(l.slots_needed, 1) > 0 THEN l.slots_needed ELSE 1 END
                            * ISNULL(l.slot_minutes, 30)
                    ),
                    CAST(l.start_time AS DATETIME)
                )
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
    DROP TABLE #wanted_services;
END
GO
