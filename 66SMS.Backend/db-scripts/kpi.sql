-- KPI integration: staffs config, attendances per-shift KPI result, payroll breakdown
-- Database First — chạy script này trên 66LotusSpaDB trước khi deploy backend

-- 1. staffs: cấu hình KPI
ALTER TABLE staffs ADD kpi_target_count  INT NULL;
ALTER TABLE staffs ADD kpi_bonus_amount  DECIMAL(18,0) NULL;
GO

-- 2. attendances: kết quả KPI từng ca + đổi unique cho phép nhiều ca/ngày
ALTER TABLE attendances ADD kpi_target_count   INT NULL;
ALTER TABLE attendances ADD kpi_actual_count   INT NOT NULL DEFAULT 0;
ALTER TABLE attendances ADD kpi_bonus_amount   DECIMAL(18,0) NULL;
ALTER TABLE attendances ADD kpi_bonus_earned   DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE attendances ADD kpi_achieved       BIT NOT NULL DEFAULT 0;
ALTER TABLE attendances ADD kpi_evaluated_at   DATETIME2 NULL;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_attendances_staff_date' AND object_id = OBJECT_ID('attendances'))
BEGIN
    DROP INDEX UX_attendances_staff_date ON attendances;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_attendances_staff_schedule' AND object_id = OBJECT_ID('attendances'))
BEGIN
    CREATE UNIQUE INDEX UX_attendances_staff_schedule
      ON attendances(staff_id, work_schedule_id)
      WHERE work_schedule_id IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_attendances_staff_date_no_schedule' AND object_id = OBJECT_ID('attendances'))
BEGIN
    CREATE UNIQUE INDEX UX_attendances_staff_date_no_schedule
      ON attendances(staff_id, work_date)
      WHERE work_schedule_id IS NULL;
END
GO

-- 3. payrolls: tách lương cơ bản + thưởng KPI
ALTER TABLE payrolls ADD base_amount         DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE payrolls ADD kpi_bonus_amount    DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE payrolls ADD kpi_achieved_shifts INT NOT NULL DEFAULT 0;
ALTER TABLE payrolls ADD kpi_total_shifts    INT NOT NULL DEFAULT 0;
GO

UPDATE payrolls SET base_amount = total_amount WHERE base_amount = 0;
GO
