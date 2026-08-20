IF OBJECT_ID(N'dbo.usp_GetPayrollCommissionDailyStats', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPayrollCommissionDailyStats;
GO

-- Thống kê hoa hồng theo NGÀY cho 1 kỹ thuật viên (payroll dashboard).
-- Chỉ tính invoice đã thanh toán (status = 2), invoice_item active của @StaffId.
-- WorkDate lấy từ issued_at quy về múi giờ +07:00.
--
-- Cách dùng:
--   -- hoa hồng theo ngày tháng 8/2026, staff id 12
--   EXEC dbo.usp_GetPayrollCommissionDailyStats @StaffId = 12, @FromDate = '2026-08-01', @ToDate = '2026-08-31';
--
-- Input mẫu:
--   @StaffId  = 12            -- kỹ thuật viên cần xem
--   @FromDate = '2026-08-01'  -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-08-31'  -- đến ngày (bao gồm)
--
-- Output mẫu:
--   WorkDate   | OrderCount | ServiceHours | TotalCommission
--   -----------|------------|--------------|----------------
--   2026-08-20 | 5          | 4.50         | 350000
--   2026-08-21 | 3          | 2.25         | 180000
CREATE PROCEDURE dbo.usp_GetPayrollCommissionDailyStats
    @StaffId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- subquery d: gom theo từng invoice (1 đơn = 1 dòng trước khi gom ngày)
    SELECT
        d.WorkDate,
        COUNT(*) AS OrderCount,
        CAST(SUM(d.DurationMins) / 60.0 AS decimal(10, 2)) AS ServiceHours,
        SUM(d.TotalCommission) AS TotalCommission
    FROM (
        SELECT
            -- ngày làm việc theo giờ VN, không dùng UTC thuần
            CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS WorkDate,
            inv.id AS InvoiceId,
            SUM(ISNULL(ii.commission_amount, 0)) AS TotalCommission,
            -- tổng phút dịch vụ của appointment gắn invoice (snapshot, không nhân quantity ở đây)
            ISNULL((
                SELECT SUM(aps.duration_snapshot)
                FROM dbo.appointment_services aps
                WHERE aps.appointment_id = inv.appointment_id
                  AND aps.status = 1
            ), 0) AS DurationMins
        FROM dbo.invoice_items ii
        INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        WHERE ii.staff_id = @StaffId
          AND ii.status = 1
          AND inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
        GROUP BY
            CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE),
            inv.id,
            inv.appointment_id
    ) d
    GROUP BY d.WorkDate
    ORDER BY d.WorkDate;
END
GO
