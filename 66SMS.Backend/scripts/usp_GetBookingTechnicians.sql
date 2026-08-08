IF OBJECT_ID(N'dbo.usp_GetBookingTechnicians', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetBookingTechnicians;
GO

CREATE PROCEDURE dbo.usp_GetBookingTechnicians
    @date       DATE,
    @service_id INT,
    @salon_id   INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @duration_mins INT;
    DECLARE @slot_minutes  INT;
    DECLARE @slots_needed  INT;
    DECLARE @now           DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

    SELECT @duration_mins = duration_mins
    FROM dbo.services
    WHERE id = @service_id AND status = 1;

    IF @duration_mins IS NULL
    BEGIN
        SELECT
            CAST(NULL AS INT) AS StaffId,
            CAST(NULL AS NVARCHAR(100)) AS StaffName,
            CAST(NULL AS NVARCHAR(500)) AS Avatar,
            CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

    CREATE TABLE #slots (
        slot_index INT NOT NULL PRIMARY KEY,
        slot_id    INT NOT NULL,
        start_time TIME(7) NOT NULL,
        end_time   TIME(7) NOT NULL
    );

    INSERT INTO #slots (slot_index, slot_id, start_time, end_time)
    SELECT
        ROW_NUMBER() OVER (ORDER BY start_time) - 1,
        id,
        start_time,
        end_time
    FROM dbo.time_slots;

    IF NOT EXISTS (SELECT 1 FROM #slots)
    BEGIN
        DROP TABLE #slots;
        SELECT
            CAST(NULL AS INT) AS StaffId,
            CAST(NULL AS NVARCHAR(100)) AS StaffName,
            CAST(NULL AS NVARCHAR(500)) AS Avatar,
            CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

    CREATE UNIQUE INDEX IX_slots_slot_id ON #slots (slot_id);

    SELECT TOP (1)
        @slot_minutes = CASE
            WHEN DATEDIFF(MINUTE, start_time, end_time) > 0
                THEN DATEDIFF(MINUTE, start_time, end_time)
            ELSE 30
        END
    FROM #slots
    ORDER BY slot_index;

    SET @slots_needed = CASE
        WHEN CEILING(@duration_mins * 1.0 / @slot_minutes) < 1 THEN 1
        ELSE CAST(CEILING(@duration_mins * 1.0 / @slot_minutes) AS INT)
    END;

    CREATE TABLE #staff (
        staff_id   INT NOT NULL PRIMARY KEY,
        staff_name NVARCHAR(100) NOT NULL,
        avatar     NVARCHAR(500) NULL
    );

    INSERT INTO #staff (staff_id, staff_name, avatar)
    SELECT
        st.id,
        MAX(st.full_name),
        MAX(st.avatar_url)
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
    INNER JOIN dbo.work_schedules ws
        ON ws.staff_id = st.id
       AND ws.work_date = @date
       AND ws.status = 1
       AND ws.shift_period_id IS NOT NULL
    WHERE st.status = 1
      AND (
            @salon_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM dbo.staff_salons ssal
                WHERE ssal.staff_id = st.id
                  AND ssal.salon_id = @salon_id
                  AND ssal.status = 1
            )
          )
    GROUP BY st.id;

    IF NOT EXISTS (SELECT 1 FROM #staff)
    BEGIN
        DROP TABLE #staff;
        DROP TABLE #slots;
        SELECT
            CAST(NULL AS INT) AS StaffId,
            CAST(NULL AS NVARCHAR(100)) AS StaffName,
            CAST(NULL AS NVARCHAR(500)) AS Avatar,
            CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

    CREATE TABLE #shifts (
        staff_id    INT NOT NULL,
        shift_start TIME(7) NOT NULL,
        shift_end   TIME(7) NOT NULL
    );

    INSERT INTO #shifts (staff_id, shift_start, shift_end)
    SELECT
        ws.staff_id,
        sp.shift_start,
        sp.shift_end
    FROM dbo.work_schedules ws
    INNER JOIN #staff s ON s.staff_id = ws.staff_id
    INNER JOIN dbo.shift_periods sp ON sp.id = ws.shift_period_id
    WHERE ws.work_date = @date
      AND ws.status = 1
      AND ws.shift_period_id IS NOT NULL;

    CREATE TABLE #merged_shifts (
        staff_id    INT NOT NULL,
        shift_start TIME(7) NOT NULL,
        shift_end   TIME(7) NOT NULL
    );

    ;WITH shift_rows AS (
        SELECT
            staff_id,
            shift_start,
            shift_end,
            CASE
                WHEN LAG(shift_end) OVER (PARTITION BY staff_id ORDER BY shift_start) IS NULL
                  OR shift_start > LAG(shift_end) OVER (PARTITION BY staff_id ORDER BY shift_start)
                THEN 1
                ELSE 0
            END AS is_new
        FROM #shifts
    ),
    shift_groups AS (
        SELECT
            staff_id,
            shift_start,
            shift_end,
            SUM(is_new) OVER (
                PARTITION BY staff_id
                ORDER BY shift_start
                ROWS UNBOUNDED PRECEDING
            ) AS group_no
        FROM shift_rows
    )
    INSERT INTO #merged_shifts (staff_id, shift_start, shift_end)
    SELECT staff_id, MIN(shift_start), MAX(shift_end)
    FROM shift_groups
    GROUP BY staff_id, group_no;

    CREATE INDEX IX_merged_staff ON #merged_shifts (staff_id) INCLUDE (shift_start, shift_end);

    -- slot_index da book theo staff (tranh join lai #slots khi dem free)
    CREATE TABLE #booked_idx (
        staff_id   INT NOT NULL,
        slot_index INT NOT NULL,
        PRIMARY KEY (staff_id, slot_index)
    );

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
    INNER JOIN #staff s ON s.staff_id = a.staff_id
    WHERE a.appointment_date = @date
      AND a.status NOT IN (5, 6, 9)
      AND aps.status = 1
    GROUP BY aps.appointment_id;

    INSERT INTO #booked_idx (staff_id, slot_index)
    SELECT DISTINCT
        a.staff_id,
        used_slot.slot_index
    FROM dbo.appointments a
    INNER JOIN #staff s ON s.staff_id = a.staff_id
    INNER JOIN #slots first_slot ON first_slot.slot_id = a.slot_id
    LEFT JOIN #appt_mins d ON d.appointment_id = a.id
    INNER JOIN #slots used_slot
        ON used_slot.slot_index >= first_slot.slot_index
       AND used_slot.slot_index < first_slot.slot_index + CASE
            WHEN CEILING(ISNULL(d.mins, @slot_minutes) * 1.0 / @slot_minutes) < 1 THEN 1
            ELSE CAST(CEILING(ISNULL(d.mins, @slot_minutes) * 1.0 / @slot_minutes) AS INT)
        END
    WHERE a.appointment_date = @date
      AND a.status NOT IN (5, 6, 9);

    INSERT INTO #booked_idx (staff_id, slot_index)
    SELECT DISTINCT
        l.staff_id,
        used_slot.slot_index
    FROM dbo.appointment_slot_locks l
    INNER JOIN #staff s ON s.staff_id = l.staff_id
    INNER JOIN #slots first_slot ON first_slot.slot_id = l.slot_id
    INNER JOIN #slots used_slot
        ON used_slot.slot_index >= first_slot.slot_index
       AND used_slot.slot_index < first_slot.slot_index + CASE
            WHEN l.slots_needed > 0 THEN l.slots_needed
            ELSE @slots_needed
        END
    WHERE l.appointment_date = @date
      AND l.status = 1
      AND l.expires_at > @now
      AND NOT EXISTS (
          SELECT 1
          FROM #booked_idx b
          WHERE b.staff_id = l.staff_id
            AND b.slot_index = used_slot.slot_index
      );

    -- candidate start slots trong ca, set-based (khong correlated theo tung staff)
    CREATE TABLE #free_starts (
        staff_id  INT NOT NULL,
        start_idx INT NOT NULL,
        PRIMARY KEY (staff_id, start_idx)
    );

    INSERT INTO #free_starts (staff_id, start_idx)
    SELECT
        sh.staff_id,
        sl.slot_index
    FROM #merged_shifts sh
    INNER JOIN #slots sl
        ON sl.start_time >= sh.shift_start
    INNER JOIN #slots en
        ON en.slot_index = sl.slot_index + @slots_needed - 1
       AND en.end_time <= sh.shift_end
    WHERE NOT EXISTS (
        SELECT 1
        FROM #booked_idx b
        WHERE b.staff_id = sh.staff_id
          AND b.slot_index BETWEEN sl.slot_index AND sl.slot_index + @slots_needed - 1
    );

    SELECT
        s.staff_id AS StaffId,
        s.staff_name AS StaffName,
        s.avatar AS Avatar,
        ISNULL(fc.SlotsLeft, 0) AS SlotsLeft
    FROM #staff s
    INNER JOIN (
        SELECT DISTINCT staff_id
        FROM #merged_shifts
    ) ms ON ms.staff_id = s.staff_id
    LEFT JOIN (
        SELECT staff_id, COUNT(*) AS SlotsLeft
        FROM #free_starts
        GROUP BY staff_id
    ) fc ON fc.staff_id = s.staff_id
    ORDER BY ISNULL(fc.SlotsLeft, 0) DESC, s.staff_id;

    DROP TABLE #free_starts;
    DROP TABLE #booked_idx;
    DROP TABLE #appt_mins;
    DROP TABLE #merged_shifts;
    DROP TABLE #shifts;
    DROP TABLE #staff;
    DROP TABLE #slots;
END
GO
