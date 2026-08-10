-- P5 cleanup: NOT NULL cot gio, drop slot_id + time_slots, recreate index.
-- Idempotent. Backup DB truoc khi chay.

SET NOCOUNT ON;

PRINT N'=== P5 null counts (phai = 0 truoc khi ALTER NOT NULL) ===';
SELECT
    (SELECT COUNT(*) FROM dbo.appointments WHERE time_appt_start IS NULL OR time_appt_end IS NULL) AS ApptMissingTime,
    (SELECT COUNT(*) FROM dbo.appointment_slot_locks
     WHERE start_time IS NULL OR end_time IS NULL OR duration_mins IS NULL OR slot_minutes IS NULL) AS LockMissingTime,
    (SELECT COUNT(*) FROM dbo.appointments) AS ApptTotal,
    (SELECT COUNT(*) FROM dbo.appointment_slot_locks) AS LockTotal;
GO

-- Drop UX start_time tam (de ALTER NOT NULL)
IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_lock_active_staff_date_start'
      AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
)
BEGIN
    DROP INDEX UX_lock_active_staff_date_start ON dbo.appointment_slot_locks;
    PRINT N'Dropped UX_lock_active_staff_date_start (tam)';
END
GO

-- NOT NULL: locks
IF COL_LENGTH(N'dbo.appointment_slot_locks', N'start_time') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.appointment_slot_locks') AND name = N'start_time' AND is_nullable = 1)
    ALTER TABLE dbo.appointment_slot_locks ALTER COLUMN start_time TIME(7) NOT NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'end_time') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.appointment_slot_locks') AND name = N'end_time' AND is_nullable = 1)
    ALTER TABLE dbo.appointment_slot_locks ALTER COLUMN end_time TIME(7) NOT NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'duration_mins') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.appointment_slot_locks') AND name = N'duration_mins' AND is_nullable = 1)
    ALTER TABLE dbo.appointment_slot_locks ALTER COLUMN duration_mins INT NOT NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'slot_minutes') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.appointment_slot_locks') AND name = N'slot_minutes' AND is_nullable = 1)
    ALTER TABLE dbo.appointment_slot_locks ALTER COLUMN slot_minutes INT NOT NULL;
GO

-- NOT NULL: appointments
IF COL_LENGTH(N'dbo.appointments', N'time_appt_start') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.appointments') AND name = N'time_appt_start' AND is_nullable = 1)
    ALTER TABLE dbo.appointments ALTER COLUMN time_appt_start TIME(7) NOT NULL;

IF COL_LENGTH(N'dbo.appointments', N'time_appt_end') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.appointments') AND name = N'time_appt_end' AND is_nullable = 1)
    ALTER TABLE dbo.appointments ALTER COLUMN time_appt_end TIME(7) NOT NULL;
GO

-- Recreate UX theo start_time
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_lock_active_staff_date_start'
      AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_lock_active_staff_date_start
        ON dbo.appointment_slot_locks (staff_id, appointment_date, start_time)
        WHERE status = 1;
    PRINT N'Created UX_lock_active_staff_date_start';
END
GO

-- Drop index cu theo slot_id / INCLUDE slot_id
IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_slot_lock_active_staff_date_slot'
      AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
)
BEGIN
    DROP INDEX UX_slot_lock_active_staff_date_slot ON dbo.appointment_slot_locks;
    PRINT N'Dropped UX_slot_lock_active_staff_date_slot';
END

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_appointments_date_status_staff'
      AND object_id = OBJECT_ID(N'dbo.appointments')
)
BEGIN
    DROP INDEX IX_appointments_date_status_staff ON dbo.appointments;
    PRINT N'Dropped IX_appointments_date_status_staff';
END

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_slot_locks_date_active'
      AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
)
BEGIN
    DROP INDEX IX_slot_locks_date_active ON dbo.appointment_slot_locks;
    PRINT N'Dropped IX_slot_locks_date_active';
END
GO

-- Drop MOI index dang dung cot slot_id tren locks
DECLARE @lock_index_name SYSNAME;
DECLARE @lock_drop_sql NVARCHAR(400);

DECLARE lock_idx_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT DISTINCT i.name
FROM sys.indexes i
INNER JOIN sys.index_columns ic
    ON ic.object_id = i.object_id AND ic.index_id = i.index_id
INNER JOIN sys.columns c
    ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE i.object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
  AND c.name = N'slot_id'
  AND i.is_primary_key = 0
  AND i.name IS NOT NULL;

OPEN lock_idx_cursor;
FETCH NEXT FROM lock_idx_cursor INTO @lock_index_name;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @lock_drop_sql = N'DROP INDEX [' + @lock_index_name + N'] ON dbo.appointment_slot_locks;';
    EXEC sp_executesql @lock_drop_sql;
    PRINT N'Dropped index ' + @lock_index_name;
    FETCH NEXT FROM lock_idx_cursor INTO @lock_index_name;
END

CLOSE lock_idx_cursor;
DEALLOCATE lock_idx_cursor;
GO

-- Drop MOI index dang dung cot slot_id tren appointments
DECLARE @appt_index_name SYSNAME;
DECLARE @appt_drop_sql NVARCHAR(400);

DECLARE appt_idx_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT DISTINCT i.name
FROM sys.indexes i
INNER JOIN sys.index_columns ic
    ON ic.object_id = i.object_id AND ic.index_id = i.index_id
INNER JOIN sys.columns c
    ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE i.object_id = OBJECT_ID(N'dbo.appointments')
  AND c.name = N'slot_id'
  AND i.is_primary_key = 0
  AND i.name IS NOT NULL;

OPEN appt_idx_cursor;
FETCH NEXT FROM appt_idx_cursor INTO @appt_index_name;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @appt_drop_sql = N'DROP INDEX [' + @appt_index_name + N'] ON dbo.appointments;';
    EXEC sp_executesql @appt_drop_sql;
    PRINT N'Dropped index ' + @appt_index_name;
    FETCH NEXT FROM appt_idx_cursor INTO @appt_index_name;
END

CLOSE appt_idx_cursor;
DEALLOCATE appt_idx_cursor;
GO

-- Drop moi FK tro toi time_slots
DECLARE @fk_name SYSNAME;
DECLARE @parent_table SYSNAME;
DECLARE @drop_sql NVARCHAR(400);

DECLARE fk_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT fk.name, OBJECT_SCHEMA_NAME(fk.parent_object_id) + N'.' + OBJECT_NAME(fk.parent_object_id)
FROM sys.foreign_keys fk
WHERE fk.referenced_object_id = OBJECT_ID(N'dbo.time_slots');

OPEN fk_cursor;
FETCH NEXT FROM fk_cursor INTO @fk_name, @parent_table;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @drop_sql = N'ALTER TABLE ' + @parent_table + N' DROP CONSTRAINT [' + @fk_name + N'];';
    EXEC sp_executesql @drop_sql;
    PRINT N'Dropped FK ' + @fk_name + N' on ' + @parent_table;
    FETCH NEXT FROM fk_cursor INTO @fk_name, @parent_table;
END

CLOSE fk_cursor;
DEALLOCATE fk_cursor;
GO

-- Drop cot slot_id
IF COL_LENGTH(N'dbo.appointments', N'slot_id') IS NOT NULL
BEGIN
    ALTER TABLE dbo.appointments DROP COLUMN slot_id;
    PRINT N'Dropped appointments.slot_id';
END

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'slot_id') IS NOT NULL
BEGIN
    ALTER TABLE dbo.appointment_slot_locks DROP COLUMN slot_id;
    PRINT N'Dropped appointment_slot_locks.slot_id';
END
GO

-- Recreate index khong slot_id
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_appointments_date_status_staff'
      AND object_id = OBJECT_ID(N'dbo.appointments')
)
BEGIN
    CREATE INDEX IX_appointments_date_status_staff
        ON dbo.appointments (appointment_date, status)
        INCLUDE (staff_id, time_appt_start, time_appt_end);
    PRINT N'Recreated IX_appointments_date_status_staff';
END

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_slot_locks_date_active'
      AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
)
BEGIN
    CREATE INDEX IX_slot_locks_date_active
        ON dbo.appointment_slot_locks (appointment_date, status, expires_at)
        INCLUDE (staff_id, start_time, end_time, slots_needed);
    PRINT N'Recreated IX_slot_locks_date_active';
END

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'ix_slot_locks_position_date_start'
      AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
)
BEGIN
    CREATE INDEX ix_slot_locks_position_date_start
        ON dbo.appointment_slot_locks (position_id, appointment_date, start_time);
    PRINT N'Created ix_slot_locks_position_date_start';
END
GO

-- Drop bang time_slots
IF OBJECT_ID(N'dbo.time_slots', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.time_slots;
    PRINT N'Dropped dbo.time_slots';
END
ELSE
    PRINT N'dbo.time_slots already gone';
GO

PRINT N'P5 done. Redeploy SP khong JOIN time_slots.';
GO
