IF OBJECT_ID(N'dbo.usp_GetTodaySummary', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTodaySummary;
GO

-- Tổng hợp số liệu dashboard trong một ngày: lịch hẹn, phân loại khách, doanh thu gộp/ròng.
-- Dùng cho màn hình tổng quan hôm nay (hoặc bất kỳ ngày nào truyền vào @Today).
--
-- Input:
--   @SalonId INT  = NULL  -- lọc theo salon; NULL = gộp tất cả salon
--   @Today   DATE         -- ngày cần thống kê (múi giờ +07 khi quy đổi issued_at)
--
-- Output: 1 dòng duy nhất
--   AppointmentsTotal     INT           -- tổng lịch hẹn trong ngày (trừ hủy, status <> 6)
--   AppointmentsCompleted INT           -- lịch đã hoàn thành (status = 5)
--   CompletionRate        INT           -- % hoàn thành = Completed / Total, làm tròn
--   ChangeVsYesterday     INT           -- % thay đổi số lịch so với hôm qua (cùng cách đếm Total)
--   CustomersTotal        INT           -- tổng khách có hóa đơn paid trong ngày (New + Returning + Lapsed)
--   NewCustomers          INT           -- khách mua lần đầu trong ngày (first_purchase_at = @Today)
--   ReturningCustomers    INT           -- khách quay lại trong vòng 90 ngày kể từ lần mua đầu
--   LapsedCustomers       INT           -- khách quay lại sau >= 90 ngày kể từ lần mua đầu
--   GrossRevenue          DECIMAL(18,0) -- tổng total_amount hóa đơn đã thanh toán (status = 2)
--   CashOut               DECIMAL(18,0) -- hoa hồng staff + tiền hoàn (invoice status = 4)
--   NetRevenue            DECIMAL(18,0) -- GrossRevenue - CashOut
--
-- Ví dụ EXEC:
--   EXEC dbo.usp_GetTodaySummary @SalonId = 3, @Today = '2026-08-20';
--   EXEC dbo.usp_GetTodaySummary @SalonId = NULL, @Today = '2026-08-20';
CREATE PROCEDURE dbo.usp_GetTodaySummary
    @SalonId INT  = NULL,
    @Today   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- ngày hôm qua để so sánh % thay đổi lịch hẹn
    DECLARE @Yesterday DATE = DATEADD(DAY, -1, @Today);

    -- đếm tất cả lịch trong ngày, loại trừ đã hủy (status 6)
    DECLARE @ApptTotal INT = (
        SELECT COUNT(1)
        FROM dbo.appointments a
        WHERE a.appointment_date = @Today
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
    );

    -- đếm lịch đã hoàn thành (status 5) trong ngày
    DECLARE @ApptCompleted INT = (
        SELECT COUNT(1)
        FROM dbo.appointments a
        WHERE a.appointment_date = @Today
          AND a.status = 5
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
    );

    -- cùng cách đếm @ApptTotal nhưng cho ngày hôm qua
    DECLARE @ApptYesterday INT = (
        SELECT COUNT(1)
        FROM dbo.appointments a
        WHERE a.appointment_date = @Yesterday
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
    );

    -- khách mới: có hóa đơn paid hôm nay và first_purchase_at cũng là hôm nay
    DECLARE @CustNew INT = (
        SELECT COUNT(DISTINCT inv.customer_id)
        FROM dbo.invoices inv
        INNER JOIN dbo.customers c ON c.id = inv.customer_id
        WHERE inv.status = 2
          AND inv.customer_id IS NOT NULL
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) = @Today
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
          AND c.first_purchase_at IS NOT NULL
          AND CAST(SWITCHOFFSET(c.first_purchase_at, '+07:00') AS DATE) = @Today
    );

    -- khách quay lại: đã mua trước @Today nhưng chưa quá 90 ngày kể từ lần mua đầu
    DECLARE @CustReturning INT = (
        SELECT COUNT(DISTINCT inv.customer_id)
        FROM dbo.invoices inv
        INNER JOIN dbo.customers c ON c.id = inv.customer_id
        WHERE inv.status = 2
          AND inv.customer_id IS NOT NULL
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) = @Today
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
          AND c.first_purchase_at IS NOT NULL
          AND CAST(SWITCHOFFSET(c.first_purchase_at, '+07:00') AS DATE) < @Today
          AND DATEDIFF(DAY, CAST(SWITCHOFFSET(c.first_purchase_at, '+07:00') AS DATE), @Today) < 90
    );

    -- khách lapsed: quay lại sau >= 90 ngày kể từ lần mua đầu
    DECLARE @CustLapsed INT = (
        SELECT COUNT(DISTINCT inv.customer_id)
        FROM dbo.invoices inv
        INNER JOIN dbo.customers c ON c.id = inv.customer_id
        WHERE inv.status = 2
          AND inv.customer_id IS NOT NULL
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) = @Today
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
          AND c.first_purchase_at IS NOT NULL
          AND CAST(SWITCHOFFSET(c.first_purchase_at, '+07:00') AS DATE) < @Today
          AND DATEDIFF(DAY, CAST(SWITCHOFFSET(c.first_purchase_at, '+07:00') AS DATE), @Today) >= 90
    );

    -- doanh thu gộp: tổng total_amount hóa đơn đã thanh toán trong ngày
    DECLARE @Gross DECIMAL(18, 0) = ISNULL((
        SELECT SUM(inv.total_amount)
        FROM dbo.invoices inv
        WHERE inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) = @Today
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    ), 0);

    -- chi ra: hoa hồng staff trên dòng hóa đơn paid + tiền hoàn (invoice refunded, status 4)
    DECLARE @CashOut DECIMAL(18, 0) = ISNULL((
        SELECT SUM(ii.commission_amount)
        FROM dbo.invoice_items ii
        INNER JOIN dbo.invoices inv ON inv.id = ii.invoice_id
        WHERE ii.status = 1
          AND inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) = @Today
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    ), 0) + ISNULL((
        SELECT SUM(inv.paid_amount)
        FROM dbo.invoices inv
        WHERE inv.status = 4
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) = @Today
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    ), 0);

    -- gom 1 dòng kết quả, tính % hoàn thành và % thay đổi so hôm qua
    SELECT
        @ApptTotal AS AppointmentsTotal,
        @ApptCompleted AS AppointmentsCompleted,
        CASE WHEN @ApptTotal = 0 THEN 0
             ELSE CAST(ROUND(100.0 * @ApptCompleted / @ApptTotal, 0) AS INT)
        END AS CompletionRate,
        CASE WHEN @ApptYesterday = 0 THEN 0
             ELSE CAST(ROUND(100.0 * (@ApptTotal - @ApptYesterday) / @ApptYesterday, 0) AS INT)
        END AS ChangeVsYesterday,
        (@CustNew + @CustReturning + @CustLapsed) AS CustomersTotal,
        @CustNew AS NewCustomers,
        @CustReturning AS ReturningCustomers,
        @CustLapsed AS LapsedCustomers,
        @Gross AS GrossRevenue,
        @CashOut AS CashOut,
        (@Gross - @CashOut) AS NetRevenue;
END
GO
