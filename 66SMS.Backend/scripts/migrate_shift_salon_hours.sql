-- Phase 1: ca theo salon, gio tren shifts + work_schedules; bo shift_periods.
-- Cot moi them NULL; chay migrate_shift_salon_hours_not_null.sql khi data/app on.
-- Script idempotent: chay lai duoc neu lan truoc fail giua chung.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1) shifts: salon_id, shift_start, shift_end (NULL)
IF COL_LENGTH(N'dbo.shifts', N'salon_id') IS NULL
    ALTER TABLE dbo.shifts ADD salon_id INT NULL;
GO

IF COL_LENGTH(N'dbo.shifts', N'shift_start') IS NULL
    ALTER TABLE dbo.shifts ADD shift_start TIME(7) NULL;
GO

IF COL_LENGTH(N'dbo.shifts', N'shift_end') IS NULL
    ALTER TABLE dbo.shifts ADD shift_end TIME(7) NULL;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_shifts_salons_salon_id'
      AND parent_object_id = OBJECT_ID(N'dbo.shifts')
)
BEGIN
    ALTER TABLE dbo.shifts
    ADD CONSTRAINT FK_shifts_salons_salon_id
        FOREIGN KEY (salon_id) REFERENCES dbo.salons (id);
END
GO

-- Backfill gio tu period dang mo (neu bang shift_periods con ton tai)
IF OBJECT_ID(N'dbo.shift_periods', N'U') IS NOT NULL
BEGIN
    UPDATE s
    SET
        s.shift_start = sp.shift_start,
        s.shift_end = sp.shift_end
    FROM dbo.shifts s
    INNER JOIN dbo.shift_periods sp
        ON sp.shift_id = s.id
       AND sp.effective_to IS NULL
    WHERE s.shift_start IS NULL OR s.shift_end IS NULL;
END
GO

DECLARE @primary_salon_id INT =
(
    SELECT TOP (1) id
    FROM dbo.salons
    WHERE is_primary = 1
    ORDER BY id
);

IF @primary_salon_id IS NULL
BEGIN
    SELECT TOP (1) @primary_salon_id = id
    FROM dbo.salons
    ORDER BY id;
END;

UPDATE dbo.shifts
SET salon_id = @primary_salon_id
WHERE salon_id IS NULL
  AND @primary_salon_id IS NOT NULL;
GO

-- 2) work_schedules: shift_id, shift_start, shift_end (NULL)
IF COL_LENGTH(N'dbo.work_schedules', N'shift_id') IS NULL
    ALTER TABLE dbo.work_schedules ADD shift_id INT NULL;
GO

IF COL_LENGTH(N'dbo.work_schedules', N'shift_start') IS NULL
    ALTER TABLE dbo.work_schedules ADD shift_start TIME(7) NULL;
GO

IF COL_LENGTH(N'dbo.work_schedules', N'shift_end') IS NULL
    ALTER TABLE dbo.work_schedules ADD shift_end TIME(7) NULL;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_work_schedules_shifts_shift_id'
      AND parent_object_id = OBJECT_ID(N'dbo.work_schedules')
)
BEGIN
    ALTER TABLE dbo.work_schedules
    ADD CONSTRAINT FK_work_schedules_shifts_shift_id
        FOREIGN KEY (shift_id) REFERENCES dbo.shifts (id);
END
GO

IF OBJECT_ID(N'dbo.shift_periods', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.work_schedules', N'shift_period_id') IS NOT NULL
BEGIN
    UPDATE ws
    SET
        ws.shift_id = sp.shift_id,
        ws.shift_start = sp.shift_start,
        ws.shift_end = sp.shift_end
    FROM dbo.work_schedules ws
    INNER JOIN dbo.shift_periods sp ON sp.id = ws.shift_period_id
    WHERE ws.shift_period_id IS NOT NULL;
END
GO

-- Drop moi FK tro toi shift_period_id tren work_schedules
DECLARE @fk_sql NVARCHAR(500);
DECLARE @fk_name SYSNAME;

DECLARE fk_drop_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
    INNER JOIN sys.columns c
        ON c.object_id = fkc.parent_object_id
       AND c.column_id = fkc.parent_column_id
    WHERE fk.parent_object_id = OBJECT_ID(N'dbo.work_schedules')
      AND c.name = N'shift_period_id';

OPEN fk_drop_cursor;
FETCH NEXT FROM fk_drop_cursor INTO @fk_name;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @fk_sql = N'ALTER TABLE dbo.work_schedules DROP CONSTRAINT [' + REPLACE(@fk_name, N']', N']]') + N']';
    EXEC sp_executesql @fk_sql;
    FETCH NEXT FROM fk_drop_cursor INTO @fk_name;
END
CLOSE fk_drop_cursor;
DEALLOCATE fk_drop_cursor;
GO

-- Drop moi index (khong phai PK) dang dung cot shift_period_id
-- Vi du: ix_work_schedules_shift, IX_work_schedules_date_staff, ...
DECLARE @idx_sql NVARCHAR(500);
DECLARE @idx_name SYSNAME;

DECLARE idx_drop_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT DISTINCT i.name
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic
        ON ic.object_id = i.object_id
       AND ic.index_id = i.index_id
    INNER JOIN sys.columns c
        ON c.object_id = ic.object_id
       AND c.column_id = ic.column_id
    WHERE i.object_id = OBJECT_ID(N'dbo.work_schedules')
      AND c.name = N'shift_period_id'
      AND i.name IS NOT NULL
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0;

OPEN idx_drop_cursor;
FETCH NEXT FROM idx_drop_cursor INTO @idx_name;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @idx_sql = N'DROP INDEX [' + REPLACE(@idx_name, N']', N']]') + N'] ON dbo.work_schedules';
    EXEC sp_executesql @idx_sql;
    FETCH NEXT FROM idx_drop_cursor INTO @idx_name;
END
CLOSE idx_drop_cursor;
DEALLOCATE idx_drop_cursor;
GO

IF COL_LENGTH(N'dbo.work_schedules', N'shift_period_id') IS NOT NULL
    ALTER TABLE dbo.work_schedules DROP COLUMN shift_period_id;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_work_schedules_date_staff'
      AND object_id = OBJECT_ID(N'dbo.work_schedules')
)
    CREATE INDEX IX_work_schedules_date_staff
        ON dbo.work_schedules (work_date, status)
        INCLUDE (staff_id, shift_id);
GO

-- 3) Drop shift_periods (drop moi FK lien quan truoc)
IF OBJECT_ID(N'dbo.shift_periods', N'U') IS NOT NULL
BEGIN
    DECLARE @drop_sql NVARCHAR(500);
    DECLARE @drop_fk SYSNAME;
    DECLARE @drop_table NVARCHAR(256);

    DECLARE fk_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT fk.name,
               OBJECT_SCHEMA_NAME(fk.parent_object_id) + N'.' + OBJECT_NAME(fk.parent_object_id)
        FROM sys.foreign_keys fk
        WHERE fk.parent_object_id = OBJECT_ID(N'dbo.shift_periods')
           OR fk.referenced_object_id = OBJECT_ID(N'dbo.shift_periods');

    OPEN fk_cursor;
    FETCH NEXT FROM fk_cursor INTO @drop_fk, @drop_table;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @drop_sql =
            N'ALTER TABLE [' + REPLACE(PARSENAME(@drop_table, 2), N']', N']]') + N'].['
            + REPLACE(PARSENAME(@drop_table, 1), N']', N']]') + N'] DROP CONSTRAINT ['
            + REPLACE(@drop_fk, N']', N']]') + N']';
        EXEC sp_executesql @drop_sql;
        FETCH NEXT FROM fk_cursor INTO @drop_fk, @drop_table;
    END
    CLOSE fk_cursor;
    DEALLOCATE fk_cursor;

    DROP TABLE dbo.shift_periods;
END
GO
