IF OBJECT_ID(N'dbo.usp_GetPayrollCommissionStats', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPayrollCommissionStats;
GO

-- Lấy chi tiết từng dòng hoa hồng (invoice_item) của 1 kỹ thuật viên trong khoảng ngày.
-- Dùng cho màn payroll xem theo ngày/tuần: mỗi dòng = 1 item trên hóa đơn đã thanh toán.
-- Kèm thông tin invoice, appointment và duration tổng của lịch hẹn liên quan.
--
-- Cách dùng:
--   -- chi tiết hoa hồng tháng 8/2026, staff id 12
--   EXEC dbo.usp_GetPayrollCommissionStats @StaffId = 12, @FromDate = '2026-08-01', @ToDate = '2026-08-31';
--
-- Input mẫu:
--   @StaffId  = 12            -- kỹ thuật viên
--   @FromDate = '2026-08-01'  -- từ ngày (IssuedLocalDate, múi +07:00)
--   @ToDate   = '2026-08-31'  -- đến ngày
--
-- Output mẫu (rút gọn):
--   StaffId | StaffName | InvoiceCode | ItemName | CommissionAmount | IssuedLocalDate | DurationMins
--   --------|-----------|-------------|----------|------------------|-----------------|-------------
--   12      | Nguyễn A  | HD-001      | Cắt tóc  | 50000            | 2026-08-20      | 45
CREATE PROCEDURE dbo.usp_GetPayrollCommissionStats
    @StaffId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- mỗi invoice_item active của staff = 1 dòng; join invoice + appointment để hiển thị đủ context
    SELECT
        st.id                    AS StaffId,
        st.full_name             AS StaffName,
        st.basic_salary          AS BasicSalary,
        st.salary_type           AS SalaryType,
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
        ap.id                    AS AppointmentId,
        ap.appointment_code      AS AppointmentCode,
        ap.created_by_user_id    AS AppointmentCreatedByUserId,
        ap.staff_id              AS AppointmentStaffId,
        CAST(NULL AS INT)            AS SlotId,
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
        ap.time_appt_start       AS SlotStartTime,
        ap.time_appt_end         AS SlotEndTime,
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
    WHERE ii.staff_id = @StaffId
      AND ii.status = 1
      AND inv.status = 2
      AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
    ORDER BY IssuedLocalDate, ap.time_appt_start, inv.id, ii.id;
END
GO
