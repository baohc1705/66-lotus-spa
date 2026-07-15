using _66SMS.Application.DTOs.Attendances;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.SalonService.Helpers
{
    public static class AttendanceMapper
    {
        public static AttendanceDTO ToDto(Attendance x)
        {
            var dto = new AttendanceDTO
            {
                Id = x.Id,
                StaffId = x.StaffId,
                StaffName = x.Staff?.FullName,
                SalonId = x.SalonId,
                SalonName = x.Salon?.Name,
                WorkScheduleId = x.WorkScheduleId,
                WorkDate = x.WorkDate,
                CheckInAt = x.CheckInAt,
                CheckOutAt = x.CheckOutAt,
                WorkedHours = x.WorkedHours,
                Status = x.Status,
                Note = x.Note,
                ShiftName = x.WorkSchedule?.ShiftPeriod?.Shift?.Name,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
            };
            dto.WorkCredits = AttendanceWorkCreditCalculator.CalculateWorkCredit(x);
            return dto;
        }
    }
}
