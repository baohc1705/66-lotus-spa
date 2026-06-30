using _66SMS.Application.Abstractions;
using _66SMS.Application.DTOs.Appointments;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    // Cung cấp danh sách kỹ thuật viên và khung giờ trống để khách đặt lịch
    public class AppointmentAvailabilityService : IBookingAvailabilityService
    {
        private readonly IBookingContextProvider contextProvider;

        public AppointmentAvailabilityService(IBookingContextProvider contextProvider)
        {
            this.contextProvider = contextProvider;
        }

        // Trả về danh sách kỹ thuật viên kèm số slot còn trống trong ngày
        // Luôn thêm lựa chọn "Bất kỳ" đứng đầu để hệ thống tự chọn người rảnh nhất
        public async Task<IReadOnlyList<BookingTechnicianDto>> GetTechniciansAsync(DateOnly date, int serviceId, int? salonId = null, CancellationToken cancellationToken = default)
        {
            // Build context một lần, load toàn bộ dữ liệu lên RAM để tính toán không cần truy vấn thêm
            var context = await contextProvider.BuildContextAsync(date, serviceId, cancellationToken);
            if (context == null) return [];

            var result = new List<BookingTechnicianDto>();
            var staffSlots = new List<(Staff Staff, int Available)>();

            // Lọc nhân viên theo salon nếu có yêu cầu, ngược lại lấy tất cả
            var staffToProcess = salonId.HasValue
                ? context.ActiveStaff.Where(s => s.StaffSalons != null && s.StaffSalons.Any(ss => ss.SalonId == salonId.Value && ss.Status == StaffSalonConst.STATUS_ACTIVE)).ToList()
                : context.ActiveStaff.ToList();

            foreach (var staff in staffToProcess)
            {
                // Bỏ qua nhân viên không có ca làm trong ngày
                if (!context.StaffShiftWindows.TryGetValue(staff.Id, out var windows) || windows.Count == 0)
                    continue;
                var available = CountAvailableStartSlots(context, staff.Id, windows);
                staffSlots.Add((staff, available));
            }

            if (staffSlots.Count == 0) return result;

            // Lựa chọn "Bất kỳ" hiển thị số slot tốt nhất (người rảnh nhất) để tránh hiểu lầm
            var maxAvailable = staffSlots.Max(x => x.Available);
            result.Add(new BookingTechnicianDto
            {
                Id = null,
                Name = $"Bất kỳ kỹ thuật viên",
                Role = $"Hệ thống tự động chọn người rảnh nhất",
                AccountRole = "STAFF",
                Avatar = string.Empty,
                SlotsLeft = maxAvailable,
                Status = FormatSlotsStatus(maxAvailable),
                IsAny = true,
            });

            // Sắp xếp nhân viên theo số slot còn lại giảm dần để khách thấy người rảnh trước
            foreach (var (staff, available) in staffSlots.OrderByDescending(x => x.Available))
            {
                result.Add(new BookingTechnicianDto
                {
                    Id = staff.Id,
                    Name = staff.FullName,
                    Role = "Kỹ thuật viên",
                    AccountRole = "STAFF",
                    Avatar = staff.AvatarUrl,
                    SlotsLeft = available,
                    Status = FormatSlotsStatus(available),
                    IsAny = false,
                });
            }

            return result;
        }

        // Trả về trạng thái từng slot trong ngày: available, booked, hoặc outside (ngoài giờ làm)
        // Nếu staffId == null thì tổng hợp từ tất cả nhân viên (slot rảnh khi có ít nhất 1 người rảnh)
        public async Task<IReadOnlyList<BookingTimeSlotDto>> GetTimeSlotsAsync(DateOnly date, int serviceId, int? staffId, int? salonId = null, CancellationToken cancellationToken = default)
        {
            var context = await contextProvider.BuildContextAsync(date, serviceId, cancellationToken);
            if (context == null) return [];

            // Chế độ "bất kỳ": tổng hợp trạng thái slot từ nhiều nhân viên
            if (!staffId.HasValue)
            {
                var staffForAggregate = salonId.HasValue
                    ? context.ActiveStaff.Where(s => s.StaffSalons != null && s.StaffSalons.Any(ss => ss.SalonId == salonId.Value && ss.Status == StaffSalonConst.STATUS_ACTIVE)).ToList()
                    : context.ActiveStaff.ToList();

                return context.TimeSlots.Select((slot, index) => new BookingTimeSlotDto
                {
                    SlotId = slot.Id,
                    Time = slot.StartTime.ToString("HH:mm"),
                    Status = ResolveAggregatedStatusForStaff(context, index, staffForAggregate)
                }).ToList();
            }

            // Nhân viên không có ca làm — toàn bộ slot là "outside"
            if (!context.StaffShiftWindows.TryGetValue(staffId.Value, out var windows) || windows.Count == 0)
            {
                return context.TimeSlots.Select(slot => new BookingTimeSlotDto
                {
                    SlotId = slot.Id,
                    Time = slot.StartTime.ToString("HH:mm"),
                    Status = "outside",
                }).ToList();
            }

            // Tính trạng thái từng slot cho đúng nhân viên đã chọn
            return context.TimeSlots.Select((slot, index) => new BookingTimeSlotDto
            {
                SlotId = slot.Id,
                Time = slot.StartTime.ToString("HH:mm"),
                Status = ResolveStaffSlotStatus(context, staffId.Value, index, windows)
            }).ToList();
        }

        // Xác định nhân viên thực sự sẽ phụ trách lịch hẹn và ScheduleId tương ứng
        // Nếu staffId == null thì tự chọn người rảnh nhất tại slot được yêu cầu
        public async Task<(int StaffId, int? ScheduleId)?> ResolveStaffAsync(DateOnly date, int serviceId, int? staffId, int startSlotId, CancellationToken ct = default)
        {
            if (staffId.HasValue)
            {
                // Kiểm tra nhân viên cụ thể có rảnh tại slot đó không
                var context = await contextProvider.BuildContextAsync(date, serviceId, ct);
                if (context == null || !context.StaffShiftWindows.TryGetValue(staffId.Value, out var explWindows) || explWindows.Count == 0)
                    return null;
                var stIndex = FindSlotIndex(context.TimeSlots, startSlotId);
                if (stIndex < 0 || ResolveStaffSlotStatus(context, staffId.Value, stIndex, explWindows) != "available")
                    return null;
                int? schedId = context.StaffScheduleIds.TryGetValue(staffId.Value, out var sid) ? sid : null;
                return (staffId.Value, schedId);
            }

            // Chế độ "bất kỳ": tìm tất cả ứng viên rảnh tại slot đó rồi chọn người có nhiều slot trống nhất
            // ThenBy StaffId để kết quả ổn định khi có nhiều người cùng số slot
            var ctx = await contextProvider.BuildContextAsync(date, serviceId, ct);
            if (ctx == null) return null;
            var startIndex = FindSlotIndex(ctx.TimeSlots, startSlotId);
            if (startIndex < 0) return null;

            var candidates = new List<(int StaffId, int? ScheduleId, int Available)>();
            foreach (var staff in ctx.ActiveStaff)
            {
                if (!ctx.StaffShiftWindows.TryGetValue(staff.Id, out var windows) || windows.Count == 0)
                    continue;
                if (ResolveStaffSlotStatus(ctx, staff.Id, startIndex, windows) != "available")
                    continue;

                ctx.StaffScheduleIds.TryGetValue(staff.Id, out var scheduleId);
                var available = CountAvailableStartSlots(ctx, staff.Id, windows);
                candidates.Add((staff.Id, scheduleId, available));
            }

            var best = candidates.OrderByDescending(c => c.Available).ThenBy(c => c.StaffId).FirstOrDefault();
            return best == default ? null : (best.StaffId, best.ScheduleId);
        }

        // Tìm vị trí index của slot theo SlotId, trả về -1 nếu không tìm thấy
        private static int FindSlotIndex(IReadOnlyList<TimeSlot> timeSlots, int startSlotId)
        {
            for (var i = 0; i < timeSlots.Count; i++)
            {
                if (timeSlots[i].Id == startSlotId) return i;
            }
            return -1;
        }

        // Chuyển số slot còn lại thành chuỗi mô tả ngắn gọn cho UI
        private static string FormatSlotsStatus(int maxAvailable)
        {
            return maxAvailable switch
            {
                0 => "Nghỉ hôm nay",
                1 => "Còn 1 slot",
                _ => $"Còn {maxAvailable} slot",
            };
        }

        // Đếm tổng số slot mà nhân viên có thể bắt đầu nhận lịch (toàn bộ slot trong ngày)
        private static int CountAvailableStartSlots(AppointmentAvailabilityContext context, int staffId, IReadOnlyList<ShiftWindow> windows)
        {
            var count = 0;
            for (var i = 0; i < context.TimeSlots.Count; i++)
            {
                if (ResolveStaffSlotStatus(context, staffId, i, windows) == "available") count++;
            }
            return count;
        }

        // Xác định trạng thái của slot đối với nhân viên, xét qua tất cả ca làm trong ngày
        // available: ít nhất 1 ca có slot đó rảnh
        // booked: tất cả ca đều bị đặt
        // outside: slot không nằm trong bất kỳ ca nào
        private static string ResolveStaffSlotStatus(AppointmentAvailabilityContext context, int staffId, int startIndex, IReadOnlyList<ShiftWindow> windows)
        {
            if (windows.Count == 0) return "outside";

            // Lọc các ca có slot này nằm trong phạm vi giờ, bỏ qua các ca "outside"
            var statuses = windows.Select(w => ResolveStaffSlotStatusForWindow(context, staffId, startIndex, w))
                                  .Where(s => s != "outside")
                                  .ToList();

            if (statuses.Count == 0) return "outside";
            if (statuses.Any(s => s == "available")) return "available";
            if (statuses.All(s => s == "booked")) return "booked";
            return "outside";
        }

        // Kiểm tra slot trong phạm vi một ca cụ thể: slot phải nằm trong giờ ca và không bị đặt
        // SlotsNeeded slot liên tiếp phải đều trống thì mới coi là "available"
        private static string ResolveStaffSlotStatusForWindow(AppointmentAvailabilityContext context, int staffId, int startIndex, ShiftWindow window)
        {
            // Không đủ slot ở cuối danh sách để phục vụ dịch vụ
            if (startIndex + context.SlotsNeeded > context.TimeSlots.Count) return "outside";

            var start = context.TimeSlots[startIndex].StartTime;
            var end = context.TimeSlots[startIndex + context.SlotsNeeded - 1].EndTime;

            // Khoảng thời gian của dịch vụ phải nằm hoàn toàn trong ca làm việc
            if (!(start >= window.ShiftStart && end <= window.ShiftEnd)) return "outside";

            // Kiểm tra từng slot liên tiếp xem có bị chiếm chưa
            for (var offset = 0; offset < context.SlotsNeeded; offset++)
            {
                var index = startIndex + offset;
                if (index >= context.TimeSlots.Count) return "outside";
                if (context.BookedSlots.TryGetValue((staffId, context.TimeSlots[index].Id), out _)) return "booked";
            }
            return "available";
        }

        // Tổng hợp trạng thái slot cho toàn bộ nhân viên đang hoạt động (dùng cho chế độ "bất kỳ")
        private static string ResolveAggregatedStatus(AppointmentAvailabilityContext context, int startIndex)
            => ResolveAggregatedStatusForStaff(context, startIndex, context.ActiveStaff);

        // Tổng hợp trạng thái slot cho một tập nhân viên tùy chỉnh (ví dụ: lọc theo salon)
        // available nếu có ít nhất 1 nhân viên rảnh, booked nếu tất cả đều bận, outside nếu không ai có ca
        private static string ResolveAggregatedStatusForStaff(AppointmentAvailabilityContext context, int startIndex, IEnumerable<Staff> staffSubset)
        {
            var statuses = staffSubset
                .Where(s => context.StaffShiftWindows.TryGetValue(s.Id, out var w) && w.Count > 0)
                .Select(s => ResolveStaffSlotStatus(context, s.Id, startIndex, context.StaffShiftWindows[s.Id]))
                .ToList();

            if (statuses.Count == 0) return "outside";
            if (statuses.Any(s => s == "available")) return "available";
            if (statuses.All(s => s == "booked")) return "booked";
            return "outside";
        }
    }
}
