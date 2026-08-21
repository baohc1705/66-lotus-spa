IF OBJECT_ID(N'dbo.usp_GetBookingTimeSlots', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetBookingTimeSlots;
GO

-- Trả về danh sách slot giờ trong ngày kèm trạng thái, để FE vẽ lịch cho khách chọn giờ đặt.
-- @service_ids: chuỗi CSV kiểu "1,5,9", tổng thời lượng = SUM các dịch vụ. Thợ phải làm đủ hết dịch vụ.
-- @staff_id: NULL = xem tổng hợp trạng thái slot của TẤT CẢ thợ đủ điều kiện.
--            có giá trị = xem chi tiết slot của đúng 1 thợ đó.
--
-- Status trả về cho mỗi slot:
--   'available' -> đủ chỗ, có thể bấm đặt bắt đầu từ slot này
--   'short'     -> thợ (hoặc còn thợ) đang rảnh tại slot này nhưng không đủ số slot liên tiếp cho hết thời lượng
--   'booked'    -> slot đã có người đặt / đang bị giữ chỗ
--   'outside'   -> ngoài ca làm việc (thợ không làm giờ này, hoặc không có thợ nào làm)
--
-- Cách dùng:
--   -- xem tổng hợp tất cả thợ phù hợp (không chỉ định thợ)
--   EXEC dbo.usp_GetBookingTimeSlots
--        @date = '2026-08-20',
--        @service_ids = '1,5',
--        @staff_id = NULL,
--        @salon_id = 3;
--
--   -- xem lịch chi tiết của đúng 1 thợ id 12
--   EXEC dbo.usp_GetBookingTimeSlots
--        @date = '2026-08-20',
--        @service_ids = '1,5',
--        @staff_id = 12,
--        @salon_id = 3;
--
-- Input mẫu:
--   @date = '2026-08-20'   -- ngày muốn xem lịch
--   @service_ids = '1,5'   -- dịch vụ id 1 (30 phút) + id 5 (60 phút) = 90 phút, giả sử slot_minutes = 30 -> cần 3 slot liên tiếp
--   @staff_id = NULL        -- không chọn thợ cụ thể, xem tổng hợp
--   @salon_id = 3           -- chỉ xét thợ đang làm ở salon id 3
--
-- Output mẫu (@staff_id = NULL, tổng hợp nhiều thợ):
--   SlotId | Time  | Status
--   -------|-------|-----------
--   1      | 08:00 | outside     -- chưa có thợ nào bắt đầu ca
--   2      | 08:30 | available   -- còn ít nhất 1 thợ đủ 3 slot liên tiếp trống
--   3      | 09:00 | short       -- có thợ đang rảnh nhưng không đủ slot liên tiếp
--   4      | 09:30 | booked      -- toàn bộ thợ đang làm giờ này đều đã kín chỗ
--
-- Output mẫu (@staff_id = 12, xem riêng thợ đó):
--   SlotId | Time  | Status
--   -------|-------|-----------
--   1      | 08:00 | outside     -- thợ 12 chưa vào ca
--   2      | 08:30 | available   -- thợ 12 có thể bắt đầu từ slot này
--   3      | 09:00 | booked      -- slot này thợ 12 đã có lịch hẹn khác
--
-- Nếu @staff_id được truyền nhưng thợ đó không đủ điều kiện phục vụ dịch vụ yêu cầu
-- hoặc không có ca làm trong ngày @date -> trả về toàn bộ slot với Status = 'outside'.
CREATE PROCEDURE dbo.usp_GetBookingTimeSlots
    @date         DATE,
    @service_ids  NVARCHAR(500),
    @staff_id     INT = NULL,
    @salon_id     INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @thoi_diem_hien_tai DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

    -- tách chuỗi service_ids thành từng id, bỏ mấy giá trị rác/không parse được
    DECLARE @ds_dich_vu_yeu_cau TABLE (service_id INT PRIMARY KEY);

    INSERT INTO @ds_dich_vu_yeu_cau (service_id)
    SELECT DISTINCT TRY_CAST(LTRIM(RTRIM(value)) AS INT)
    FROM STRING_SPLIT(@service_ids, N',')
    WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) > 0;

    DECLARE @so_luong_dich_vu_yeu_cau INT = (SELECT COUNT(*) FROM @ds_dich_vu_yeu_cau);

    -- cộng tổng thời lượng các dịch vụ, chỉ tính dịch vụ đang active
    -- nếu so_dich_vu_tim_duoc < so_luong_dich_vu_yeu_cau nghĩa là có id nào đó không tồn tại / bị tắt -> request sai
    DECLARE @tong_thoi_luong_phut INT, @so_dich_vu_tim_duoc INT;

    SELECT @tong_thoi_luong_phut = SUM(s.duration_mins),
           @so_dich_vu_tim_duoc  = COUNT(*)
    FROM dbo.services s
    JOIN @ds_dich_vu_yeu_cau w ON w.service_id = s.id
    WHERE s.status = 1;

    -- lấy cấu hình khung giờ làm việc trong ngày (giờ mở, giờ đóng, độ dài 1 slot)
    -- ưu tiên config riêng của salon nếu có, không thì fallback về config mặc định
    DECLARE @gio_mo_cua TIME(7), @gio_dong_cua TIME(7), @so_phut_moi_slot INT;

    SELECT TOP (1)
        @gio_mo_cua       = start_time,
        @gio_dong_cua     = end_time,
        @so_phut_moi_slot = slot_minutes
    FROM dbo.config_appointments
    WHERE start_time IS NOT NULL
      AND end_time IS NOT NULL
      AND slot_minutes IS NOT NULL
      AND slot_minutes > 0
    ORDER BY CASE WHEN salon_id = @salon_id THEN 0 ELSE 1 END, id;

    -- input không hợp lệ thì trả rỗng luôn, khỏi tính tiếp cho tốn công
    IF @so_luong_dich_vu_yeu_cau = 0
       OR @tong_thoi_luong_phut IS NULL OR @so_dich_vu_tim_duoc <> @so_luong_dich_vu_yeu_cau
       OR @gio_mo_cua IS NULL OR @gio_dong_cua IS NULL OR @so_phut_moi_slot IS NULL
       OR @gio_mo_cua >= @gio_dong_cua
    BEGIN
        SELECT CAST(NULL AS INT) AS SlotId, CAST(NULL AS VARCHAR(5)) AS [Time],
               CAST(NULL AS NVARCHAR(20)) AS Status
        WHERE 1 = 0;
        RETURN;
    END;

    -- sinh danh sách slot giờ trong ngày, kiểu 08:00-08:30, 08:30-09:00...
    -- mỗi slot dài đúng bằng so_phut_moi_slot, không có slot lẻ ở cuối
    DECLARE @ds_slot TABLE (
        slot_index INT NOT NULL PRIMARY KEY,
        slot_id    INT NOT NULL UNIQUE,
        start_time TIME(7) NOT NULL,
        end_time   TIME(7) NOT NULL
    );

    DECLARE @con_tro_gio TIME(7) = @gio_mo_cua;
    DECLARE @gio_ke_tiep TIME(7);
    DECLARE @chi_so_slot INT = 0;

    WHILE DATEADD(MINUTE, @so_phut_moi_slot, CAST(@con_tro_gio AS DATETIME)) <= CAST(@gio_dong_cua AS DATETIME)
    BEGIN
        SET @gio_ke_tiep = CAST(DATEADD(MINUTE, @so_phut_moi_slot, CAST(@con_tro_gio AS DATETIME)) AS TIME(7));
        INSERT INTO @ds_slot (slot_index, slot_id, start_time, end_time)
        VALUES (@chi_so_slot, @chi_so_slot + 1, @con_tro_gio, @gio_ke_tiep);
        SET @con_tro_gio = @gio_ke_tiep;
        SET @chi_so_slot += 1;
    END;

    IF NOT EXISTS (SELECT 1 FROM @ds_slot)
    BEGIN
        SELECT CAST(NULL AS INT) AS SlotId, CAST(NULL AS VARCHAR(5)) AS [Time],
               CAST(NULL AS NVARCHAR(20)) AS Status
        WHERE 1 = 0;
        RETURN;
    END;

    DECLARE @tong_so_slot INT = (SELECT COUNT(*) FROM @ds_slot);

    -- cần bao nhiêu slot liên tiếp để đủ tổng thời lượng booking, làm tròn lên, tối thiểu 1 slot
    -- (phut + slot - 1) / slot là công thức chia nguyên làm tròn lên, khỏi cần CEILING
    DECLARE @so_slot_can_dung INT =
        CASE WHEN @tong_thoi_luong_phut < 1 THEN 1
             ELSE (@tong_thoi_luong_phut + @so_phut_moi_slot - 1) / @so_phut_moi_slot END;

    -- tìm mấy thợ hợp lệ: đúng role staff, đang active, có đủ hết staff_services
    -- cho các dịch vụ yêu cầu, có ca làm trong ngày @date, đúng salon nếu có truyền vào,
    -- và nếu @staff_id được chỉ định thì chỉ giữ đúng thợ đó
    DECLARE @id_vai_tro_tho INT;
    SELECT TOP (1) @id_vai_tro_tho = id FROM dbo.roles WHERE code = N'staff' AND status = 1;

    DECLARE @ds_tho TABLE (staff_id INT NOT NULL PRIMARY KEY);

    INSERT INTO @ds_tho (staff_id)
    SELECT st.id
    FROM dbo.staffs st
    WHERE st.status = 1
      AND @id_vai_tro_tho IS NOT NULL
      AND (@staff_id IS NULL OR st.id = @staff_id)
      -- phải có đủ, không thiếu dịch vụ nào trong danh sách yêu cầu
      AND (SELECT COUNT(DISTINCT ss.service_id)
           FROM dbo.staff_services ss
           JOIN @ds_dich_vu_yeu_cau w ON w.service_id = ss.service_id
           WHERE ss.staff_id = st.id AND ss.status = 1) = @so_luong_dich_vu_yeu_cau
      -- user gắn với staff này phải có role staff và đang active
      AND EXISTS (
            SELECT 1 FROM dbo.users u
            JOIN dbo.user_roles ur ON ur.user_id = u.id AND ur.role_id = @id_vai_tro_tho
            WHERE u.id = st.user_id AND u.status = 1)
      -- phải có lịch làm việc (ca) trong ngày đặt
      AND EXISTS (
            SELECT 1 FROM dbo.work_schedules ws
            WHERE ws.staff_id = st.id AND ws.work_date = @date
              AND ws.status = 1 AND ws.shift_id IS NOT NULL)
      -- có truyền salon_id thì phải làm ở salon đó
      AND (@salon_id IS NULL OR EXISTS (
            SELECT 1 FROM dbo.staff_salons ssal
            WHERE ssal.staff_id = st.id AND ssal.salon_id = @salon_id AND ssal.status = 1));

    -- với mỗi thợ hợp lệ, đánh dấu các slot nằm trong ca làm việc của họ trong ngày @date
    DECLARE @slot_trong_ca TABLE (
        staff_id   INT NOT NULL,
        slot_index INT NOT NULL,
        PRIMARY KEY (staff_id, slot_index)
    );

    INSERT INTO @slot_trong_ca (staff_id, slot_index)
    SELECT DISTINCT ws.staff_id, sl.slot_index
    FROM dbo.work_schedules ws
    JOIN @ds_tho s ON s.staff_id = ws.staff_id
    JOIN @ds_slot sl ON sl.start_time >= ws.shift_start AND sl.end_time <= ws.shift_end
    WHERE ws.work_date = @date AND ws.status = 1 AND ws.shift_id IS NOT NULL
      AND ws.shift_start IS NOT NULL AND ws.shift_end IS NOT NULL;

    -- đánh dấu mấy slot đã bị chiếm cho từng thợ, gồm 2 nguồn:
    -- (a) lịch hẹn đã confirm trong bảng appointments
    -- (b) slot đang bị giữ tạm (appointment_slot_locks) mà chưa hết hạn
    DECLARE @slot_da_bi_chiem TABLE (
        staff_id   INT NOT NULL,
        slot_index INT NOT NULL,
        PRIMARY KEY (staff_id, slot_index)
    );

    ;WITH thoi_luong_lich_hen AS (
        -- tổng thời lượng thực tế của từng lịch hẹn, theo dịch vụ khách đã chọn
        SELECT aps.appointment_id, SUM(aps.duration_snapshot * aps.quantity) AS mins
        FROM dbo.appointments a
        JOIN @ds_tho s ON s.staff_id = a.staff_id
        JOIN dbo.appointment_services aps ON aps.appointment_id = a.id AND aps.status = 1
        WHERE a.appointment_date = @date AND a.status NOT IN (5, 6, 9)
        GROUP BY aps.appointment_id
    ),
    slot_bi_chiem AS (
        -- (a) lịch hẹn chính thức
        SELECT
            a.staff_id,
            fs.slot_index AS start_index,
            CASE WHEN ISNULL(d.mins, @so_phut_moi_slot) < 1 THEN 1
                 ELSE (ISNULL(d.mins, @so_phut_moi_slot) + @so_phut_moi_slot - 1) / @so_phut_moi_slot END AS needed
        FROM dbo.appointments a
        JOIN @ds_tho s ON s.staff_id = a.staff_id
        JOIN @ds_slot fs ON fs.start_time = a.time_appt_start
        LEFT JOIN thoi_luong_lich_hen d ON d.appointment_id = a.id
        WHERE a.appointment_date = @date AND a.status NOT IN (5, 6, 9)
          AND a.time_appt_start IS NOT NULL

        UNION ALL

        -- (b) slot đang giữ tạm, còn hiệu lực (chưa hết hạn)
        SELECT
            l.staff_id,
            fs.slot_index,
            CASE WHEN ISNULL(l.duration_mins, ISNULL(l.slots_needed, 1) * ISNULL(l.slot_minutes, @so_phut_moi_slot)) < 1 THEN 1
                 ELSE (ISNULL(l.duration_mins, ISNULL(l.slots_needed, 1) * ISNULL(l.slot_minutes, @so_phut_moi_slot)) + @so_phut_moi_slot - 1) / @so_phut_moi_slot END
        FROM dbo.appointment_slot_locks l
        JOIN @ds_tho s ON s.staff_id = l.staff_id
        JOIN @ds_slot fs ON fs.start_time = l.start_time
        WHERE l.appointment_date = @date AND l.status = 1 AND l.expires_at > @thoi_diem_hien_tai
          AND l.start_time IS NOT NULL
    )
    INSERT INTO @slot_da_bi_chiem (staff_id, slot_index)
    SELECT DISTINCT o.staff_id, o.start_index + n.slot_index
    FROM slot_bi_chiem o
    JOIN @ds_slot n ON n.slot_index < o.needed
    WHERE o.start_index + n.slot_index < @tong_so_slot;

    -- với mỗi thợ, tìm những slot có thể "bắt đầu đặt lịch" tại đó: phải có đủ
    -- so_slot_can_dung slot liên tiếp cùng nằm trong ca làm và chưa slot nào bị chiếm
    DECLARE @slot_co_the_bat_dau TABLE (
        staff_id  INT NOT NULL,
        start_idx INT NOT NULL,
        PRIMARY KEY (staff_id, start_idx)
    );

    INSERT INTO @slot_co_the_bat_dau (staff_id, start_idx)
    SELECT sh.staff_id, sh.slot_index
    FROM @slot_trong_ca sh
    WHERE (SELECT COUNT(*) FROM @slot_trong_ca i
           WHERE i.staff_id = sh.staff_id
             AND i.slot_index >= sh.slot_index
             AND i.slot_index < sh.slot_index + @so_slot_can_dung) = @so_slot_can_dung
      AND NOT EXISTS (
            SELECT 1 FROM @slot_da_bi_chiem b
            WHERE b.staff_id = sh.staff_id
              AND b.slot_index >= sh.slot_index
              AND b.slot_index < sh.slot_index + @so_slot_can_dung);

    -- nếu có chỉ định @staff_id nhưng thợ đó không đủ điều kiện phục vụ, hoặc
    -- không có ca làm ngày này -> trả toàn bộ slot với status 'outside'
    IF @staff_id IS NOT NULL
       AND (NOT EXISTS (SELECT 1 FROM @ds_tho WHERE staff_id = @staff_id)
            OR NOT EXISTS (SELECT 1 FROM @slot_trong_ca WHERE staff_id = @staff_id))
    BEGIN
        SELECT sl.slot_id AS SlotId, CONVERT(varchar(5), sl.start_time, 108) AS [Time],
               CAST(N'outside' AS NVARCHAR(20)) AS Status
        FROM @ds_slot sl ORDER BY sl.slot_index;
        RETURN;
    END;

    -- có chỉ định staff_id -> trả trạng thái từng slot theo đúng 1 thợ đó
    IF @staff_id IS NOT NULL
    BEGIN
        SELECT
            sl.slot_id AS SlotId,
            CONVERT(varchar(5), sl.start_time, 108) AS [Time],
            CASE
                WHEN i.slot_index IS NULL THEN N'outside'
                WHEN cs.start_idx IS NOT NULL THEN N'available'
                WHEN b.slot_index IS NOT NULL THEN N'booked'
                ELSE N'short'
            END AS Status
        FROM @ds_slot sl
        LEFT JOIN @slot_trong_ca i ON i.staff_id = @staff_id AND i.slot_index = sl.slot_index
        LEFT JOIN @slot_da_bi_chiem b ON b.staff_id = @staff_id AND b.slot_index = sl.slot_index
        LEFT JOIN @slot_co_the_bat_dau cs ON cs.staff_id = @staff_id AND cs.start_idx = sl.slot_index
        ORDER BY sl.slot_index;
    END
    ELSE
    BEGIN
        -- không chỉ định staff_id -> gộp trạng thái của tất cả thợ hợp lệ cho từng slot:
        -- ưu tiên available (còn thợ đặt được) > short (có thợ rảnh nhưng không đủ chỗ) > booked > outside
        ;WITH thong_ke_slot AS (
            SELECT
                sl.slot_index,
                SUM(CASE WHEN i.staff_id IS NOT NULL THEN 1 ELSE 0 END) AS so_tho_trong_ca,
                SUM(CASE WHEN i.staff_id IS NOT NULL AND b.staff_id IS NULL THEN 1 ELSE 0 END) AS so_tho_dang_ranh,
                SUM(CASE WHEN cs.staff_id IS NOT NULL THEN 1 ELSE 0 END) AS so_tho_co_the_bat_dau
            FROM @ds_slot sl
            LEFT JOIN @slot_trong_ca i ON i.slot_index = sl.slot_index
            LEFT JOIN @slot_da_bi_chiem b ON b.staff_id = i.staff_id AND b.slot_index = i.slot_index
            LEFT JOIN @slot_co_the_bat_dau cs ON cs.staff_id = i.staff_id AND cs.start_idx = sl.slot_index
            GROUP BY sl.slot_index
        )
        SELECT
            sl.slot_id AS SlotId,
            CONVERT(varchar(5), sl.start_time, 108) AS [Time],
            CASE
                WHEN ISNULL(tk.so_tho_co_the_bat_dau, 0) > 0 THEN N'available'
                WHEN ISNULL(tk.so_tho_dang_ranh, 0) > 0 THEN N'short'
                WHEN ISNULL(tk.so_tho_trong_ca, 0) > 0 THEN N'booked'
                ELSE N'outside'
            END AS Status
        FROM @ds_slot sl
        LEFT JOIN thong_ke_slot tk ON tk.slot_index = sl.slot_index
        ORDER BY sl.slot_index;
    END;
END
GO