-- =============================================================
-- 66SMS - Nghiệp vụ Quản lý hóa đơn (Invoice / Billing)
-- Database First: chạy script này tay trong SQL Server (DB: 66LotusSpaDB)
-- =============================================================

-- Bảng hóa đơn (cha)
CREATE TABLE invoices
(
    id                          INT IDENTITY(1,1)   NOT NULL,
    invoice_code                NVARCHAR(50)        NOT NULL,
    customer_id                 INT                 NULL,
    customer_name               NVARCHAR(200)       NULL,
    customer_phone              NVARCHAR(20)        NULL,
    appointment_id              INT                 NULL,
    salon_id                    INT                 NULL,
    cashier_id                  INT                 NULL,
    sub_total                   DECIMAL(18,0)       NOT NULL DEFAULT 0,
    discount_amount             DECIMAL(18,0)       NOT NULL DEFAULT 0,
    membership_tier_id          INT                 NULL,
    membership_discount_amount  DECIMAL(18,0)       NOT NULL DEFAULT 0,
    loyalty_points_used         INT                 NOT NULL DEFAULT 0,
    loyalty_points_value        DECIMAL(18,0)       NOT NULL DEFAULT 0,
    loyalty_points_earned       INT                 NOT NULL DEFAULT 0,
    tax_amount                  DECIMAL(18,0)       NOT NULL DEFAULT 0,
    total_amount                DECIMAL(18,0)       NOT NULL DEFAULT 0,
    paid_amount                 DECIMAL(18,0)       NOT NULL DEFAULT 0,
    change_amount               DECIMAL(18,0)       NOT NULL DEFAULT 0,
    payment_method              INT                 NOT NULL DEFAULT 1,  -- 1=CASH,2=BANK,3=WALLET,4=VNPAY
    transaction_id              NVARCHAR(100)       NULL,
    status                      INT                 NOT NULL DEFAULT 1,  -- 0=DRAFT,1=UNPAID,2=PAID,3=CANCELLED,4=REFUNDED
    note                        NVARCHAR(500)       NULL,
    issued_at                   DATETIME2           NOT NULL,
    created_at                  DATETIME2           NOT NULL,
    created_by                  INT                 NULL,
    updated_at                  DATETIME2           NULL,
    updated_by                  INT                 NULL,
    CONSTRAINT PK_invoices PRIMARY KEY (id),
    CONSTRAINT FK_invoices_customers   FOREIGN KEY (customer_id)    REFERENCES customers(id),
    CONSTRAINT FK_invoices_appointments FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    CONSTRAINT FK_invoices_salons      FOREIGN KEY (salon_id)       REFERENCES salons(id)
);
GO

CREATE UNIQUE INDEX UX_invoices_invoice_code ON invoices(invoice_code);
GO

-- Bảng dòng hóa đơn (con)
CREATE TABLE invoice_items
(
    id              INT IDENTITY(1,1)   NOT NULL,
    invoice_id      INT                 NOT NULL,
    item_type       INT                 NOT NULL,  -- 1=SERVICE,2=PRODUCT,3=TREATMENT_COURSE
    ref_id          INT                 NOT NULL,
    item_name       NVARCHAR(200)       NOT NULL,
    unit_price      DECIMAL(18,0)       NOT NULL DEFAULT 0,
    quantity        INT                 NOT NULL DEFAULT 1,
    discount_amount DECIMAL(18,0)       NOT NULL DEFAULT 0,
    line_total      DECIMAL(18,0)       NOT NULL DEFAULT 0,
    staff_id        INT                 NULL,
    note            NVARCHAR(500)       NULL,
    status          INT                 NOT NULL DEFAULT 1,  -- 1=ACTIVE,2=DELETED
    CONSTRAINT PK_invoice_items PRIMARY KEY (id),
    CONSTRAINT FK_invoice_items_invoices FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    CONSTRAINT FK_invoice_items_staffs   FOREIGN KEY (staff_id)   REFERENCES staffs(id)
);
GO

CREATE INDEX IX_invoice_items_invoice_id ON invoice_items(invoice_id);
GO

-- (Tùy chọn) Thêm quyền cho resource "invoices" và gán cho role admin.
-- Điều chỉnh tên cột/role cho khớp schema thực tế của bảng permissions/role_permissions.
-- INSERT INTO permissions(name, resource, action, status, created_at)
-- VALUES (N'Tạo hóa đơn',  'invoices', 'create', 1, SYSUTCDATETIME()),
--        (N'Xem hóa đơn',  'invoices', 'read',   1, SYSUTCDATETIME()),
--        (N'Sửa hóa đơn',  'invoices', 'update', 1, SYSUTCDATETIME());
-- GO
