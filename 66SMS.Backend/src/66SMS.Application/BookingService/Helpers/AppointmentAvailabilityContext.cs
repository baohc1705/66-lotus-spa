using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    // Đại diện cho một khung giờ làm việc của nhân viên trong ca (giờ bắt đầu ca và giờ kết thúc ca)
    public sealed record ShiftWindow(TimeOnly ShiftStart, TimeOnly ShiftEnd);

    // Dữ liệu tổng hợp để kiểm tra lịch trống, được build một lần rồi tái sử dụng cho nhiều truy vấn
    // Tất cả dữ liệu được load lên RAM để tránh truy vấn DB lặp lại khi tính toán slot
    public sealed class AppointmentAvailabilityContext
    {
        // Ngày cần kiểm tra lịch
        public DateOnly Date { get; }

        // Thời lượng dịch vụ tính bằng phút
        public int DurationMins { get; }

        // Số lượng slot liên tiếp cần chiếm để thực hiện dịch vụ (= DurationMins / độ dài mỗi slot)
        public int SlotsNeeded { get; }

        // Toàn bộ danh sách slot trong ngày, sắp xếp theo giờ
        public IReadOnlyList<TimeSlot> TimeSlots { get; }

        // Danh sách nhân viên đang hoạt động
        public IReadOnlyList<Staff> ActiveStaff { get; }

        // Key: StaffId — Value: danh sách ca làm việc của nhân viên đó trong ngày
        public Dictionary<int, List<ShiftWindow>> StaffShiftWindows { get; }

        // Key: StaffId — Value: ScheduleId tương ứng để gán vào lịch hẹn khi đặt
        public Dictionary<int, int> StaffScheduleIds { get; }

        // Key: (StaffId, SlotId) — Value: 1 nếu slot đó đã bị chiếm (đặt lịch hoặc tạm giữ)
        // Dùng tuple key để tra cứu O(1) thay vì vòng lặp
        public Dictionary<(int StaffId, int SlotId), byte> BookedSlots { get; }

        public AppointmentAvailabilityContext(
            DateOnly date, int durationMins, int slotsNeeded,
            IReadOnlyList<TimeSlot> timeSlots, IReadOnlyList<Staff> activeStaff,
            Dictionary<int, List<ShiftWindow>> staffShiftWindows,
            Dictionary<int, int> staffScheduleIds,
            Dictionary<(int StaffId, int SlotId), byte> bookedSlots,
            Dictionary<(int StaffId, int SlotId), byte> heldSlots)
        {
            Date = date;
            DurationMins = durationMins;
            SlotsNeeded = slotsNeeded;
            TimeSlots = timeSlots;
            ActiveStaff = activeStaff;
            StaffShiftWindows = staffShiftWindows;
            StaffScheduleIds = staffScheduleIds;
            BookedSlots = bookedSlots;

            // Slot đang tạm giữ (trong quá trình đặt) cũng được coi là "đã bận"
            // Gộp vào BookedSlots để logic kiểm tra slot chỉ cần tra một dictionary duy nhất
            foreach (var kvp in heldSlots)
            {
                BookedSlots[kvp.Key] = 1;
            }
        }
    }
}
