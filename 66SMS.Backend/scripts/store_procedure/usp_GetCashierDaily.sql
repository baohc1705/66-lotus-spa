IF OBJECT_ID(N'dbo.usp_GetCashierStaffColumns', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCashierStaffColumns;
GO

CREATE PROCEDURE dbo.usp_GetCashierStaffColumns
    @SalonId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        st.id AS StaffId,
        st.full_name AS StaffName,
        st.avatar_url AS Avatar
    FROM dbo.staffs st
    INNER JOIN dbo.users u
        ON u.id = st.user_id AND u.status = 1
    INNER JOIN dbo.user_roles ur
        ON ur.user_id = u.id
    INNER JOIN dbo.roles r
        ON r.id = ur.role_id
       AND r.status = 1
       AND r.code = N'staff'
    WHERE st.status <> 2
      AND (
            @SalonId IS NULL
            OR EXISTS (
                SELECT 1
                FROM dbo.staff_salons ssal
                WHERE ssal.staff_id = st.id
                  AND ssal.salon_id = @SalonId
                  AND ssal.status = 1
            )
          )
    ORDER BY st.full_name;
END
GO

IF OBJECT_ID(N'dbo.usp_GetCashierDailyBookings', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCashierDailyBookings;
GO

-- List nhe cho calendar: 1 appointment = 1 row. ServiceName = ten DV dau tien (khong STRING_AGG).
CREATE PROCEDURE dbo.usp_GetCashierDailyBookings
    @FromDate DATE,
    @ToDate   DATE,
    @SalonId  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    CREATE TABLE #Appt (
        AppointmentId    INT            NOT NULL PRIMARY KEY,
        AppointmentDate  DATE           NOT NULL,
        StaffId          INT            NOT NULL,
        StartTime        TIME(7)        NULL,
        EndTime          TIME(7)        NULL,
        PositionId       INT            NULL,
        StatusCode       INT            NOT NULL,
        TotalAmount      DECIMAL(18, 0) NOT NULL,
        PaidAmount       DECIMAL(18, 0) NOT NULL,
        CreatedByUserId  INT            NOT NULL
    );

    INSERT INTO #Appt (
        AppointmentId, AppointmentDate, StaffId, StartTime, EndTime,
        PositionId, StatusCode, TotalAmount, PaidAmount, CreatedByUserId
    )
    SELECT
        a.id,
        a.appointment_date,
        a.staff_id,
        a.time_appt_start,
        a.time_appt_end,
        a.position_id,
        a.status,
        a.total_amount,
        a.paid_amount,
        a.created_by_user_id
    FROM dbo.appointments a
    WHERE a.appointment_date >= @FromDate
      AND a.appointment_date <= @ToDate
      AND (@SalonId IS NULL OR a.salon_id = @SalonId);

    CREATE TABLE #SvcDur (
        AppointmentId INT NOT NULL PRIMARY KEY,
        DurationMins  INT NOT NULL
    );

    INSERT INTO #SvcDur (AppointmentId, DurationMins)
    SELECT
        aps.appointment_id,
        ISNULL(SUM(aps.duration_snapshot * aps.quantity), 0)
    FROM dbo.appointment_services aps
    INNER JOIN #Appt a
        ON a.AppointmentId = aps.appointment_id
    WHERE aps.status = 1
    GROUP BY aps.appointment_id;

    SELECT
        a.AppointmentId AS Id,
        COALESCE(c.full_name, stf.full_name, u.username, N'Khách vãng lai') AS CustomerName,
        CONVERT(varchar(10), a.AppointmentDate, 23) AS BookingDate,
        ISNULL(fs.ServiceName, N'Dịch vụ') AS ServiceName,
        a.StaffId,
        CONVERT(varchar(5), a.StartTime, 108) AS StartTime,
        CONVERT(
            varchar(5),
            COALESCE(
                a.EndTime,
                CAST(DATEADD(
                    MINUTE,
                    CASE WHEN ISNULL(dur.DurationMins, 0) > 0 THEN dur.DurationMins ELSE 15 END,
                    CAST(ISNULL(a.StartTime, CAST('00:00' AS TIME)) AS DATETIME)
                ) AS TIME)
            ),
            108
        ) AS EndTime,
        a.StatusCode AS Status
    FROM #Appt a
    INNER JOIN dbo.users u
        ON u.id = a.CreatedByUserId
    LEFT JOIN dbo.customers c
        ON c.user_id = u.id
    LEFT JOIN dbo.staffs stf
        ON stf.user_id = u.id
    LEFT JOIN #SvcDur dur
        ON dur.AppointmentId = a.AppointmentId
    OUTER APPLY (
        SELECT TOP (1)
            ISNULL(s.name, N'Dịch vụ') AS ServiceName
        FROM dbo.appointment_services aps
        LEFT JOIN dbo.services s
            ON s.id = aps.service_id
        WHERE aps.appointment_id = a.AppointmentId
          AND aps.status = 1
        ORDER BY aps.id
    ) fs
    ORDER BY a.AppointmentDate, a.StartTime, a.AppointmentId;

    DROP TABLE #SvcDur;
    DROP TABLE #Appt;
END
GO
