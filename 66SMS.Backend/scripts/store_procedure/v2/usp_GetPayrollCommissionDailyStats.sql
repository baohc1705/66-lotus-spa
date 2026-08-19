IF OBJECT_ID(N'dbo.usp_GetPayrollCommissionDailyStats', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPayrollCommissionDailyStats;
GO

-- Thống kê hoa hồng (commission) theo từng ngày làm việc của 1 thợ, dùng cho màn hình payroll.
-- Chỉ tính hóa đơn đã thanh toán xong (status = 2) và các dòng hoa hồng đang active (status = 1).
-- issued_at lưu theo UTC nên phải quy đổi về giờ Việt Nam (+07:00) để xác định "ngày làm việc".
--
-- Cách dùng:
--   EXEC dbo.usp_GetPayrollCommissionDailyStats
--        @StaffId  = 12,
--        @FromDate = '2026-08-01',
--        @ToDate   = '2026-08-31';
--
-- Input mẫu:
--   @StaffId  = 12            -- thợ id 12
--   @FromDate = '2026-08-01'  -- từ ngày (theo giờ VN)
--   @ToDate   = '2026-08-31'  -- đến ngày (theo giờ VN, bao gồm cả 2 đầu)
--
-- Output mẫu:
--   WorkDate   | OrderCount | ServiceHours | TotalCommission
--   -----------|------------|--------------|----------------
--   2026-08-01 | 5          | 6.50         | 850000
--   2026-08-02 | 3          | 3.00         | 420000
--   -- OrderCount       = số hóa đơn (invoice) thợ có hoa hồng trong ngày đó
--   -- ServiceHours     = tổng thời lượng dịch vụ đã làm trong ngày, quy đổi ra giờ
--   -- TotalCommission  = tổng tiền hoa hồng thợ nhận được trong ngày
CREATE PROCEDURE dbo.usp_GetPayrollCommissionDailyStats
    @StaffId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- tổng thời lượng dịch vụ của từng lịch hẹn (appointment), gom sẵn 1 lần thay vì
    -- chạy subquery tương quan (correlated subquery) cho từng dòng hóa đơn phía dưới
    ;WITH thoi_luong_lich_hen AS (
        SELECT aps.appointment_id, SUM(aps.duration_snapshot) AS so_phut
        FROM dbo.appointment_services aps
        WHERE aps.status = 1
        GROUP BY aps.appointment_id
    ),
    -- gom hoa hồng + thời lượng theo từng hóa đơn (1 hóa đơn có thể có nhiều dòng invoice_items)
    hoa_don_theo_ngay AS (
        SELECT
            CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS WorkDate,
            inv.id AS InvoiceId,
            SUM(ISNULL(ii.commission_amount, 0)) AS TotalCommission,
            ISNULL(tl.so_phut, 0) AS DurationMins
        FROM dbo.invoice_items ii
        JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        LEFT JOIN thoi_luong_lich_hen tl ON tl.appointment_id = inv.appointment_id
        WHERE ii.staff_id = @StaffId
          AND ii.status = 1
          AND inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) BETWEEN @FromDate AND @ToDate
        GROUP BY
            CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE),
            inv.id,
            inv.appointment_id,
            tl.so_phut
    )
    -- cuối cùng gom theo ngày làm việc để ra số liệu tổng hợp
    SELECT
        d.WorkDate,
        COUNT(*) AS OrderCount,
        CAST(SUM(d.DurationMins) / 60.0 AS DECIMAL(10, 2)) AS ServiceHours,
        SUM(d.TotalCommission) AS TotalCommission
    FROM hoa_don_theo_ngay d
    GROUP BY d.WorkDate
    ORDER BY d.WorkDate;
END
GO