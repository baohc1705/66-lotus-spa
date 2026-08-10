-- Remap work_schedules.shift_id / salon_id theo salon nhan vien (staff_salons).
-- Map ca bang shift_start + shift_end (an toan hon so ten, vi ten co the lech khoang trang).

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

;WITH staff_salon AS (
    SELECT
        ss.staff_id,
        ss.salon_id,
        ROW_NUMBER() OVER (
            PARTITION BY ss.staff_id
            ORDER BY ss.is_manager DESC, ss.id ASC
        ) AS rn
    FROM dbo.staff_salons ss
    WHERE ss.status = 1
),
target AS (
    SELECT
        ws.id AS work_schedule_id,
        ss.salon_id AS staff_salon_id,
        old_shift.id AS old_shift_id,
        new_shift.id AS new_shift_id,
        new_shift.shift_start AS new_shift_start,
        new_shift.shift_end AS new_shift_end
    FROM dbo.work_schedules ws
    INNER JOIN staff_salon ss
        ON ss.staff_id = ws.staff_id
       AND ss.rn = 1
    INNER JOIN dbo.shifts old_shift
        ON old_shift.id = ws.shift_id
    INNER JOIN dbo.shifts new_shift
        ON new_shift.salon_id = ss.salon_id
       AND new_shift.shift_start = COALESCE(ws.shift_start, old_shift.shift_start)
       AND new_shift.shift_end = COALESCE(ws.shift_end, old_shift.shift_end)
    WHERE ws.shift_id IS NOT NULL
      AND (
            ws.salon_id IS NULL
            OR ws.salon_id <> ss.salon_id
            OR old_shift.salon_id <> ss.salon_id
            OR ws.shift_id <> new_shift.id
          )
)
UPDATE ws
SET
    ws.salon_id = t.staff_salon_id,
    ws.shift_id = t.new_shift_id,
    ws.shift_start = t.new_shift_start,
    ws.shift_end = t.new_shift_end
FROM dbo.work_schedules ws
INNER JOIN target t ON t.work_schedule_id = ws.id;
GO

-- Bao cao sau remap
SELECT
    COUNT(*) AS total_ws,
    SUM(CASE WHEN ws.salon_id = sh.salon_id THEN 1 ELSE 0 END) AS salon_match_shift,
    SUM(CASE WHEN ws.salon_id <> sh.salon_id OR ws.salon_id IS NULL OR sh.salon_id IS NULL THEN 1 ELSE 0 END) AS still_mismatch
FROM dbo.work_schedules ws
LEFT JOIN dbo.shifts sh ON sh.id = ws.shift_id;
GO

SELECT TOP 20
    ws.id,
    ws.staff_id,
    ws.salon_id AS ws_salon,
    ws.shift_id,
    sh.name AS shift_name,
    sh.salon_id AS shift_salon,
    CONVERT(varchar(8), ws.shift_start, 108) AS shift_start,
    CONVERT(varchar(8), ws.shift_end, 108) AS shift_end
FROM dbo.work_schedules ws
LEFT JOIN dbo.shifts sh ON sh.id = ws.shift_id
ORDER BY ws.id DESC;
GO
