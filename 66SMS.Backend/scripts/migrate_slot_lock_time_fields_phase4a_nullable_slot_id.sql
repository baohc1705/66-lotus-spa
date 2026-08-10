-- P4a: cho phep slot_id NULL de lock/appt theo StartTime (truoc khi DROP o P5).
-- Chay sau P1 backfill. Idempotent.

SET NOCOUNT ON;

-- Drop FK tro toi time_slots tam thoi neu can ALTER nullability (mot so FK chan ALTER)
DECLARE @fk_name SYSNAME;
DECLARE @parent SYSNAME;
DECLARE @sql NVARCHAR(500);

DECLARE fk_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT fk.name, OBJECT_NAME(fk.parent_object_id)
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
WHERE OBJECT_NAME(fk.referenced_object_id) = N'time_slots'
  AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = N'slot_id';

OPEN fk_cursor;
FETCH NEXT FROM fk_cursor INTO @fk_name, @parent;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'ALTER TABLE dbo.' + QUOTENAME(@parent) + N' DROP CONSTRAINT ' + QUOTENAME(@fk_name);
    EXEC sp_executesql @sql;
    PRINT N'Dropped FK ' + @fk_name + N' on ' + @parent;
    FETCH NEXT FROM fk_cursor INTO @fk_name, @parent;
END
CLOSE fk_cursor;
DEALLOCATE fk_cursor;
GO

IF COL_LENGTH(N'dbo.appointments', N'slot_id') IS NOT NULL
    ALTER TABLE dbo.appointments ALTER COLUMN slot_id INT NULL;

IF COL_LENGTH(N'dbo.appointment_slot_locks', N'slot_id') IS NOT NULL
    ALTER TABLE dbo.appointment_slot_locks ALTER COLUMN slot_id INT NULL;
GO

-- Unique index theo start_time (song song voi UX theo slot_id neu con)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_lock_active_staff_date_start'
      AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_lock_active_staff_date_start
        ON dbo.appointment_slot_locks (staff_id, appointment_date, start_time)
        WHERE status = 1 AND start_time IS NOT NULL;
    PRINT N'Created UX_lock_active_staff_date_start';
END
GO

PRINT N'P4a done: slot_id nullable + UX start_time.';
GO
