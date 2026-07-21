-- Database First: chạy tay trên 66LotusSpaDB
-- Thống kê hoa hồng theo hóa đơn đã thanh toán
-- issued_at lưu UTC (DateTimeOffset) → ngày local VN = SWITCHOFFSET +07:00

IF OBJECT_ID(N'dbo.usp_GetPayrollCommissionStats', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPayrollCommissionStats;
GO

CREATE PROCEDURE dbo.usp_GetPayrollCommissionStats
    @StaffId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        -- Staff
        st.id                    AS StaffId,
        st.full_name             AS StaffName,
        st.basic_salary          AS BasicSalary,
        st.salary_type           AS SalaryType,

        -- Invoice
        inv.id                   AS InvoiceId,
        inv.invoice_code         AS InvoiceCode,
        inv.customer_id          AS InvoiceCustomerId,
        inv.customer_name        AS InvoiceCustomerName,
        inv.customer_phone       AS InvoiceCustomerPhone,
        inv.appointment_id       AS InvoiceAppointmentId,
        inv.salon_id             AS InvoiceSalonId,
        inv.cashier_id           AS InvoiceCashierId,
        inv.sub_total            AS InvoiceSubTotal,
        inv.discount_amount      AS InvoiceDiscountAmount,
        inv.total_amount         AS InvoiceTotalAmount,
        inv.paid_amount          AS InvoicePaidAmount,
        inv.payment_method       AS InvoicePaymentMethod,
        inv.status               AS InvoiceStatus,
        inv.note                 AS InvoiceNote,
        inv.issued_at            AS InvoiceIssuedAt,
        CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS IssuedLocalDate,

        -- Invoice item
        ii.id                    AS InvoiceItemId,
        ii.item_type             AS ItemType,
        ii.ref_id                AS ItemRefId,
        ii.item_name             AS ItemName,
        ii.unit_price            AS UnitPrice,
        ii.quantity              AS Quantity,
        ii.discount_amount       AS ItemDiscountAmount,
        ii.line_total            AS LineTotal,
        ii.staff_id              AS ItemStaffId,
        ii.note                  AS ItemNote,
        ii.status                AS ItemStatus,
        ii.commission_rate       AS CommissionRate,
        ii.commission_amount     AS CommissionAmount,

        -- Appointment (nullable)
        ap.id                    AS AppointmentId,
        ap.appointment_code      AS AppointmentCode,
        ap.created_by_user_id    AS AppointmentCreatedByUserId,
        ap.staff_id              AS AppointmentStaffId,
        ap.slot_id               AS SlotId,
        ap.position_id           AS PositionId,
        ap.lock_id               AS LockId,
        ap.salon_id              AS AppointmentSalonId,
        ap.schedule_id           AS ScheduleId,
        ap.appointment_date      AS AppointmentDate,
        ap.source                AS AppointmentSource,
        ap.status                AS AppointmentStatus,
        ap.note                  AS AppointmentNote,
        ap.total_amount          AS AppointmentTotalAmount,
        ap.paid_amount           AS AppointmentPaidAmount,
        ap.deposit_percent       AS DepositPercent,
        ap.completed_at          AS CompletedAt,

        -- Slot start (local TimeOnly); DurationMins giống lịch hẹn (sum duration_snapshot)
        ts.start_time            AS SlotStartTime,
        ts.end_time              AS SlotEndTime,
        (
            SELECT ISNULL(SUM(aps.duration_snapshot), 0)
            FROM dbo.appointment_services AS aps
            WHERE aps.appointment_id = ap.id
              AND aps.status = 1
        )                        AS DurationMins
    FROM dbo.invoice_items AS ii
    INNER JOIN dbo.invoices AS inv
        ON inv.id = ii.invoice_id
    INNER JOIN dbo.staffs AS st
        ON st.id = ii.staff_id
    LEFT JOIN dbo.appointments AS ap
        ON ap.id = inv.appointment_id
    LEFT JOIN dbo.time_slots AS ts
        ON ts.id = ap.slot_id
    WHERE ii.staff_id = @StaffId
      AND ii.status = 1              -- active
      AND inv.status = 2             -- paid
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    ORDER BY IssuedLocalDate, ts.start_time, inv.id, ii.id;
END
GO
