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

CREATE PROCEDURE dbo.usp_GetCashierDailyBookings
    @FromDate DATE,
    @ToDate   DATE,
    @SalonId  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    CREATE TABLE #Appt (
        AppointmentId    INT            NOT NULL PRIMARY KEY,
        AppointmentCode  NVARCHAR(50)   NULL,
        AppointmentDate  DATE           NOT NULL,
        StaffId          INT            NOT NULL,
        StaffName        NVARCHAR(100)  NOT NULL,
        SlotId           INT            NOT NULL,
        StartTime        TIME(7)        NULL,
        EndTime          TIME(7)        NULL,
        PositionId       INT            NULL,
        PositionName     NVARCHAR(300)  NULL,
        PositionStatus   INT            NULL,
        StatusCode       INT            NOT NULL,
        Note             NVARCHAR(1000) NULL,
        TotalAmount      DECIMAL(18, 0) NOT NULL,
        PaidAmount       DECIMAL(18, 0) NOT NULL,
        DepositPercent   INT            NULL,
        DepositDeadline  DATETIMEOFFSET(7) NULL,
        TimeStartService DATETIMEOFFSET(7) NULL,
        CompletedAt      DATETIMEOFFSET(7) NULL,
        SalonId          INT            NULL,
        CreatedByUserId  INT            NOT NULL
    );

    INSERT INTO #Appt (
        AppointmentId, AppointmentCode, AppointmentDate, StaffId, StaffName,
        SlotId, StartTime, EndTime, PositionId, PositionName, PositionStatus,
        StatusCode, Note, TotalAmount, PaidAmount, DepositPercent,
        DepositDeadline, TimeStartService, CompletedAt, SalonId, CreatedByUserId
    )
    SELECT
        a.id,
        a.appointment_code,
        a.appointment_date,
        a.staff_id,
        ISNULL(st.full_name, N'N/A'),
        a.slot_id,
        COALESCE(a.time_appt_start, ts.start_time),
        a.time_appt_end,
        a.position_id,
        CASE
            WHEN bp.id IS NULL THEN NULL
            ELSE ISNULL(br.name, N'') + N' — ' + ISNULL(bp.name, N'')
        END,
        bp.status,
        a.status,
        a.note,
        a.total_amount,
        a.paid_amount,
        ISNULL(a.deposit_percent, ISNULL(cfg.deposit_percent, 20)),
        a.deposit_deadline_at,
        a.time_start_service,
        a.completed_at,
        a.salon_id,
        a.created_by_user_id
    FROM dbo.appointments a
    INNER JOIN dbo.staffs st
        ON st.id = a.staff_id
    LEFT JOIN dbo.time_slots ts
        ON ts.id = a.slot_id
    LEFT JOIN dbo.booking_positions bp
        ON bp.id = a.position_id
    LEFT JOIN dbo.booking_rooms br
        ON br.id = bp.room_id
    OUTER APPLY (
        SELECT TOP (1) cfg.deposit_percent
        FROM dbo.config_appointments cfg
        WHERE cfg.salon_id = a.salon_id
        ORDER BY cfg.id
    ) cfg
    WHERE a.appointment_date >= @FromDate
      AND a.appointment_date <= @ToDate
      AND (@SalonId IS NULL OR a.salon_id = @SalonId);

    CREATE TABLE #Svc (
        AppointmentId  INT            NOT NULL PRIMARY KEY,
        ServiceId      INT            NULL,
        ServiceName    NVARCHAR(MAX)  NULL,
        DurationMins   INT            NOT NULL,
        ServiceSubTotal DECIMAL(18, 0) NOT NULL
    );

    INSERT INTO #Svc (AppointmentId, ServiceId, ServiceName, DurationMins, ServiceSubTotal)
    SELECT
        aps.appointment_id,
        MIN(aps.service_id),
        STRING_AGG(CAST(s.name AS NVARCHAR(MAX)), N', ')
            WITHIN GROUP (ORDER BY aps.id),
        ISNULL(SUM(aps.duration_snapshot * aps.quantity), 0),
        ISNULL(SUM(aps.price_snapshot * aps.quantity), 0)
    FROM dbo.appointment_services aps
    INNER JOIN #Appt a
        ON a.AppointmentId = aps.appointment_id
    LEFT JOIN dbo.services s
        ON s.id = aps.service_id
    WHERE aps.status = 1
    GROUP BY aps.appointment_id;

    CREATE TABLE #Inv (
        AppointmentId INT           NOT NULL PRIMARY KEY,
        InvoiceId     INT           NOT NULL,
        InvoiceCode   NVARCHAR(50)  NULL
    );

    INSERT INTO #Inv (AppointmentId, InvoiceId, InvoiceCode)
    SELECT
        inv.appointment_id,
        MIN(inv.id),
        MIN(inv.invoice_code)
    FROM dbo.invoices inv
    INNER JOIN #Appt a
        ON a.AppointmentId = inv.appointment_id
    WHERE inv.appointment_id IS NOT NULL
      AND inv.status <> 3
    GROUP BY inv.appointment_id;

    SELECT
        a.AppointmentId AS Id,
        a.AppointmentCode,
        COALESCE(c.full_name, stf.full_name, u.username, N'Khách vãng lai') AS CustomerName,
        c.phone AS CustomerPhone,
        c.avatar_url AS CustomerAvatar,
        CONVERT(varchar(10), a.AppointmentDate, 23) AS BookingDate,
        ISNULL(svc.ServiceName, N'Dịch vụ') AS ServiceName,
        svc.ServiceId,
        a.StaffId,
        a.StaffName,
        a.SlotId,
        CONVERT(varchar(5), a.StartTime, 108) AS StartTime,
        CONVERT(
            varchar(5),
            COALESCE(
                a.EndTime,
                CAST(DATEADD(
                    MINUTE,
                    CASE WHEN ISNULL(svc.DurationMins, 0) > 0 THEN svc.DurationMins ELSE 15 END,
                    CAST(ISNULL(a.StartTime, CAST('00:00' AS TIME)) AS DATETIME)
                ) AS TIME)
            ),
            108
        ) AS EndTime,
        CASE
            WHEN a.StatusCode = 1 THEN N'pending'
            WHEN a.StatusCode = 2 THEN N'confirmed'
            WHEN a.StatusCode = 3 AND a.PositionId IS NOT NULL THEN N'waiting'
            WHEN a.StatusCode = 3 THEN N'not-arrived'
            WHEN a.StatusCode = 4 THEN N'in-progress'
            WHEN a.StatusCode = 5 AND a.PaidAmount >= a.TotalAmount THEN N'paid'
            WHEN a.StatusCode = 5 THEN N'unpaid'
            WHEN a.StatusCode = 6 THEN N'cancelled'
            WHEN a.StatusCode = 9 THEN N'not-arrived'
            ELSE N'pending'
        END AS Status,
        a.TotalAmount,
        CASE WHEN a.PaidAmount > a.TotalAmount THEN a.TotalAmount ELSE a.PaidAmount END AS PaidAmount,
        CAST(ROUND(a.TotalAmount * a.DepositPercent / 100.0, 0) AS DECIMAL(18, 0)) AS DepositAmount,
        CASE WHEN a.TotalAmount - a.PaidAmount < 0 THEN 0 ELSE a.TotalAmount - a.PaidAmount END AS RemainingAmount,
        CAST(CASE
            WHEN a.PaidAmount >= ROUND(a.TotalAmount * a.DepositPercent / 100.0, 0) THEN 1
            ELSE 0
        END AS BIT) AS DepositPaid,
        a.DepositDeadline AS DepositDeadlineAt,
        a.Note,
        ISNULL(w.balance, 0) AS CustomerWalletBalance,
        inv.InvoiceId,
        inv.InvoiceCode,
        CASE
            WHEN ISNULL(svc.ServiceSubTotal, 0) - a.TotalAmount > 0
                THEN ISNULL(svc.ServiceSubTotal, 0) - a.TotalAmount
            ELSE 0
        END AS DiscountAmount,
        a.PositionId,
        a.PositionName,
        a.PositionStatus,
        a.TimeStartService,
        a.CompletedAt
    FROM #Appt a
    INNER JOIN dbo.users u
        ON u.id = a.CreatedByUserId
    LEFT JOIN dbo.customers c
        ON c.user_id = u.id
    LEFT JOIN dbo.staffs stf
        ON stf.user_id = u.id
    LEFT JOIN dbo.wallets w
        ON w.customer_id = c.id
    LEFT JOIN #Svc svc
        ON svc.AppointmentId = a.AppointmentId
    LEFT JOIN #Inv inv
        ON inv.AppointmentId = a.AppointmentId
    ORDER BY a.AppointmentDate, a.StartTime, a.AppointmentId;

    DROP TABLE #Inv;
    DROP TABLE #Svc;
    DROP TABLE #Appt;
END
GO
