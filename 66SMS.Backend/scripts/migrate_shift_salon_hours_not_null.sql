-- Phase 2: siet NOT NULL sau khi data + app on (khong con NULL).
-- Chay khi: SELECT dem NULL cac cot moi = 0.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM dbo.shifts WHERE salon_id IS NULL OR shift_start IS NULL OR shift_end IS NULL)
    THROW 50001, N'shifts van con NULL (salon_id/shift_start/shift_end). Backfill truoc.', 1;
GO

IF EXISTS (SELECT 1 FROM dbo.work_schedules WHERE shift_id IS NULL OR shift_start IS NULL OR shift_end IS NULL)
    THROW 50002, N'work_schedules van con NULL (shift_id/shift_start/shift_end). Backfill truoc.', 1;
GO

ALTER TABLE dbo.shifts ALTER COLUMN salon_id INT NOT NULL;
ALTER TABLE dbo.shifts ALTER COLUMN shift_start TIME(7) NOT NULL;
ALTER TABLE dbo.shifts ALTER COLUMN shift_end TIME(7) NOT NULL;
GO

ALTER TABLE dbo.work_schedules ALTER COLUMN shift_id INT NOT NULL;
ALTER TABLE dbo.work_schedules ALTER COLUMN shift_start TIME(7) NOT NULL;
ALTER TABLE dbo.work_schedules ALTER COLUMN shift_end TIME(7) NOT NULL;
GO
