-- P0 inventory: chay tren DB truoc khi ALTER. Khong doi schema.
-- Muc tieu: ten FK/index + dem row null de gate migrate.

PRINT N'=== FK tro toi time_slots / cot slot_id ===';
SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS ParentTable,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ParentColumn,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
WHERE OBJECT_NAME(fk.referenced_object_id) = N'time_slots'
   OR COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = N'slot_id';

PRINT N'=== Index lien quan slot_id / start_time tren locks + appointments ===';
SELECT
    t.name AS TableName,
    i.name AS IndexName,
    i.is_unique AS IsUnique,
    i.filter_definition AS FilterDefinition,
    COL_NAME(ic.object_id, ic.column_id) AS ColumnName,
    ic.key_ordinal AS KeyOrdinal,
    ic.is_included_column AS IsIncluded
FROM sys.indexes i
INNER JOIN sys.tables t ON t.object_id = i.object_id
INNER JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
WHERE t.name IN (N'appointment_slot_locks', N'appointments')
  AND (
        COL_NAME(ic.object_id, ic.column_id) IN (N'slot_id', N'start_time', N'time_appt_start')
        OR i.name LIKE N'%slot%'
      )
ORDER BY t.name, i.name, ic.key_ordinal, ic.is_included_column;

PRINT N'=== Dem row ===';
SELECT
    (SELECT COUNT(*) FROM dbo.appointments WHERE time_appt_start IS NULL OR time_appt_end IS NULL) AS ApptMissingTime,
    (SELECT COUNT(*) FROM dbo.appointments) AS ApptTotal,
    (SELECT COUNT(*) FROM dbo.appointment_slot_locks WHERE slot_id IS NOT NULL) AS LocksWithSlotId,
    (SELECT COUNT(*) FROM dbo.appointment_slot_locks) AS LocksTotal,
    (SELECT COUNT(*) FROM dbo.time_slots) AS TimeSlotRows,
    (SELECT COUNT(*) FROM dbo.config_appointments
     WHERE start_time IS NULL OR end_time IS NULL OR slot_minutes IS NULL OR slot_minutes <= 0) AS ConfigMissingHours;
GO
