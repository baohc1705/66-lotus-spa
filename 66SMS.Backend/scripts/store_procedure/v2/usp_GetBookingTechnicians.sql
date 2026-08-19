IF OBJECT_ID(N'dbo.usp_GetBookingTechnicians', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetBookingTechnicians;
GO

-- Tìm các thợ (staff) có thể nhận 1 booking gồm nhiều dịch vụ, vào 1 ngày cụ thể,
-- trả về kèm SlotsLeft = số "điểm bắt đầu" còn trống mà khách có thể chọn cho thợ đó.
-- @service_ids: chuỗi CSV kiểu "1,5,9". Thợ phải có staff_services đủ hết các dịch vụ (giao tập).
-- Nếu request không hợp lệ hoặc không tìm được thợ nào phù hợp thì trả về result rỗng.
--
-- Cách dùng:
--   EXEC dbo.usp_GetBookingTechnicians
--        @date = '2026-08-20',
--        @service_ids = '1,5',
--        @salon_id = 3;
--
-- Input mẫu:
--   @date = '2026-08-20'   -- khách muốn đặt lịch ngày 20/08/2026
--   @service_ids = '1,5'   -- gộp 2 dịch vụ id 1 (gội đầu, 30 phút) và id 5 (massage, 60 phút)
--   @salon_id = 3          -- chỉ tìm thợ đang làm ở salon id 3
--
-- Output mẫu (giả sử slot_minutes = 30, tổng thời lượng 90 phút -> cần 3 slot liên tiếp):
--   StaffId | StaffName      | Avatar                  | SlotsLeft
--   --------|----------------|-------------------------|----------
--   12      | Nguyen Van A   | https://.../avatar1.png | 5
--   8       | Tran Thi B     | https://.../avatar2.png | 2
--   -- SlotsLeft = 0 nghĩa là thợ đủ điều kiện phục vụ nhưng ca hôm đó đã kín chỗ
--   -- không có dòng nào trả về nghĩa là không tìm được thợ phù hợp / input sai
CREATE PROCEDURE dbo.usp_GetBookingTechnicians
    @date         DATE,
    @service_ids  NVARCHAR(500),
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
    -- nếu so_dich_vu_tim_duoc < so_luong_dich_vu_yeu_cau nghĩa là có id nào đó không tồn tại / bị tắt -> coi như request sai
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
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

    -- sinh danh sách slot giờ trong ngày, kiểu 08:00-08:30, 08:30-09:00...
    -- mỗi slot dài đúng bằng so_phut_moi_slot, không có slot lẻ ở cuối
    DECLARE @ds_slot TABLE (
        slot_index INT NOT NULL PRIMARY KEY,
        start_time TIME(7) NOT NULL,
        end_time   TIME(7) NOT NULL
    );

    DECLARE @con_tro_gio TIME(7) = @gio_mo_cua;
    DECLARE @gio_ke_tiep TIME(7);
    DECLARE @chi_so_slot INT = 0;

    WHILE DATEADD(MINUTE, @so_phut_moi_slot, CAST(@con_tro_gio AS DATETIME)) <= CAST(@gio_dong_cua AS DATETIME)
    BEGIN
        SET @gio_ke_tiep = CAST(DATEADD(MINUTE, @so_phut_moi_slot, CAST(@con_tro_gio AS DATETIME)) AS TIME(7));
        INSERT INTO @ds_slot (slot_index, start_time, end_time) VALUES (@chi_so_slot, @con_tro_gio, @gio_ke_tiep);
        SET @con_tro_gio = @gio_ke_tiep;
        SET @chi_so_slot += 1;
    END;

    IF NOT EXISTS (SELECT 1 FROM @ds_slot)
    BEGIN
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
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
    -- cho các dịch vụ yêu cầu, có ca làm trong ngày @date, và đúng salon nếu có truyền vào
    DECLARE @id_vai_tro_tho INT;
    SELECT TOP (1) @id_vai_tro_tho = id FROM dbo.roles WHERE code = N'staff' AND status = 1;

    DECLARE @ds_tho TABLE (
        staff_id   INT NOT NULL PRIMARY KEY,
        staff_name NVARCHAR(100) NOT NULL,
        avatar     NVARCHAR(500) NULL
    );

    INSERT INTO @ds_tho (staff_id, staff_name, avatar)
    SELECT st.id, st.full_name, st.avatar_url
    FROM dbo.staffs st
    WHERE st.status = 1
      AND @id_vai_tro_tho IS NOT NULL
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

    IF NOT EXISTS (SELECT 1 FROM @ds_tho)
    BEGIN
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

    -- với mỗi thợ, xác định khoảng slot (min_idx tới max_idx) nằm trong ca làm của họ
    DECLARE @khoang_ca_lam TABLE (
        staff_id INT NOT NULL PRIMARY KEY,
        min_idx  INT NOT NULL,
        max_idx  INT NOT NULL
    );

    INSERT INTO @khoang_ca_lam (staff_id, min_idx, max_idx)
    SELECT ws.staff_id, MIN(sl.slot_index), MAX(sl.slot_index)
    FROM dbo.work_schedules ws
    JOIN @ds_tho s ON s.staff_id = ws.staff_id
    JOIN @ds_slot sl ON sl.start_time >= ws.shift_start AND sl.end_time <= ws.shift_end
    WHERE ws.work_date = @date AND ws.status = 1 AND ws.shift_id IS NOT NULL
      AND ws.shift_start IS NOT NULL AND ws.shift_end IS NOT NULL
    GROUP BY ws.staff_id, ws.shift_start, ws.shift_end;

    IF NOT EXISTS (SELECT 1 FROM @khoang_ca_lam)
    BEGIN
        SELECT CAST(NULL AS INT) AS StaffId, CAST(NULL AS NVARCHAR(100)) AS StaffName,
               CAST(NULL AS NVARCHAR(500)) AS Avatar, CAST(NULL AS INT) AS SlotsLeft
        WHERE 1 = 0;
        RETURN;
    END;

    -- đánh dấu mấy slot đã bị chiếm cho từng thợ, gồm 2 nguồn:
    -- (a) lịch hẹn đã confirm trong bảng appointments
    -- (b) slot đang bị giữ tạm (appointment_slot_locks) mà chưa hết hạn
    -- mỗi lịch hẹn/lock tính ra "needed" slot rồi đánh dấu hết các slot liên tiếp từ điểm bắt đầu
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

    -- cuối cùng: đếm số "điểm bắt đầu" mà tại đó thợ còn đủ so_slot_can_dung slot liên tiếp,
    -- chưa bị chiếm, và nằm gọn trong ca làm việc -> đó là SlotsLeft
    ;WITH so_slot_con_trong AS (
        SELECT r.staff_id, CAST(COUNT(*) AS INT) AS SlotsLeft
        FROM @khoang_ca_lam r
        JOIN @ds_slot sl
            ON sl.slot_index >= r.min_idx
           AND sl.slot_index <= r.max_idx - @so_slot_can_dung + 1
        WHERE NOT EXISTS (
            SELECT 1 FROM @slot_da_bi_chiem b
            WHERE b.staff_id = r.staff_id
              AND b.slot_index >= sl.slot_index
              AND b.slot_index < sl.slot_index + @so_slot_can_dung)
        GROUP BY r.staff_id
    )
    SELECT
        s.staff_id                   AS StaffId,
        s.staff_name                 AS StaffName,
        s.avatar                     AS Avatar,
        ISNULL(fc.SlotsLeft, 0)      AS SlotsLeft
    FROM @ds_tho s
    JOIN (SELECT DISTINCT staff_id FROM @khoang_ca_lam) co_ca_lam ON co_ca_lam.staff_id = s.staff_id
    LEFT JOIN so_slot_con_trong fc ON fc.staff_id = s.staff_id
    ORDER BY ISNULL(fc.SlotsLeft, 0) DESC, s.staff_id;
END
GO