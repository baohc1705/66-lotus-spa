SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_appointments_date_status_staff' AND object_id = OBJECT_ID(N'dbo.appointments'))
    CREATE INDEX IX_appointments_date_status_staff
        ON dbo.appointments (appointment_date, status)
        INCLUDE (staff_id, time_appt_start, time_appt_end);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_work_schedules_date_staff' AND object_id = OBJECT_ID(N'dbo.work_schedules'))
    CREATE INDEX IX_work_schedules_date_staff
        ON dbo.work_schedules (work_date, status)
        INCLUDE (staff_id, shift_period_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_staff_services_service_status' AND object_id = OBJECT_ID(N'dbo.staff_services'))
    CREATE INDEX IX_staff_services_service_status
        ON dbo.staff_services (service_id, status)
        INCLUDE (staff_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_slot_locks_date_active' AND object_id = OBJECT_ID(N'dbo.appointment_slot_locks'))
    CREATE INDEX IX_slot_locks_date_active
        ON dbo.appointment_slot_locks (appointment_date, status, expires_at)
        INCLUDE (staff_id, start_time, end_time, slots_needed);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_appt_services_appt_status_dur' AND object_id = OBJECT_ID(N'dbo.appointment_services'))
    CREATE INDEX IX_appt_services_appt_status_dur
        ON dbo.appointment_services (appointment_id, status)
        INCLUDE (duration_snapshot, quantity);
GO
