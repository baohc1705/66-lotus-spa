using _66SMS.Application.Abstractions;
using _66SMS.Application.DTOs.Appointments;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.Services.Appointments
{
    public class AppointmentAvailabilityService : IBookingAvailabilityService
    {
        private readonly IBookingContextProvider contextProvider;

        public AppointmentAvailabilityService(IBookingContextProvider contextProvider)
        {
            this.contextProvider = contextProvider;
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<BookingTechnicianDto>> GetTechniciansAsync(DateOnly date, int serviceId, int? salonId = null, CancellationToken cancellationToken = default)
        {
            // Build context lấy danh sách lên ram xử lý
            var context = await contextProvider.BuildContextAsync(date, serviceId, cancellationToken);
            if (context == null) return [];
            var result = new List<BookingTechnicianDto>();
            var staffSlots = new List<(Staff Staff, int Available)>();
            var staffToProcess = salonId.HasValue
                ? context.ActiveStaff.Where(s => s.SalonId == salonId.Value).ToList()
                : context.ActiveStaff;
            foreach (var staff in staffToProcess)
            {
                if (!context.StaffShiftWindows.TryGetValue(staff.Id, out var windows) || windows.Count == 0)
                    continue;
                var available = CountAvailableStartSlots(context, staff.Id, windows);
                staffSlots.Add((staff, available));
            }

            if (staffSlots.Count == 0) return result;

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
        /// <inheritdoc />
        public async Task<IReadOnlyList<BookingTimeSlotDto>> GetTimeSlotsAsync(DateOnly date, int serviceId, int? staffId, int? salonId = null, CancellationToken cancellationToken = default)
        {
            var context = await contextProvider.BuildContextAsync(date, serviceId, cancellationToken);
            if (context == null) return [];

            // StaffId == null nghĩa là bất kỳ kỹ thuật viên
            if (!staffId.HasValue)
            {
                // Nếu có salonId, chỉ aggregate từ staff thuộc salon đó
                var staffForAggregate = salonId.HasValue
                    ? context.ActiveStaff.Where(s => s.SalonId == salonId.Value).ToList()
                    : (IEnumerable<Staff>)context.ActiveStaff;

                return context.TimeSlots.Select((slot, index) => new BookingTimeSlotDto
                {
                    SlotId = slot.Id,
                    Time = slot.StartTime.ToString("HH:mm"),
                    Status = ResolveAggregatedStatusForStaff(context, index, staffForAggregate)
                }).ToList();
            }

            if (!context.StaffShiftWindows.TryGetValue(staffId.Value, out var windows) || windows.Count == 0)
            {
                return context.TimeSlots.Select(slot => new BookingTimeSlotDto
                {
                    SlotId = slot.Id,
                    Time = slot.StartTime.ToString("HH:mm"),
                    Status = "outside",
                }).ToList();
            }

            return context.TimeSlots.Select((slot, index) => new BookingTimeSlotDto
            {
                SlotId = slot.Id,
                Time = slot.StartTime.ToString("HH:mm"),
                Status = ResolveStaffSlotStatus(context, staffId.Value, index, windows)
            }).ToList();
        }

        /// <inheritdoc />
        public async Task<(int StaffId, int? ScheduleId)?> ResolveStaffAsync(DateOnly date, int serviceId, int? staffId, int startSlotId, CancellationToken ct = default)
        {
            if (staffId.HasValue)
            {
                var context = await contextProvider.BuildContextAsync(date, serviceId, ct);
                if (context == null || !context.StaffShiftWindows.TryGetValue(staffId.Value, out var explWindows) || explWindows.Count == 0)
                    return null;
                var stIndex = FindSlotIndex(context.TimeSlots, startSlotId);
                if (stIndex < 0 || ResolveStaffSlotStatus(context, staffId.Value, stIndex, explWindows) != "available")
                    return null;
                int? schedId = context.StaffScheduleIds.TryGetValue(staffId.Value, out var sid) ? sid : null;
                return (staffId.Value, schedId);
            }

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

        /// <summary>
        /// Tìm vị trí (index) của một slot trong danh sách dựa trên SlotId.
        /// </summary>
        private static int FindSlotIndex(IReadOnlyList<TimeSlot> timeSlots, int startSlotId)
        {
            for (var i = 0; i < timeSlots.Count; i++)
            {
                if (timeSlots[i].Id == startSlotId) return i;
            }
            return -1;
        }
        /// <summary>
        /// Định dạng chuỗi trạng thái số lượng slot còn lại để hiển thị cho UI.
        /// </summary>
        private static string FormatSlotsStatus(int maxAvailable)
        {
            return maxAvailable switch
            {
                0 => "Nghỉ hôm nay",
                1 => "Còn 1 slot",
                _ => $"Còn {maxAvailable} slot",
            };
        }
        /// <summary>
        /// Đếm số lượng khung giờ bắt đầu khả dụng cho một nhân viên.
        /// </summary>
        private static int CountAvailableStartSlots(AppointmentAvailabilityContext context, int staffId, IReadOnlyList<ShiftWindow> windows)
        {
            var count = 0;
            for (var i = 0; i < context.TimeSlots.Count; i++)
            {
                if (ResolveStaffSlotStatus(context, staffId, i, windows) == "available") count++;
            }
            return count;
        }

        /// <summary>
        /// Phân giải trạng thái của một slot cụ thể đối với một nhân viên (khả dụng, đã đặt, ngoài giờ làm).
        /// </summary>
        private static string ResolveStaffSlotStatus(AppointmentAvailabilityContext context, int staffId, int startIndex, IReadOnlyList<ShiftWindow> windows)
        {
            if (windows.Count == 0) return "outside";
            var statuses = windows.Select(w => ResolveStaffSlotStatusForWindow(context, staffId, startIndex, w)).Where(s => s != "outside").ToList();
            if (statuses.Count == 0) return "outside";
            if (statuses.Any(s => s == "available")) return "available";
            if (statuses.All(s => s == "booked")) return "booked";
            return "outside";
        }

        /// <summary>
        /// Phân giải trạng thái của một slot trong một ca làm việc cụ thể.
        /// </summary>
        private static string ResolveStaffSlotStatusForWindow(AppointmentAvailabilityContext context, int staffId, int startIndex, ShiftWindow window)
        {
            if (startIndex + context.SlotsNeeded > context.TimeSlots.Count) return "outside";
            var start = context.TimeSlots[startIndex].StartTime;
            var end = context.TimeSlots[startIndex + context.SlotsNeeded - 1].EndTime;

            if (!(start >= window.ShiftStart && end <= window.ShiftEnd)) return "outside";

            for (var offset = 0; offset < context.SlotsNeeded; offset++)
            {
                var index = startIndex + offset;
                if (index >= context.TimeSlots.Count) return "outside";
                if (context.BookedSlots.TryGetValue((staffId, context.TimeSlots[index].Id), out _)) return "booked";
            }
            return "available";
        }

        /// <summary>
        /// Phân giải trạng thái tổng hợp của một slot cho toàn bộ Spa (nếu có bất kỳ nhân viên nào rảnh thì slot đó rảnh).
        /// </summary>
        private static string ResolveAggregatedStatus(AppointmentAvailabilityContext context, int startIndex)
            => ResolveAggregatedStatusForStaff(context, startIndex, context.ActiveStaff);

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
