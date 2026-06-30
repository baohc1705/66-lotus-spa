-- =============================================================
-- 66SMS - Nghiệp vụ Quản lý lương (Payroll)
-- Database First: chạy script này tay trong SQL Server (DB: 66LotusSpaDB)
-- =============================================================

CREATE TABLE payrolls
(
    id               INT IDENTITY(1,1) NOT NULL,
    staff_id         INT               NOT NULL,
    salon_id         INT               NULL,
    period_month     INT               NOT NULL,
    period_year      INT               NOT NULL,
    salary_type      INT               NOT NULL,            -- 1=HOURLY,2=DAILY
    rate             DECIMAL(18,0)     NOT NULL DEFAULT 0,  -- snapshot basic_salary lúc tính
    total_hours      DECIMAL(7,2)      NOT NULL DEFAULT 0,
    total_work_days  DECIMAL(5,1)      NOT NULL DEFAULT 0,
    total_amount     DECIMAL(18,0)     NOT NULL DEFAULT 0,
    status           INT               NOT NULL DEFAULT 1,  -- 1=DRAFT,2=CONFIRMED
    note             NVARCHAR(500)     NULL,
    created_at       DATETIME2         NOT NULL,
    created_by       INT               NULL,
    updated_at       DATETIME2         NULL,
    updated_by       INT               NULL,
    CONSTRAINT PK_payrolls PRIMARY KEY (id),
    CONSTRAINT FK_payrolls_staffs FOREIGN KEY (staff_id) REFERENCES staffs(id),
    CONSTRAINT FK_payrolls_salons FOREIGN KEY (salon_id) REFERENCES salons(id)
);
GO

CREATE UNIQUE INDEX UX_payrolls_staff_period ON payrolls(staff_id, period_year, period_month);
GO

-- Thêm cột loại lương vào staffs (1=HOURLY, 2=DAILY; mặc định 2 = theo ngày công)
ALTER TABLE staffs ADD salary_type INT NOT NULL DEFAULT 2;
GO
