-- =============================================================
-- 66SMS - Nghiệp vụ Chấm công (Attendance)
-- Database First: chạy script này tay trong SQL Server (DB: 66LotusSpaDB)
-- =============================================================

CREATE TABLE attendances
(
    id               INT IDENTITY(1,1) NOT NULL,
    staff_id         INT               NOT NULL,
    salon_id         INT               NULL,
    work_schedule_id INT               NULL,
    work_date        DATE              NOT NULL,
    check_in_at      DATETIME2         NULL,
    check_out_at     DATETIME2         NULL,
    worked_hours     DECIMAL(5,2)      NOT NULL DEFAULT 0,
    status           INT               NOT NULL DEFAULT 1,  -- 1=CHECKED_IN,2=CHECKED_OUT,3=ABSENT
    note             NVARCHAR(500)     NULL,
    created_at       DATETIME2         NOT NULL,
    created_by       INT               NULL,
    updated_at       DATETIME2         NULL,
    updated_by       INT               NULL,
    CONSTRAINT PK_attendances PRIMARY KEY (id),
    CONSTRAINT FK_attendances_staffs         FOREIGN KEY (staff_id)         REFERENCES staffs(id),
    CONSTRAINT FK_attendances_salons         FOREIGN KEY (salon_id)         REFERENCES salons(id),
    CONSTRAINT FK_attendances_work_schedules FOREIGN KEY (work_schedule_id) REFERENCES work_schedules(id)
);
GO

CREATE UNIQUE INDEX UX_attendances_staff_date ON attendances(staff_id, work_date);
GO
