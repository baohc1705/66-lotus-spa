using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.SalonService.Helpers
{
    /// <summary>
    /// Quy đổi chấm công ra số công:
    /// - Nghỉ phép / nghỉ lễ = 1 công
    /// - Nghỉ không lương / vắng = 0 công
    /// - Theo số giờ làm: >= 8h = 1, >= 4h = 0.5, 4h = 0
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
            return CalculateWorkCredit(
                attendance.Status,
                attendance.WorkedHours,
                attendance.CheckInAt,
                attendance.CheckOutAt);
        }

        public static decimal CalculateWorkCredit(
            int status,
            decimal workedHours,
            DateTimeOffset? checkInAt,
            DateTimeOffset? checkOutAt)
        {
            if (status == AttendanceConst.STATUS_PAID_LEAVE || status == AttendanceConst.STATUS_HOLIDAY)
                return 1.0m;

            if (status == AttendanceConst.STATUS_ABSENT || status == AttendanceConst.STATUS_UNPAID_LEAVE)
                return 0m;

            if (!checkInAt.HasValue || !checkOutAt.HasValue)
            {
                if (status == AttendanceConst.STATUS_CHECKED_OUT)
                    return 1.0m;
                return 0m;
            }

            return ConvertHoursToWorkCredit(workedHours);
        }

        public static decimal ConvertHoursToWorkCredit(decimal workedHours)
        {
            if (workedHours >= PayrollConst.STANDARD_HOURS_PER_DAY)
                return 1.0m;
            if (workedHours >= PayrollConst.HALF_DAY_THRESHOLD)
                return 0.5m;
            return 0m;
        }
    }
}
