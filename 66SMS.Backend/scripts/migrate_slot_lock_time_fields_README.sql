-- Deploy migrate slot lock (server moi / chua chay P5).
-- Backup DB truoc.
--
-- Thu tu:
-- 1) migrate_slot_lock_time_fields_phase0_inventory.sql   (tuy chon, chi SELECT)
-- 2) migrate_slot_lock_time_fields_phase1.sql             (ADD cot + backfill)
-- 3) migrate_slot_lock_time_fields_phase4a_nullable_slot_id.sql
-- 4) migrate_slot_lock_time_fields_phase5_cleanup.sql
-- 5) Redeploy SP (khong JOIN time_slots):
--      usp_ResolveBookingStaff.sql
--      usp_GetBookingTimeSlots.sql
--      usp_GetBookingTechnicians.sql
--      usp_GetStaffAvailability.sql
--      usp_GetCashierDaily.sql
--      store_procedure/usp_GetPayrollCommissionStats.sql
--      store_procedure/usp_GetCustomerTraffic.sql
--    va indexes_booking_availability.sql neu can
-- 6) Deploy BE/FE

PRINT N'Xem comment dau file nay.';
GO
