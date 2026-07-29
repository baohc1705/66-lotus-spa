IF OBJECT_ID(N'dbo.usp_GetCustomerTraffic', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCustomerTraffic;
GO

CREATE PROCEDURE dbo.usp_GetCustomerTraffic
    @SalonId  INT = NULL,
    @FromDate DATE,
    @ToDate   DATE,
    @Tab      TINYINT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Tab = 1
    BEGIN
        SELECT
            RIGHT('0' + CAST(DATEPART(HOUR, ts.start_time) AS VARCHAR(2)), 2) + N':00' AS Label,
            CAST(COUNT(1) AS DECIMAL(18, 0)) AS Value
        FROM dbo.appointments a
        INNER JOIN dbo.time_slots ts ON ts.id = a.slot_id
        WHERE a.appointment_date BETWEEN @FromDate AND @ToDate
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
        GROUP BY DATEPART(HOUR, ts.start_time)
        ORDER BY DATEPART(HOUR, ts.start_time);
    END
    ELSE IF @Tab = 2
    BEGIN
        SELECT
            CASE DATEPART(WEEKDAY, a.appointment_date)
                WHEN 2 THEN N'T2'
                WHEN 3 THEN N'T3'
                WHEN 4 THEN N'T4'
                WHEN 5 THEN N'T5'
                WHEN 6 THEN N'T6'
                WHEN 7 THEN N'T7'
                ELSE N'CN'
            END AS Label,
            CAST(COUNT(1) AS DECIMAL(18, 0)) AS Value
        FROM dbo.appointments a
        WHERE a.appointment_date BETWEEN @FromDate AND @ToDate
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
        GROUP BY DATEPART(WEEKDAY, a.appointment_date)
        ORDER BY MIN(DATEPART(WEEKDAY, a.appointment_date));
    END
    ELSE
    BEGIN
        SELECT
            CONVERT(VARCHAR(5), a.appointment_date, 3) AS Label,
            CAST(COUNT(1) AS DECIMAL(18, 0)) AS Value
        FROM dbo.appointments a
        WHERE a.appointment_date BETWEEN @FromDate AND @ToDate
          AND a.status <> 6
          AND (@SalonId IS NULL OR a.salon_id = @SalonId)
        GROUP BY a.appointment_date
        ORDER BY a.appointment_date;
    END
END
GO
