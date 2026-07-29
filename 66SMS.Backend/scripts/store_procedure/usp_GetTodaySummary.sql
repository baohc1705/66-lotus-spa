IF OBJECT_ID(N'dbo.usp_GetTodaySummary', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTodaySummary;
GO

CREATE PROCEDURE dbo.usp_GetTodaySummary
    @SalonId INT  = NULL,
    @Today   DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Yesterday DATE = DATEADD(DAY, -1, @Today);

    DECLARE @ApptTotal INT = (
        SELECT COUNT(1)
        FROM dbo.appointments a
        WHERE a.appointment_date = @Today
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
    );

    DECLARE @ApptCompleted INT = (
        SELECT COUNT(1)
        FROM dbo.appointments a
        WHERE a.appointment_date = @Today
          AND a.status = 5
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
    );

    DECLARE @ApptYesterday INT = (
        SELECT COUNT(1)
        FROM dbo.appointments a
        WHERE a.appointment_date = @Yesterday
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
    );

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

    DECLARE @Gross DECIMAL(18, 0) = ISNULL((
        SELECT SUM(inv.total_amount)
        FROM dbo.invoices inv
        WHERE inv.status = 2
          AND CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) = @Today
          AND (@SalonId IS NULL OR inv.salon_id = @SalonId)
    ), 0);

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
