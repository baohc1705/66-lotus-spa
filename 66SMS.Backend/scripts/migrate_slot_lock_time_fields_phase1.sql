-- P1: ADD cot nullable + backfill. KHONG drop/doi index/FK/slot_id.
-- Idempotent: chi ADD khi chua co cot.

SET NOCOUNT ON;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'start_time') IS NULL
    ALTER TABLE dbo.appointment_slot_locks ADD start_time TIME(7) NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'end_time') IS NULL
    ALTER TABLE dbo.appointment_slot_locks ADD end_time TIME(7) NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'salon_id') IS NULL
    ALTER TABLE dbo.appointment_slot_locks ADD salon_id INT NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'duration_mins') IS NULL
    ALTER TABLE dbo.appointment_slot_locks ADD duration_mins INT NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'slot_minutes') IS NULL
    ALTER TABLE dbo.appointment_slot_locks ADD slot_minutes INT NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'service_id') IS NULL
    ALTER TABLE dbo.appointment_slot_locks ADD service_id INT NULL;
GO

-- Backfill locks tu time_slots
UPDATE l
SET
    start_time = ts.start_time,
    slot_minutes = CASE
        WHEN DATEDIFF(MINUTE, ts.start_time, ts.end_time) > 0
            THEN DATEDIFF(MINUTE, ts.start_time, ts.end_time)
        ELSE 30
    END,
    duration_mins = CASE WHEN ISNULL(l.slots_needed, 1) > 0 THEN l.slots_needed ELSE 1 END
        * CASE
            WHEN DATEDIFF(MINUTE, ts.start_time, ts.end_time) > 0
                THEN DATEDIFF(MINUTE, ts.start_time, ts.end_time)
            ELSE 30
        END,
    end_time = DATEADD(
        MINUTE,
        CASE WHEN ISNULL(l.slots_needed, 1) > 0 THEN l.slots_needed ELSE 1 END
            * CASE
                WHEN DATEDIFF(MINUTE, ts.start_time, ts.end_time) > 0
                    THEN DATEDIFF(MINUTE, ts.start_time, ts.end_time)
                ELSE 30
            END,
        CAST(ts.start_time AS DATETIME)
    )
FROM dbo.appointment_slot_locks l
INNER JOIN dbo.time_slots ts ON ts.id = l.slot_id
WHERE l.start_time IS NULL;
GO

-- Backfill appointments.time_appt_* khi null
;WITH appt_duration AS (
    SELECT
        aps.appointment_id,
        SUM(ISNULL(aps.duration_snapshot, 0) * ISNULL(aps.quantity, 1)) AS duration_mins
    FROM dbo.appointment_services aps
    WHERE aps.status = 1
    GROUP BY aps.appointment_id
)
UPDATE a
SET
    time_appt_start = COALESCE(a.time_appt_start, ts.start_time),
    time_appt_end = COALESCE(
        a.time_appt_end,
        CAST(DATEADD(
            MINUTE,
            CASE WHEN ISNULL(d.duration_mins, 30) > 0 THEN d.duration_mins ELSE 30 END,
            CAST(COALESCE(a.time_appt_start, ts.start_time) AS DATETIME)
        ) AS TIME(7))
    )
FROM dbo.appointments a
INNER JOIN dbo.time_slots ts ON ts.id = a.slot_id
LEFT JOIN appt_duration d ON d.appointment_id = a.id
WHERE a.time_appt_start IS NULL OR a.time_appt_end IS NULL;
GO

PRINT N'P1 done: cot nullable + backfill.';
GO
