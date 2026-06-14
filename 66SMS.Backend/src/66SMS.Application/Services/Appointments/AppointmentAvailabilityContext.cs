using _66SMS.Domain.Entities;

namespace _66SMS.Application.Services.Appointments
{
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

        public AppointmentAvailabilityContext(DateOnly date, int durationMins, int slotsNeeded, IReadOnlyList<TimeSlot> timeSlots, IReadOnlyList<Staff> activeStaff, Dictionary<int, List<ShiftWindow>> staffShiftWindows, Dictionary<int, int> staffScheduleIds, Dictionary<(int StaffId, int SlotId), byte> bookedSlots, Dictionary<(int StaffId, int SlotId), byte> heldSlots)
        {

            Date = date;
            DurationMins = durationMins;
            SlotsNeeded = slotsNeeded;
            TimeSlots = timeSlots;
            ActiveStaff = activeStaff;
            StaffShiftWindows = staffShiftWindows;
            StaffScheduleIds = staffScheduleIds;
            BookedSlots = bookedSlots;

            // Hợp nhất Lock vào booked
            foreach (var kvp in heldSlots)
            {
                BookedSlots[kvp.Key] = 1;
            }
        }
    }
}
