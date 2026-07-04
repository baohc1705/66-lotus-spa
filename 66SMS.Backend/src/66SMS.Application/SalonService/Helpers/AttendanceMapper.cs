using _66SMS.Application.DTOs.Attendances;
using _66SMS.Application.SalonService.Helpers;
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
                WorkDate = x.WorkDate.ToString(),
                CheckInAt = x.CheckInAt?.ToString(),
                CheckOutAt = x.CheckOutAt?.ToString(),
                WorkedHours = x.WorkedHours,
                Status = x.Status,
                Note = x.Note,
                ShiftName = x.WorkSchedule?.ShiftPeriod?.Shift?.Name,
                CreatedAt = x.CreatedAt.ToString(),
                UpdatedAt = x.UpdatedAt?.ToString(),
            };
            dto.WorkCredits = AttendanceWorkCreditCalculator.CalculateWorkCredit(x);
            return dto;
        }
    }
}
