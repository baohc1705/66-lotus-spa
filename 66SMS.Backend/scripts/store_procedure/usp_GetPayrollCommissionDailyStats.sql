/*
  usp_GetPayrollCommissionDailyStats
  Params: @StaffId, @FromDate, @ToDate
  Columns: WorkDate | OrderCount | ServiceHours | TotalCommission
*/
IF OBJECT_ID(N'dbo.usp_GetPayrollCommissionDailyStats', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPayrollCommissionDailyStats;
GO

CREATE PROCEDURE dbo.usp_GetPayrollCommissionDailyStats
    @StaffId  INT,
    @FromDate DATE,
    @ToDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        d.WorkDate,
        COUNT(*) AS OrderCount,
        CAST(SUM(d.DurationMins) / 60.0 AS decimal(10, 2)) AS ServiceHours,
        SUM(d.TotalCommission) AS TotalCommission
    FROM (
        SELECT
            CAST(SWITCHOFFSET(inv.issued_at, '+07:00') AS DATE) AS WorkDate,
            inv.id AS InvoiceId,
            SUM(ISNULL(ii.commission_amount, 0)) AS TotalCommission,
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
