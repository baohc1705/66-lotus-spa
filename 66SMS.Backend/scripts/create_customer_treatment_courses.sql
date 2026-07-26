-- Customer treatment course ownership + usage history
-- Run manually on 66LotusSpaDB (Database First — do not use EF migrations)

IF OBJECT_ID(N'dbo.customer_treatment_courses', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.customer_treatment_courses
    (
        id                   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customer_treatment_courses PRIMARY KEY,
        customer_id          INT NOT NULL,
        treatment_course_id  INT NOT NULL,
        total_sessions       INT NOT NULL,
        remaining_sessions   INT NOT NULL,
        purchase_date        DATETIMEOFFSET NOT NULL,
        expiry_date          DATETIMEOFFSET NULL,
        status               INT NOT NULL CONSTRAINT DF_ctc_status DEFAULT (1),
        invoice_id           INT NULL,
        created_at           DATETIMEOFFSET NOT NULL,
        created_by           INT NULL,
        updated_at           DATETIMEOFFSET NULL,
        updated_by           INT NULL,
        CONSTRAINT FK_ctc_customer FOREIGN KEY (customer_id) REFERENCES dbo.customers(id),
        CONSTRAINT FK_ctc_treatment_course FOREIGN KEY (treatment_course_id) REFERENCES dbo.treatment_courses(id),
        CONSTRAINT FK_ctc_invoice FOREIGN KEY (invoice_id) REFERENCES dbo.invoices(id)
    );

    CREATE INDEX IX_ctc_customer_status ON dbo.customer_treatment_courses (customer_id, status);
END
GO

IF OBJECT_ID(N'dbo.customer_treatment_course_usages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.customer_treatment_course_usages
    (
        id                            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customer_treatment_course_usages PRIMARY KEY,
        customer_treatment_course_id  INT NOT NULL,
        appointment_id                INT NOT NULL,
        used_at                       DATETIMEOFFSET NOT NULL,
        session_number                INT NOT NULL,
        note                          NVARCHAR(1000) NULL,
        created_at                    DATETIMEOFFSET NOT NULL,
        created_by                    INT NULL,
        updated_at                    DATETIMEOFFSET NULL,
        updated_by                    INT NULL,
        CONSTRAINT FK_ctcu_ctc FOREIGN KEY (customer_treatment_course_id)
            REFERENCES dbo.customer_treatment_courses(id),
        CONSTRAINT FK_ctcu_appointment FOREIGN KEY (appointment_id)
            REFERENCES dbo.appointments(id)
    );

    CREATE INDEX IX_ctcu_ctc ON dbo.customer_treatment_course_usages (customer_treatment_course_id);
    CREATE UNIQUE INDEX UX_ctcu_appointment ON dbo.customer_treatment_course_usages (appointment_id);
END
GO

IF COL_LENGTH(N'dbo.appointments', N'customer_treatment_course_id') IS NULL
BEGIN
    ALTER TABLE dbo.appointments
        ADD customer_treatment_course_id INT NULL;

    ALTER TABLE dbo.appointments
        ADD CONSTRAINT FK_appointments_ctc
        FOREIGN KEY (customer_treatment_course_id)
        REFERENCES dbo.customer_treatment_courses(id);
END
GO
