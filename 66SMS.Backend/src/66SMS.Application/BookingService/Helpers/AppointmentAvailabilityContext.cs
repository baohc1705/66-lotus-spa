using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    // Đại diện cho một khung giờ làm việc của nhân viên trong ca (giờ bắt đầu ca và giờ kết thúc ca)
    public sealed record ShiftWindow(TimeOnly ShiftStart, TimeOnly ShiftEnd);
    public sealed class AppointmentAvailabilityContext
    {
        public DateOnly Date { get; }
        public int DurationMins { get; }
        public int SlotsNeeded { get; }
        public IReadOnlyList<TimeSlot> TimeSlots { get; }
        public IReadOnlyList<Staff> ActiveStaff { get; }
        public Dictionary<int, List<ShiftWindow>> StaffShiftWindows { get; }
        public Dictionary<int, int> StaffScheduleIds { get; }

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

           
            foreach (var kvp in heldSlots)
            {
                BookedSlots[kvp.Key] = 1;
            }
        }
    }
}
