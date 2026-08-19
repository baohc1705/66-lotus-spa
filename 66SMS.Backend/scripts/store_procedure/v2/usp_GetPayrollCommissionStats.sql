IF OBJECT_ID(N'dbo.usp_GetPayrollCommissionStats', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPayrollCommissionStats;
GO

-- Trả về chi tiết TỪNG DÒNG hoa hồng (1 dòng invoice_item = 1 dòng kết quả) của 1 thợ
-- trong khoảng ngày. Đây là data thô mức chi tiết nhất, dùng để FE tự tổng hợp lại theo
-- ngày/tuần/tháng tùy màn hình (khác với usp_GetPayrollCommissionDailyStats vốn đã tổng hợp sẵn theo ngày).
-- Chỉ lấy dòng hoa hồng active (status = 1) và hóa đơn đã thanh toán xong (status = 2).
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để lọc/sắp xếp theo ngày.
--
-- Cách dùng:
--   EXEC dbo.usp_GetPayrollCommissionStats
--        @StaffId  = 12,
--        @FromDate = '2026-08-01',
--        @ToDate   = '2026-08-31';
--
-- Input mẫu:
--   @StaffId  = 12            -- thợ id 12
--   @FromDate = '2026-08-01'  -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-08-31'  -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--
-- Output mẫu (chỉ liệt kê vài cột chính, thực tế trả về đầy đủ thông tin invoice + invoice_item + appointment):
--   StaffId | InvoiceId | InvoiceCode | ItemName        | CommissionAmount | IssuedLocalDate | DurationMins
--   --------|-----------|-------------|-----------------|-------------------|------------------|-------------
--   12      | 501       | HD000501    | Gội đầu         | 15000             | 2026-08-01       | 30
--   12      | 501       | HD000501    | Cắt tóc         | 45000             | 2026-08-01       | 30
--   12      | 508       | HD000508    | Massage         | 90000             | 2026-08-02       | 60
--   -- SlotId luôn trả về NULL: cột giữ chỗ cho tương lai, hiện chưa gán dữ liệu slot cụ thể
--   -- DurationMins = tổng thời lượng dịch vụ của appointment gắn với hóa đơn đó (0 nếu không có appointment)
CREATE PROCEDURE dbo.usp_GetPayrollCommissionStats
    @StaffId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- tổng thời lượng dịch vụ của từng lịch hẹn, gom sẵn 1 lần thay vì chạy subquery
    -- tương quan (correlated subquery) cho từng dòng kết quả phía dưới
    ;WITH thoi_luong_lich_hen AS (
        SELECT aps.appointment_id, SUM(aps.duration_snapshot) AS so_phut
        FROM dbo.appointment_services aps
        WHERE aps.status = 1
        GROUP BY aps.appointment_id
    )
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
        gio_vn.ngay               AS IssuedLocalDate,
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
        CAST(NULL AS INT)        AS SlotId,   -- giữ chỗ cho tương lai, hiện chưa có dữ liệu slot
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
        ISNULL(tl.so_phut, 0)    AS DurationMins
    FROM dbo.invoice_items AS ii
    JOIN dbo.invoices AS inv ON inv.id = ii.invoice_id
    JOIN dbo.staffs AS st ON st.id = ii.staff_id
    LEFT JOIN dbo.appointments AS ap ON ap.id = inv.appointment_id
    -- quy đổi giờ hóa đơn từ UTC sang giờ VN 1 lần, dùng lại cho cả SELECT/WHERE/ORDER BY
    CROSS APPLY (SELECT CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS ngay) gio_vn
    LEFT JOIN thoi_luong_lich_hen tl ON tl.appointment_id = ap.id
    WHERE ii.staff_id = @StaffId
      AND ii.status = 1
      AND inv.status = 2
      AND gio_vn.ngay BETWEEN @FromDate AND @ToDate
    ORDER BY gio_vn.ngay, ap.time_appt_start, inv.id, ii.id;
END
GO