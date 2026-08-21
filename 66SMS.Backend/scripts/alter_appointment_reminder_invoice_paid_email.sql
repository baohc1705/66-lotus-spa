-- Nhac lich hen online (Quartz job)
IF COL_LENGTH(N'dbo.appointments', N'reminder_sent_at') IS NULL
BEGIN
    ALTER TABLE dbo.appointments
    ADD reminder_sent_at datetimeoffset(7) NULL;
END
GO
