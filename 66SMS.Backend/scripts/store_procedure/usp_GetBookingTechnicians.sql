IF OBJECT_ID(N'dbo.usp_GetBookingTechnicians', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetBookingTechnicians;
GO

-- @service_ids: csv "1,5,9". Staff phai co staff_services du tat ca dich vu (giao tap).   
CREATE PROCEDURE dbo.usp_GetBookingTechnicians
    @date         DATE,
    @service_ids  NVARCHAR(500),
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
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
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
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
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
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
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
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
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

    DECLARE @staff TABLE (
        staff_id   INT NOT NULL PRIMARY KEY,
        staff_name NVARCHAR(100) NOT NULL,
        avatar     NVARCHAR(500) NULL
    );

    INSERT INTO @staff (staff_id, staff_name, avatar)
    SELECT st.id, st.full_name, st.avatar_url
    FROM dbo.staffs st
    WHERE st.status = 1
      AND @staff_role_id IS NOT NULL
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

    IF NOT EXISTS (SELECT 1 FROM @staff)
    BEGIN
        DROP TABLE #wanted_services;
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

    DECLARE @shift_range TABLE (
        staff_id INT NOT NULL,
        min_idx  INT NOT NULL,
        max_idx  INT NOT NULL,
        PRIMARY KEY (staff_id, min_idx)
    );

    INSERT INTO @shift_range (staff_id, min_idx, max_idx)
    SELECT
        ws.staff_id,
        MIN(sl.slot_index),
        MAX(sl.slot_index)
    FROM dbo.work_schedules ws
    INNER JOIN @staff s ON s.staff_id = ws.staff_id
    INNER JOIN @slots sl
        ON sl.start_time >= ws.shift_start
       AND sl.end_time <= ws.shift_end
    WHERE ws.work_date = @date
      AND ws.status = 1
      AND ws.shift_id IS NOT NULL
      AND ws.shift_start IS NOT NULL
      AND ws.shift_end IS NOT NULL
    GROUP BY ws.staff_id, ws.shift_start, ws.shift_end;

    IF NOT EXISTS (SELECT 1 FROM @shift_range)
    BEGIN
        DROP TABLE #wanted_services;
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

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

    ;WITH free_cnt AS (
        SELECT r.staff_id, CAST(COUNT(*) AS INT) AS SlotsLeft
        FROM @shift_range r
        INNER JOIN @slots sl
            ON sl.slot_index >= r.min_idx
           AND sl.slot_index <= r.max_idx - @slots_needed + 1
        WHERE NOT EXISTS (
            SELECT 1 FROM @booked b
            WHERE b.staff_id = r.staff_id
              AND b.slot_index >= sl.slot_index
              AND b.slot_index < sl.slot_index + @slots_needed
        )
        GROUP BY r.staff_id
    )
    SELECT
        s.staff_id AS StaffId,
        s.staff_name AS StaffName,
        s.avatar AS Avatar,
        ISNULL(fc.SlotsLeft, 0) AS SlotsLeft
    FROM @staff s
    INNER JOIN (SELECT DISTINCT staff_id FROM @shift_range) ms ON ms.staff_id = s.staff_id
    LEFT JOIN free_cnt fc ON fc.staff_id = s.staff_id
    ORDER BY ISNULL(fc.SlotsLeft, 0) DESC, s.staff_id;

    DROP TABLE #wanted_services;
END
GO
