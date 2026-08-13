IF OBJECT_ID(N'dbo.usp_GetBookingTimeSlots', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetBookingTimeSlots;
GO

-- @service_ids: csv "1,5,9". Duration = SUM; staff phai lam du tat ca dich vu.
CREATE PROCEDURE dbo.usp_GetBookingTimeSlots
    @date         DATE,
    @service_ids  NVARCHAR(500),
    @staff_id     INT = NULL,
    @salon_id     INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @duration_mins INT;
    DECLARE @slot_minutes  INT;
    DECLARE @slots_needed  INT;
    DECLARE @slot_count    INT;
    DECLARE @staff_role_id INT;
    DECLARE @wanted_count  INT;
    DECLARE @found_count   INT;
    DECLARE @now           DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

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
        SELECT CAST(NULL AS INT) AS SlotId, CAST(NULL AS VARCHAR(5)) AS [Time],
               CAST(NULL AS NVARCHAR(20)) AS Status
        WHERE 1 = 0;
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
        SELECT CAST(NULL AS INT) AS SlotId, CAST(NULL AS VARCHAR(5)) AS [Time],
               CAST(NULL AS NVARCHAR(20)) AS Status
        WHERE 1 = 0;
        RETURN;
    END;

    DECLARE @slots TABLE (
        slot_index INT NOT NULL PRIMARY KEY,
        slot_id    INT NOT NULL UNIQUE,
        start_time TIME(7) NOT NULL,
        end_time   TIME(7) NOT NULL
    );

    DECLARE @cfg_start     TIME(7);
    DECLARE @cfg_end       TIME(7);
    DECLARE @cfg_slot_mins INT;
    DECLARE @slot_cursor   TIME(7);
    DECLARE @slot_index    INT;
    DECLARE @slot_end      TIME(7);

    SELECT TOP (1)
        @cfg_start = start_time,
        @cfg_end = end_time,
        @cfg_slot_mins = slot_minutes
    FROM dbo.config_appointments
    WHERE (@salon_id IS NULL OR salon_id = @salon_id OR salon_id IS NULL)
      AND start_time IS NOT NULL
      AND end_time IS NOT NULL
      AND slot_minutes IS NOT NULL
      AND slot_minutes > 0
    ORDER BY
        CASE WHEN salon_id = @salon_id THEN 0 ELSE 1 END,
        id;

    IF @cfg_start IS NULL OR @cfg_end IS NULL OR @cfg_slot_mins IS NULL OR @cfg_start >= @cfg_end
    BEGIN
        DROP TABLE #wanted_services;
        SELECT CAST(NULL AS INT) AS SlotId, CAST(NULL AS VARCHAR(5)) AS [Time],
               CAST(NULL AS NVARCHAR(20)) AS Status
        WHERE 1 = 0;
        RETURN;
    END;

    SET @slot_index = 0;
    SET @slot_cursor = @cfg_start;

    WHILE DATEADD(MINUTE, @cfg_slot_mins, CAST(@slot_cursor AS DATETIME)) <= CAST(@cfg_end AS DATETIME)
    BEGIN
        SET @slot_end = CAST(DATEADD(MINUTE, @cfg_slot_mins, CAST(@slot_cursor AS DATETIME)) AS TIME(7));

        INSERT INTO @slots (slot_index, slot_id, start_time, end_time)
        VALUES (@slot_index, @slot_index + 1, @slot_cursor, @slot_end);

        SET @slot_index = @slot_index + 1;
        SET @slot_cursor = @slot_end;
    END;

    SET @slot_count = (SELECT COUNT(*) FROM @slots);
    IF @slot_count = 0
    BEGIN
        DROP TABLE #wanted_services;
        SELECT CAST(NULL AS INT) AS SlotId, CAST(NULL AS VARCHAR(5)) AS [Time],
               CAST(NULL AS NVARCHAR(20)) AS Status
        WHERE 1 = 0;
        RETURN;
    END;

    SELECT TOP (1) @slot_minutes = CASE
        WHEN DATEDIFF(MINUTE, start_time, end_time) > 0 THEN DATEDIFF(MINUTE, start_time, end_time)
        ELSE 30 END
    FROM @slots ORDER BY slot_index;

    SET @slots_needed = CASE
        WHEN CEILING(@duration_mins * 1.0 / @slot_minutes) < 1 THEN 1
        ELSE CAST(CEILING(@duration_mins * 1.0 / @slot_minutes) AS INT)
    END;

    SELECT TOP (1) @staff_role_id = id FROM dbo.roles WHERE code = N'staff' AND status = 1;

    DECLARE @staff TABLE (staff_id INT NOT NULL PRIMARY KEY);

    INSERT INTO @staff (staff_id)
    SELECT st.id
    FROM dbo.staffs st
    WHERE st.status = 1
      AND @staff_role_id IS NOT NULL
      AND (@staff_id IS NULL OR st.id = @staff_id)
      AND (
            SELECT COUNT(DISTINCT ss.service_id)
            FROM dbo.staff_services ss
            INNER JOIN #wanted_services w ON w.service_id = ss.service_id
            WHERE ss.staff_id = st.id AND ss.status = 1
          ) = @wanted_count
      AND EXISTS (
            SELECT 1 FROM dbo.users u
            INNER JOIN dbo.user_roles ur ON ur.user_id = u.id AND ur.role_id = @staff_role_id
            WHERE u.id = st.user_id AND u.status = 1
          )
      AND EXISTS (
            SELECT 1 FROM dbo.work_schedules ws
            WHERE ws.staff_id = st.id AND ws.work_date = @date
              AND ws.status = 1 AND ws.shift_id IS NOT NULL
          )
      AND (
            @salon_id IS NULL
            OR EXISTS (
                SELECT 1 FROM dbo.staff_salons ssal
                WHERE ssal.staff_id = st.id AND ssal.salon_id = @salon_id AND ssal.status = 1
            )
          );

    DECLARE @in_shift TABLE (
        staff_id   INT NOT NULL,
        slot_index INT NOT NULL,
        PRIMARY KEY (staff_id, slot_index)
    );

    INSERT INTO @in_shift (staff_id, slot_index)
    SELECT DISTINCT ws.staff_id, sl.slot_index
    FROM dbo.work_schedules ws
    INNER JOIN @staff s ON s.staff_id = ws.staff_id
    INNER JOIN @slots sl
        ON sl.start_time >= ws.shift_start
       AND sl.end_time <= ws.shift_end
    WHERE ws.work_date = @date
      AND ws.status = 1
      AND ws.shift_id IS NOT NULL
      AND ws.shift_start IS NOT NULL
      AND ws.shift_end IS NOT NULL;

    DECLARE @booked TABLE (
        staff_id   INT NOT NULL,
        slot_index INT NOT NULL,
        PRIMARY KEY (staff_id, slot_index)
    );

    ;WITH appt_dur AS (
        SELECT aps.appointment_id, SUM(aps.duration_snapshot * aps.quantity) AS mins
        FROM dbo.appointments ax
        INNER JOIN @staff sx ON sx.staff_id = ax.staff_id
        INNER JOIN dbo.appointment_services aps ON aps.appointment_id = ax.id AND aps.status = 1
        WHERE ax.appointment_date = @date AND ax.status NOT IN (5, 6, 9)
        GROUP BY aps.appointment_id
    ),
    occupied AS (
        SELECT
            a.staff_id,
            fs.slot_index AS start_index,
            CASE
                WHEN CEILING(ISNULL(d.mins, @slot_minutes) * 1.0 / @slot_minutes) < 1 THEN 1
                ELSE CAST(CEILING(ISNULL(d.mins, @slot_minutes) * 1.0 / @slot_minutes) AS INT)
            END AS needed
        FROM dbo.appointments a
        INNER JOIN @staff s ON s.staff_id = a.staff_id
        INNER JOIN @slots fs ON fs.start_time = a.time_appt_start
        LEFT JOIN appt_dur d ON d.appointment_id = a.id
        WHERE a.appointment_date = @date AND a.status NOT IN (5, 6, 9)
          AND a.time_appt_start IS NOT NULL

        UNION ALL

        SELECT
            l.staff_id,
            fs.slot_index,
            CASE
                WHEN CEILING(
                    ISNULL(l.duration_mins, ISNULL(l.slots_needed, 1) * ISNULL(l.slot_minutes, @slot_minutes))
                    * 1.0 / @slot_minutes
                ) < 1 THEN 1
                ELSE CAST(CEILING(
                    ISNULL(l.duration_mins, ISNULL(l.slots_needed, 1) * ISNULL(l.slot_minutes, @slot_minutes))
                    * 1.0 / @slot_minutes
                ) AS INT)
            END
        FROM dbo.appointment_slot_locks l
        INNER JOIN @staff s ON s.staff_id = l.staff_id
        INNER JOIN @slots fs ON fs.start_time = l.start_time
        WHERE l.appointment_date = @date AND l.status = 1 AND l.expires_at > @now
          AND l.start_time IS NOT NULL
    )
    INSERT INTO @booked (staff_id, slot_index)
    SELECT DISTINCT o.staff_id, o.start_index + n.slot_index
    FROM occupied o
    INNER JOIN @slots n ON n.slot_index < o.needed
    WHERE o.start_index + n.slot_index < @slot_count;

    DECLARE @can_start TABLE (
        staff_id  INT NOT NULL,
        start_idx INT NOT NULL,
        PRIMARY KEY (staff_id, start_idx)
    );

    INSERT INTO @can_start (staff_id, start_idx)
    SELECT sh.staff_id, sh.slot_index
    FROM @in_shift sh
    WHERE (
            SELECT COUNT(*) FROM @in_shift i
            WHERE i.staff_id = sh.staff_id
              AND i.slot_index >= sh.slot_index
              AND i.slot_index < sh.slot_index + @slots_needed
          ) = @slots_needed
      AND NOT EXISTS (
            SELECT 1 FROM @booked b
            WHERE b.staff_id = sh.staff_id
              AND b.slot_index >= sh.slot_index
              AND b.slot_index < sh.slot_index + @slots_needed
          );

    IF @staff_id IS NOT NULL
       AND (
            NOT EXISTS (SELECT 1 FROM @staff WHERE staff_id = @staff_id)
            OR NOT EXISTS (SELECT 1 FROM @in_shift WHERE staff_id = @staff_id)
          )
    BEGIN
        DROP TABLE #wanted_services;
        SELECT sl.slot_id AS SlotId, CONVERT(varchar(5), sl.start_time, 108) AS [Time],
               CAST(N'outside' AS NVARCHAR(20)) AS Status
        FROM @slots sl ORDER BY sl.slot_index;
        RETURN;
    END;

    IF @staff_id IS NOT NULL
    BEGIN
        SELECT
            sl.slot_id AS SlotId,
            CONVERT(varchar(5), sl.start_time, 108) AS [Time],
            CASE
                WHEN i.slot_index IS NULL THEN N'outside'
                WHEN cs.start_idx IS NOT NULL THEN N'available'
                WHEN b.slot_index IS NOT NULL THEN N'booked'
                ELSE N'short'
            END AS Status
        FROM @slots sl
        LEFT JOIN @in_shift i ON i.staff_id = @staff_id AND i.slot_index = sl.slot_index
        LEFT JOIN @booked b ON b.staff_id = @staff_id AND b.slot_index = sl.slot_index
        LEFT JOIN @can_start cs ON cs.staff_id = @staff_id AND cs.start_idx = sl.slot_index
        ORDER BY sl.slot_index;
    END
    ELSE
    BEGIN
        ;WITH slot_stats AS (
            SELECT
                sl.slot_index,
                SUM(CASE WHEN i.staff_id IS NOT NULL THEN 1 ELSE 0 END) AS in_shift_cnt,
                SUM(CASE WHEN i.staff_id IS NOT NULL AND b.staff_id IS NULL THEN 1 ELSE 0 END) AS free_start_cnt,
                SUM(CASE WHEN cs.staff_id IS NOT NULL THEN 1 ELSE 0 END) AS can_start_cnt
            FROM @slots sl
            LEFT JOIN @in_shift i ON i.slot_index = sl.slot_index
            LEFT JOIN @booked b ON b.staff_id = i.staff_id AND b.slot_index = i.slot_index
            LEFT JOIN @can_start cs ON cs.staff_id = i.staff_id AND cs.start_idx = sl.slot_index
            GROUP BY sl.slot_index
        )
        SELECT
            sl.slot_id AS SlotId,
            CONVERT(varchar(5), sl.start_time, 108) AS [Time],
            CASE
                WHEN ISNULL(st.can_start_cnt, 0) > 0 THEN N'available'
                WHEN ISNULL(st.free_start_cnt, 0) > 0 THEN N'short'
                WHEN ISNULL(st.in_shift_cnt, 0) > 0 THEN N'booked'
                ELSE N'outside'
            END AS Status
        FROM @slots sl
        LEFT JOIN slot_stats st ON st.slot_index = sl.slot_index
        ORDER BY sl.slot_index;
    END;

    DROP TABLE #wanted_services;
END
GO
