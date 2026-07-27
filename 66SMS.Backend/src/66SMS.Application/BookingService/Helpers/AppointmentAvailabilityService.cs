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
        // ActiveStaff trong context đã được lọc theo dịch vụ (StaffService); thêm lọc salon nếu có
        public async Task<IReadOnlyList<BookingTechnicianDto>> GetTechniciansAsync(DateOnly date, int serviceId, int? salonId = null, CancellationToken cancellationToken = default)
        {
            // Build context một lần, load toàn bộ dữ liệu lên RAM để tính toán không cần truy vấn thêm
            var context = await contextProvider.BuildContextAsync(date, serviceId, cancellationToken: cancellationToken);
            if (context == null) return [];

            var result = new List<BookingTechnicianDto>();
            var staffSlots = new List<(Staff Staff, int Available)>();

            // Lọc nhân viên theo salon (điều kiện 1) — dịch vụ đã lọc sẵn trong context (điều kiện 2)
            var staffToProcess = FilterBySalon(context.ActiveStaff, salonId);

            foreach (var staff in staffToProcess)
            {
                // Bỏ qua nhân viên không có ca làm trong ngày
                if (!context.StaffShiftWindows.TryGetValue(staff.Id, out var windows) || windows.Count == 0)
                    continue;
                // Đếm chỗ bắt đầu được DV hiện tại (đủ SlotsNeeded liên tiếp)
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

        // Trả về trạng thái từng slot trên lưới: available / booked / outside
        // "booked" chỉ khi CHÍNH ô đó bị chiếm — không khóa ô trước chỉ vì DV dài đụng ô phía sau
        public async Task<IReadOnlyList<BookingTimeSlotDto>> GetTimeSlotsAsync(DateOnly date, int serviceId, int? staffId, int? salonId = null, CancellationToken cancellationToken = default)
        {
            var context = await contextProvider.BuildContextAsync(date, serviceId, cancellationToken: cancellationToken);
            if (context == null) return [];

            // Chế độ "bất kỳ": tổng hợp trạng thái slot từ nhiều nhân viên (đã đủ salon + dịch vụ)
            if (!staffId.HasValue)
            {
                var staffForAggregate = FilterBySalon(context.ActiveStaff, salonId);

                return context.TimeSlots.Select((slot, index) => new BookingTimeSlotDto
                {
                    SlotId = slot.Id,
                    Time = slot.StartTime.ToString("HH:mm"),
                    Status = ResolveAggregatedDisplayStatus(context, index, staffForAggregate)
                }).ToList();
            }

            // Nhân viên không làm được dịch vụ / không thuộc salon / không có ca
            if (!IsStaffEligible(context, staffId.Value, salonId)
                || !context.StaffShiftWindows.TryGetValue(staffId.Value, out var windows)
                || windows.Count == 0)
            {
                return context.TimeSlots.Select(slot => new BookingTimeSlotDto
                {
                    SlotId = slot.Id,
                    Time = slot.StartTime.ToString("HH:mm"),
                    Status = "outside",
                }).ToList();
            }

            // Hiển thị theo chiếm dụng từng ô (không theo SlotsNeeded của DV đang xem)
            return context.TimeSlots.Select((slot, index) => new BookingTimeSlotDto
            {
                SlotId = slot.Id,
                Time = slot.StartTime.ToString("HH:mm"),
                Status = ResolveDisplaySlotStatus(context, staffId.Value, index, windows)
            }).ToList();
        }

        // Xác định nhân viên thực sự sẽ phụ trách lịch hẹn và ScheduleId tương ứng
        // Phải đủ SlotsNeeded liên tiếp trống tại startSlotId (validate lúc khóa/đặt)
        public async Task<(int StaffId, int? ScheduleId)?> ResolveStaffAsync(
            DateOnly date,
            int serviceId,
            int? staffId,
            int startSlotId,
            int? salonId = null,
            int? excludeLockId = null,
            CancellationToken ct = default)
        {
            if (staffId.HasValue)
            {
                // Kiểm tra nhân viên cụ thể: phải làm được dịch vụ + thuộc salon + đủ slot liên tiếp
                var context = await contextProvider.BuildContextAsync(date, serviceId, excludeLockId, ct);
                if (context == null || !IsStaffEligible(context, staffId.Value, salonId))
                    return null;
                if (!context.StaffShiftWindows.TryGetValue(staffId.Value, out var explWindows) || explWindows.Count == 0)
                    return null;
                var stIndex = FindSlotIndex(context.TimeSlots, startSlotId);
                if (stIndex < 0 || !CanStartServiceHere(context, staffId.Value, stIndex, explWindows))
                    return null;
                int? schedId = context.StaffScheduleIds.TryGetValue(staffId.Value, out var sid) ? sid : null;
                return (staffId.Value, schedId);
            }

            // Chế độ "bất kỳ": tìm tất cả ứng viên rảnh tại slot đó rồi chọn người có nhiều chỗ bắt đầu DV nhất
            var ctx = await contextProvider.BuildContextAsync(date, serviceId, excludeLockId, ct);
            if (ctx == null) return null;
            var startIndex = FindSlotIndex(ctx.TimeSlots, startSlotId);
            if (startIndex < 0) return null;

            var candidates = new List<(int StaffId, int? ScheduleId, int Available)>();
            foreach (var staff in FilterBySalon(ctx.ActiveStaff, salonId))
            {
                if (!ctx.StaffShiftWindows.TryGetValue(staff.Id, out var windows) || windows.Count == 0)
                    continue;
                if (!CanStartServiceHere(ctx, staff.Id, startIndex, windows))
                    continue;

                ctx.StaffScheduleIds.TryGetValue(staff.Id, out var scheduleId);
                var available = CountAvailableStartSlots(ctx, staff.Id, windows);
                candidates.Add((staff.Id, scheduleId, available));
            }

            var best = candidates.OrderByDescending(c => c.Available).ThenBy(c => c.StaffId).FirstOrDefault();
            return best == default ? null : (best.StaffId, best.ScheduleId);
        }

        // NV đủ điều kiện: có trong ActiveStaff (đã filter StaffService) + thuộc salon nếu có
        private static bool IsStaffEligible(AppointmentAvailabilityContext context, int staffId, int? salonId)
        {
            var staff = context.ActiveStaff.FirstOrDefault(s => s.Id == staffId);
            if (staff == null) return false;
            if (!salonId.HasValue) return true;
            return staff.StaffSalons != null
                && staff.StaffSalons.Any(ss => ss.SalonId == salonId.Value && ss.Status == StaffSalonConst.STATUS_ACTIVE);
        }

        // Lọc nhân viên theo salon đang chọn (StaffSalon active)
        private static List<Staff> FilterBySalon(IReadOnlyList<Staff> staff, int? salonId)
        {
            if (!salonId.HasValue) return staff.ToList();
            return staff
                .Where(s => s.StaffSalons != null
                    && s.StaffSalons.Any(ss => ss.SalonId == salonId.Value && ss.Status == StaffSalonConst.STATUS_ACTIVE))
                .ToList();
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
        private static int CountAvailableStartSlots(AppointmentAvailabilityContext context, int staffId, IReadOnlyList<ShiftWindow> windows)
        {
            var count = 0;
            for (var i = 0; i < context.TimeSlots.Count; i++)
            {
                if (CanStartServiceHere(context, staffId, i, windows)) count++;
            }
            return count;
        }

        // booked chỉ khi chính ô startIndex bị chiếm; không vì ô phía sau bị khóa
        private static string ResolveDisplaySlotStatus(
            AppointmentAvailabilityContext context,
            int staffId,
            int startIndex,
            IReadOnlyList<ShiftWindow> windows)
        {
            if (windows.Count == 0) return "outside";

            var statuses = windows
                .Select(w => ResolveDisplaySlotStatusForWindow(context, staffId, startIndex, w))
                .Where(s => s != "outside")
                .ToList();

            if (statuses.Count == 0) return "outside";
            if (statuses.Any(s => s == "available")) return "available";
            if (statuses.All(s => s == "booked")) return "booked";
            return "outside";
        }

        private static string ResolveDisplaySlotStatusForWindow(
            AppointmentAvailabilityContext context,
            int staffId,
            int startIndex,
            ShiftWindow window)
        {
            if (startIndex < 0 || startIndex >= context.TimeSlots.Count) return "outside";

            var slot = context.TimeSlots[startIndex];
            if (!(slot.StartTime >= window.ShiftStart && slot.EndTime <= window.ShiftEnd))
                return "outside";

            return IsSlotOccupied(context, staffId, startIndex) ? "booked" : "available";
        }

        private static string ResolveAggregatedDisplayStatus(
            AppointmentAvailabilityContext context,
            int startIndex,
            IEnumerable<Staff> staffSubset)
        {
            var statuses = staffSubset
                .Where(s => context.StaffShiftWindows.TryGetValue(s.Id, out var w) && w.Count > 0)
                .Select(s => ResolveDisplaySlotStatus(context, s.Id, startIndex, context.StaffShiftWindows[s.Id]))
                .ToList();

            if (statuses.Count == 0) return "outside";
            if (statuses.Any(s => s == "available")) return "available";
            if (statuses.All(s => s == "booked")) return "booked";
            return "outside";
        }

        private static bool IsSlotOccupied(AppointmentAvailabilityContext context, int staffId, int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= context.TimeSlots.Count) return true;
            return context.BookedSlots.TryGetValue((staffId, context.TimeSlots[slotIndex].Id), out _);
        }

        private static bool CanStartServiceHere(
            AppointmentAvailabilityContext context,
            int staffId,
            int startIndex,
            IReadOnlyList<ShiftWindow> windows)
        {
            if (windows.Count == 0) return false;
            return windows.Any(w => CanStartServiceHereForWindow(context, staffId, startIndex, w));
        }

        private static bool CanStartServiceHereForWindow(
            AppointmentAvailabilityContext context,
            int staffId,
            int startIndex,
            ShiftWindow window)
        {
            if (startIndex + context.SlotsNeeded > context.TimeSlots.Count) return false;

            var start = context.TimeSlots[startIndex].StartTime;
            var end = context.TimeSlots[startIndex + context.SlotsNeeded - 1].EndTime;

            if (!(start >= window.ShiftStart && end <= window.ShiftEnd)) return false;

            for (var offset = 0; offset < context.SlotsNeeded; offset++)
            {
                if (IsSlotOccupied(context, staffId, startIndex + offset)) return false;
            }
            return true;
        }
    }
}
