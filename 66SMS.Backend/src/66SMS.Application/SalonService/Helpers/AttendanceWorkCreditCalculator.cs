using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.SalonService.Helpers
{
    /// <summary>
    /// Quy đổi chấm công ra số công theo quy định:
    /// - Nghỉ phép / nghỉ lễ = 1 công
    /// - Nghỉ không lương / vắng = 0 công
    /// - Đủ ca: >= 8h = 1, >= 4h = 0.5, &lt; 4h = 0
    /// - Đi muộn quá 1 giờ so với ca làm: tối đa 0.5 công
    /// </summary>
    public static class AttendanceWorkCreditCalculator
    {
        public static bool IsManualStatus(int status) =>
            status == AttendanceConst.STATUS_ABSENT
            || status == AttendanceConst.STATUS_PAID_LEAVE
            || status == AttendanceConst.STATUS_HOLIDAY
            || status == AttendanceConst.STATUS_UNPAID_LEAVE;

        public static decimal CalculateWorkCredit(Attendance attendance)
        {
            var shiftStart = attendance.WorkSchedule?.ShiftPeriod?.ShiftStart;
            return CalculateWorkCredit(
                attendance.Status,
                attendance.WorkedHours,
                attendance.CheckInAt,
                attendance.CheckOutAt,
                shiftStart);
        }

        public static decimal CalculateWorkCredit(
            int status,
            decimal workedHours,
            DateTime? checkInAt,
            DateTime? checkOutAt,
            TimeOnly? shiftStart)
        {
            if (status == AttendanceConst.STATUS_PAID_LEAVE || status == AttendanceConst.STATUS_HOLIDAY)
                return 1.0m;

            if (status == AttendanceConst.STATUS_ABSENT || status == AttendanceConst.STATUS_UNPAID_LEAVE)
                return 0m;

            if (!checkInAt.HasValue || !checkOutAt.HasValue)
                return 0m;

            var hoursBasedCredit = ConvertHoursToWorkCredit(workedHours);
            var scheduledStart = GetScheduledStart(checkInAt.Value, shiftStart);
            var lateHours = (checkInAt.Value - scheduledStart).TotalHours;

            if (lateHours > (double)PayrollConst.LATE_THRESHOLD_HOURS)
                return Math.Min(hoursBasedCredit, 0.5m);

            return hoursBasedCredit;
        }

        public static decimal ConvertHoursToWorkCredit(decimal workedHours)
        {
            if (workedHours >= PayrollConst.STANDARD_HOURS_PER_DAY)
                return 1.0m;
            if (workedHours >= PayrollConst.HALF_DAY_THRESHOLD)
                return 0.5m;
            return 0m;
        }

        private static DateTime GetScheduledStart(DateTime checkInAt, TimeOnly? shiftStart)
        {
            var startTime = shiftStart ?? PayrollConst.DEFAULT_SHIFT_START;
            return checkInAt.Date.Add(startTime.ToTimeSpan());
        }
    }
}
