-- Script chuyển đổi từ KPI sang Hoa hồng dịch vụ
-- Database First — chạy script này trên 66LotusSpaDB trước khi deploy backend

-- 1. Thêm các cột Hoa hồng vào invoice_items và payrolls
ALTER TABLE invoice_items ADD commission_rate DECIMAL(18,2) NULL;
ALTER TABLE invoice_items ADD commission_amount DECIMAL(18,2) NOT NULL DEFAULT 0;
ALTER TABLE payrolls ADD commission_amount DECIMAL(18,0) NOT NULL DEFAULT 0;
GO

-- 2. Loại bỏ hoàn toàn các cột KPI khỏi Database
-- Xóa khỏi staffs
ALTER TABLE staffs DROP COLUMN kpi_target_count;
ALTER TABLE staffs DROP COLUMN kpi_bonus_amount;
GO

-- Xóa khỏi attendances
ALTER TABLE attendances DROP COLUMN kpi_target_count;
ALTER TABLE attendances DROP COLUMN kpi_actual_count;
ALTER TABLE attendances DROP COLUMN kpi_bonus_amount;
ALTER TABLE attendances DROP COLUMN kpi_bonus_earned;
ALTER TABLE attendances DROP COLUMN kpi_achieved;
ALTER TABLE attendances DROP COLUMN kpi_evaluated_at;
GO

-- Xóa khỏi payrolls
ALTER TABLE payrolls DROP COLUMN kpi_bonus_amount;
ALTER TABLE payrolls DROP COLUMN kpi_achieved_shifts;
ALTER TABLE payrolls DROP COLUMN kpi_total_shifts;
GO
